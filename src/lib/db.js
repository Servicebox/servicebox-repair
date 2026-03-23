// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Кэш подключения
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  // Если БД не настроена — не падаем при билде
  if (!MONGODB_URI) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('⚠️ MONGODB_URI not set during build - skipping DB');
      return null;
    }
    throw new Error('MONGODB_URI is required in .env.local');
  }

  // Возвращаем кэш, если есть
  if (cached.conn) return cached.conn;

  // Создаём промис подключения, если нет
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .then((mongoose) => {
        console.log('✅ MongoDB connected');
        return mongoose;
      })
      .catch((err) => {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
          console.warn('⚠️ MongoDB unavailable during build:', err.message);
          return null;
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}