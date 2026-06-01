// src/models/AiTraffic.js
import mongoose from 'mongoose';

const AiTrafficSchema = new mongoose.Schema({
    // === Идентификация бота ===
    bot: {
        type: String,
        required: true,
        trim: true,
        index: true,
        enum: [
            'Google-Extended', 'GPTBot', 'CCBot', 'Omgilibot', 'FacebookBot',
            'YandexAccessibilityBot', 'BingPreview', 'Applebot-Extended',
            'Bytespider', 'ImagesiftBot', 'PerplexityBot', 'ClaudeBot', 'YouBot',
            'unknown'
        ]
    },

    // === Страница и запрос ===
    page: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    query: {
        type: String,
        trim: true,
        default: null
    },

    // === Технические данные ===
    userAgent: {
        type: String,
        trim: true,
        default: 'unknown'
    },
    ip: {
        type: String,
        trim: true,
        default: 'unknown',
        // Не индексируем IP для приватности, но можно добавить хэш для аналитики
    },
    ipHash: {
        type: String,
        trim: true,
        index: true // Хэш для подсчёта уникальных посетителей без хранения реальных IP
    },

    // === Временные метки ===
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    },

    // === Метаданные ===
    referrer: {
        type: String,
        trim: true,
        default: null
    },
    language: {
        type: String,
        trim: true,
        default: 'ru'
    },
    country: {
        type: String,
        trim: true,
        default: 'RU'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// === Индексы для быстрых запросов ===
// Композитный индекс для частых запросов: бот + страница + время
AiTrafficSchema.index({ bot: 1, page: 1, timestamp: -1 });

// Индекс для агрегации по датам
AiTrafficSchema.index({ timestamp: -1 });

// Индекс для поиска по хэшу IP (уникальные посетители)
AiTrafficSchema.index({ ipHash: 1 });

// === Виртуальные поля ===
// Группировка по часам для аналитики
AiTrafficSchema.virtual('hourBucket').get(function () {
    return this.timestamp ? new Date(this.timestamp).toISOString().slice(0, 13) : null;
});

// === Middleware: авто-генерация хэша IP перед сохранением ===
AiTrafficSchema.pre('save', function (next) {
    if (this.isModified('ip') && this.ip && this.ip !== 'unknown') {
        // Простой хэш для анонимизации (в продакшене используйте crypto.createHash)
        try {
            let hash = 0;
            for (let i = 0; i < this.ip.length; i++) {
                const char = this.ip.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            this.ipHash = `h${Math.abs(hash).toString(36)}`;
        } catch (e) {
            this.ipHash = 'unknown';
        }
    }
    next();
});

// === Методы для аналитики ===
AiTrafficSchema.statics.getStats = async function ({ startDate, endDate, limit = 100 } = {}) {
    const match = {};
    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = new Date(startDate);
        if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    return await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$bot',
                count: { $sum: 1 },
                pages: { $addToSet: '$page' },
                firstSeen: { $min: '$timestamp' },
                lastSeen: { $max: '$timestamp' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

AiTrafficSchema.statics.getPageStats = async function (page, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return await this.aggregate([
        {
            $match: {
                page,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    bot: '$bot',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                },
                count: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$ipHash' }
            }
        },
        {
            $group: {
                _id: '$_id.bot',
                dailyStats: {
                    $push: {
                        date: '$_id.date',
                        count: '$count',
                        uniqueVisitors: { $size: '$uniqueVisitors' }
                    }
                },
                total: { $sum: '$count' }
            }
        },
        { $sort: { total: -1 } }
    ]);
};

// === TTL индекс для авто-очистки старых записей (опционально) ===
// Раскомментируйте, если хотите авто-удаление записей старше 90 дней:
// AiTrafficSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.models.AiTraffic || mongoose.model('AiTraffic', AiTrafficSchema);