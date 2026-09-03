// src/server.js
// ==========================================
// 1. ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ==========================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.production';
const envPath = path.join(__dirname, '../', envFile);

console.log(`📂 Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('❌ JWT_SECRET is not set (или короче 16 символов)');
  process.exit(1);
}

// ==========================================
// 1b. ФИЛЬТР ШУМА В STDERR (только прод)
// ==========================================
// Next.js пишет в stderr два безобидных внутренних сообщения на каждый
// POST с невалидным Next-Action: "Failed to find Server Action ..." и
// "Server Reference ID did not match ...". Их массово генерируют боты
// (Next-Action: "x") и браузеры со старым кэшем после редеплоя — за месяц
// в err-логе накопилось 23k+ таких строк, реальные ошибки в них тонут.
// Глушим ровно эти два паттерна; всё остальное (в т.ч. наши ❌-логи и
// стектрейсы) уходит в stderr без изменений. Раз в 5 минут пишем сводку
// со счётчиком — чтобы устойчивый всплеск после редеплоя (реальная
// рассинхронизация бандла у живых пользователей) был всё-таки виден.
// В dev фильтр не ставим — там это сообщение нужно при разработке actions.
if (process.env.NODE_ENV === 'production') {
  const NEXT_STDERR_NOISE =
    /Failed to find Server Action|Server Reference ID did not match the expected format/;
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  let noiseDropped = 0;
  let noiseWindowStart = Date.now();
  const NOISE_REPORT_MS = 5 * 60 * 1000;

  process.stderr.write = function (chunk, encoding, cb) {
    try {
      const s =
        typeof chunk === 'string'
          ? chunk
          : Buffer.isBuffer(chunk)
            ? chunk.toString('utf8')
            : '';
      if (s && NEXT_STDERR_NOISE.test(s)) {
        noiseDropped += 1;
        const now = Date.now();
        if (now - noiseWindowStart >= NOISE_REPORT_MS) {
          const n = noiseDropped;
          const mins = Math.round((now - noiseWindowStart) / 60000);
          noiseDropped = 0;
          noiseWindowStart = now;
          origStderrWrite(
            `[stderr-filter] проглочено ${n} строк "Failed to find Server Action" за ~${mins} мин\n`
          );
        }
        const done = typeof encoding === 'function' ? encoding : cb;
        if (typeof done === 'function') done();
        return true;
      }
    } catch {
      /* фильтр не должен ломать логирование — при любой ошибке пишем как обычно */
    }
    return origStderrWrite(chunk, encoding, cb);
  };
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
// По умолчанию слушаем только loopback — прод стоит за nginx (proxy_pass
// http://localhost:3000), прямой доступ к порту 3000 снаружи не нужен и
// раньше был открыт всему интернету (0.0.0.0), см. аудит безопасности
// 2026-08-24. HOST=0.0.0.0 можно переопределить явно при необходимости.
const HOST = process.env.HOST || '127.0.0.1';

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
  const helmetOptions = {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  };
  const compressionOptions = {
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  };

  if (!dev) {
    expressApp.use(helmet(helmetOptions));
    expressApp.use(compression(compressionOptions));
    console.log(' Compression enabled (gzip/deflate)');
  }

  // /api/* маршруты обрабатываются Next.js напрямую (см. createServer ниже),
  // в обход expressApp — иначе express.json()/urlencoded() читают тело
  // запроса раньше Route Handler'ов и POST-запросы в API ломаются. Но это
  // заодно пропускало и compression — ответы вроде /api/calculator-config
  // (90+ КБ) уходили несжатыми. Отдельный лёгкий пайплайн — только
  // helmet+compression, без парсинга тела — чинит это, не трогая API.
  const apiMiddleware = express();
  if (!dev) {
    apiMiddleware.use(helmet(helmetOptions));
    apiMiddleware.use(compression(compressionOptions));
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
      apiMiddleware(req, res, () => handle(req, res, parsedUrl));
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
  server.listen(PORT, HOST, (err) => {
    if (err) throw err;
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🚀 SERVICEBOX-REPAIR STARTED SUCCESSFULLY                  ║
╠══════════════════════════════════════════════════════════════╣
║  📡 URL:        http://${HOST}:${PORT}                      ║
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