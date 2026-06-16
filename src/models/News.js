// src/models/News.js
import mongoose from 'mongoose';
import { BASE_URL } from '@/lib/constants';
const ContentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'youtube', 'heading', 'list'],
    required: true
  },
  content: { type: String },
  media: { type: String },
  description: { type: String },
  mediaType: { type: String },
  position: { type: Number, default: 0 },
  videoUrl: { type: String },
  thumbnail: { type: String },
  alt: { type: String } // для изображений
});

const NewsSchema = new mongoose.Schema({
  // === Основные поля ===
  title: {
    type: String,
    required: [true, 'Заголовок обязателен'],
    trim: true,
    maxlength: [200, 'Заголовок не может превышать 200 символов']
  },

  // === Слаг для SEO-ссылок ===
  slug: {
    type: String,
    unique: true,
    sparse: true, // разрешает null для черновиков
    lowercase: true,
    trim: true,
    index: true
  },

  // === Контент ===
  contentBlocks: [ContentBlockSchema],
  excerpt: {
    type: String,
    maxlength: [300, 'Анонс не может превышать 300 символов'],
    trim: true
  },
  featuredImage: { type: String },

  // === SEO-метаданные ===
  metaTitle: {
    type: String,
    maxlength: [70, 'Meta title не должен превышать 70 символов'],
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description не должен превышать 160 символов'],
    trim: true
  },
  keywords: [{ type: String, trim: true }],

  // === Публикация ===
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },

  // === Дополнительно ===
  author: { type: String, default: 'ServiceBox' },
  allowVideos: { type: Boolean, default: true },
  views: { type: Number, default: 0 },

  // === Временные метки ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// === Индексы для быстрого поиска ===
NewsSchema.index({ slug: 1, isPublished: 1 });
NewsSchema.index({ publishedAt: -1, isPublished: 1 });
NewsSchema.index({ title: 'text', excerpt: 'text', metaDescription: 'text', keywords: 'text' });

// === Виртуальные поля ===
NewsSchema.virtual('url').get(function () {
  return `/news/${this.slug}`;
});

NewsSchema.virtual('fullUrl').get(function () {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
  return `${baseUrl}/news/${this.slug}`;
});

// === Middleware: авто-генерация слага и анонса ===
NewsSchema.pre('save', async function (next) {
  // Генерация слага из заголовка, если не задан
  if (this.isModified('title') && !this.slug) {
    const { generateSlug } = await import('@/lib/slugify');
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Проверка уникальности
    while (await mongoose.models.News.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  // Авто-генерация анонса из первого текстового блока
  if (this.isModified('contentBlocks') && !this.excerpt) {
    const textBlock = this.contentBlocks?.find(b => b.type === 'text' && b.content);
    if (textBlock?.content) {
      this.excerpt = textBlock.content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);
      if (textBlock.content.length > 300) {
        this.excerpt += '...';
      }
    }
  }

  // Установка даты публикации при первом опубликовании
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Обновление updatedAt
  if (this.isModified()) {
    this.updatedAt = new Date();
  }

  next();
});

// === Методы экземпляра ===
NewsSchema.methods.getSeoData = function () {
  return {
    title: this.metaTitle || `${this.title} | ServiceBox Вологда`,
    description: this.metaDescription || this.excerpt,
    keywords: this.keywords?.join(', '),
    url: this.fullUrl,
    image: this.featuredImage,
    publishedTime: this.publishedAt || this.createdAt,
    modifiedTime: this.updatedAt,
    author: this.author,
  };
};

NewsSchema.methods.getJsonLd = function () {
  const textContent = this.contentBlocks
    ?.filter(b => b.type === 'text')
    .map(b => b.content)
    .join(' ') || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: this.title,
    description: this.excerpt,
    image: this.featuredImage ? [this.featuredImage] : undefined,
    datePublished: this.publishedAt?.toISOString() || this.createdAt?.toISOString(),
    dateModified: this.updatedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: this.author || 'ServiceBox',
      url: BASE_URL,
    },
    publisher: { '@id': `${BASE_URL}#business` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': this.fullUrl,
    },
    articleBody: textContent.substring(0, 5000), // Ограничение для безопасности
  };
};

export default mongoose.models.News || mongoose.model('News', NewsSchema);