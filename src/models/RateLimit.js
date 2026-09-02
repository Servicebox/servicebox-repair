// models/RateLimit.js
// Счётчики попыток для rate-limiting чувствительных эндпоинтов
// (вход, регистрация, сброс пароля и т.п.). Хранится в Mongo, чтобы
// работать на нескольких инстансах и переживать рестарт.
import mongoose from 'mongoose';

const rateLimitSchema = new mongoose.Schema(
  {
    // `${bucket}:${identifier}`, напр. "login-ip:1.2.3.4" или "login-fail:user@x.ru"
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    // окончание окна; TTL-индекс сам удалит документ после этого момента
    resetAt: { type: Date, required: true },
  },
  { versionKey: false }
);

// Автоочистка истёкших окон.
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);
