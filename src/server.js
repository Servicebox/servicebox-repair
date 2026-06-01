// src/server.js
// ==========================================
// 1. ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ==========================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
const envPath = path.join(__dirname, '../', envFile);

console.log(`📂 Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

// ==========================================
// 2. ИМПОРТЫ
// ==========================================
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import mongoose from 'mongoose';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dbConnect from './lib/db.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// === Опции MongoDB ===
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  family: 4,
};

// === Функция подключения к MongoDB ===
async function connectToDatabase() {
  try {
    await dbConnect();
    console.log(' Database ready for server');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectToDatabase, 5000);
  }
}

// === Graceful shutdown ===
function gracefulShutdown(server) {
  console.log('🛑 Received shutdown signal, closing connections...');

  server.close(async () => {
    console.log('📡 HTTP server closed');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🗄️ MongoDB connection closed');
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
}

// === ЗАПУСК ПРИЛОЖЕНИЯ ===
app.prepare().then(async () => {
  await connectToDatabase();

  // === Express приложение с middleware ===
  const expressApp = express();

  // === СЖАТИЕ (compression) - важно для продакшена ===
  if (!dev) {
    // Helmet - безопасность
    expressApp.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    // Compression - сжатие ответов
    expressApp.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    }));

    console.log(' Compression enabled (gzip/deflate)');
  }

  expressApp.use(cookieParser());
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // === КЭШИРОВАНИЕ СТАТИКИ ===
  expressApp.use('/_next/static', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    next();
  });

  expressApp.use('/images', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    next();
  });

  // ==========================================
  // HEALTH CHECK ENDPOINTS
  // ==========================================

  expressApp.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[dbState] || 'unknown';

    res.status(dbState === 1 ? 200 : 503).json({
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      service: 'servicebox-repair',
      environment: process.env.NODE_ENV,
      compression: !dev,
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'serviceboxdb',
      },
    });
  });

  expressApp.get('/health/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // ==========================================
  // СОЗДАНИЕ HTTP СЕРВЕРА С ПРАВИЛЬНЫМ МАРШРУТИЗАТОРОМ
  // ==========================================
  const server = createServer((req, res) => {

    if (req.url.startsWith('/api')) {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
      return;
    }

    // Для остальных запросов — сначала Express, потом Next.js
    expressApp(req, res, (err) => {
      if (err) {
        console.error('Middleware error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      if (!res.writableEnded) {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }
    });
  });

  // === Обработка сигналов ===
  process.on('SIGTERM', () => gracefulShutdown(server));
  process.on('SIGINT', () => gracefulShutdown(server));

  // === Запуск ===
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🚀 SERVICEBOX-REPAIR STARTED SUCCESSFULLY                  ║
╠══════════════════════════════════════════════════════════════╣
║  📡 URL:        http://localhost:${PORT}                      ║
║  💚 Health:     http://localhost:${PORT}/health               ║
║  🔧 Environment: ${(process.env.NODE_ENV || 'production').padEnd(20)}║
║  🗄️  Database:   ${mongoose.connection.readyState === 1 ? 'connected' : 'connecting'}                ║
║  📦 Compression: ${!dev ? 'enabled (gzip)' : 'disabled'}                     ║
║  🚀 Next.js:     ${dev ? 'production' : 'production'} mode                     ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}).catch((err) => {
  console.error('❌ Fatal error starting server:', err);
  process.exit(1);
});