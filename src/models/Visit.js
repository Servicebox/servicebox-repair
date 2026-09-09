// models/Visit.js
// Лёгкий собственный счётчик посещений для админского дашборда
// (/admin-panel/analytics). Дублирует часть данных Яндекс.Метрики, но
// доступен без внешнего кабинета и без cookie. PII не хранит.
import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema(
  {
    page: { type: String, maxlength: 512 },
    referrer: { type: String, maxlength: 512 },
    device: { type: String, maxlength: 32, default: 'desktop' },
    browser: { type: String, maxlength: 64, default: 'unknown' },
    // Анонимный id посетителя из localStorage (не кука, не PII) — только для
    // грубой оценки «уникальных».
    visitorId: { type: String, maxlength: 64 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ts: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Один индекс по времени: обслуживает и диапазонные выборки дашборда, и
// TTL-автоудаление (коллекция не растёт бесконечно; 180 дней истории с
// запасом хватает для периодов «сегодня / неделя / месяц»).
VisitSchema.index({ ts: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export default mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
