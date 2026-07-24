// models/Service.js
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Основные поля
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    default: 'Уточняйте'
  },

  // Точная цена под конкретную модель (Model._id) — заполняется через bulk-матрицу в админке
  priceVariants: [{
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model'
    },
    price: Number
  }],
  // Базовая цена для авто-оценки по мультипликатору бренда, когда нет priceVariants на модель
  basePrice: Number,

  // Метаданные ремонтной работы для калькулятора (перенесены из pricing-data.js)
  minTime: String,
  maxTime: String,
  compatFlags: {
    appleOnly: { type: Boolean, default: false },
    portType: String,
    requiresSeparateGlass: { type: Boolean, default: false },
    requiresThermalPads: { type: Boolean, default: false },
    requiresBga: { type: Boolean, default: false },
    requiresFaceId: { type: Boolean, default: false },
    requiresTvType: [String]
  },

  // SEO поля
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  geoKeywords: [{ 
    type: String,
    default: ['Вологда']
  }],
  h1: { type: String },
  content: String,
  features: [String],
  
  // Древовидная структура
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  isCategory: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 0
  },
  isActive: {
  type: Boolean,
  default: true
},
  // Для сортировки
  order: {
    type: Number,
    default: 0
  },
  
  // GEO targeting
  cities: [{
    name: String,
    slug: String,
    price: String
  }],
  
  // Визуальные элементы
  icon: String,
  image: String,
  color: String,
  
  // Статистика
  views: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },

  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },

  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
serviceSchema.virtual('children', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'parent'
});

// Middleware для автоматической генерации SEO-данных
serviceSchema.pre('save', async function(next) {
  // Генерация slug
  if (!this.slug && this.name) {
    this.slug = await this.generateUniqueSlug(this.name);
  }
  
  // Автозаполнение SEO полей
  if (!this.metaTitle && this.name) {
    this.metaTitle = this.generateMetaTitle();
  }
  
  if (!this.metaDescription && this.name) {
    this.metaDescription = this.generateMetaDescription();
  }
  
  if (!this.h1 && this.name) {
    this.h1 = this.generateH1();
  }
  
  next();
});

// Метод генерации уникального slug
serviceSchema.methods.generateUniqueSlug = async function(text) {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Проверяем уникальность
  while (true) {
    const existing = await mongoose.model('Service').findOne({ slug });
    if (!existing || existing._id.equals(this._id)) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Генерация мета-заголовка
serviceSchema.methods.generateMetaTitle = function() {
  const geo = 'в Вологде';
  if (this.isCategory) {
    return `${this.name} ${geo} | ServiceBox - ремонт, цены, запись онлайн`;
  }
  return `${this.name} ${geo} - ServiceBox: стоимость, запись на ремонт`;
};

// Генерация мета-описания
serviceSchema.methods.generateMetaDescription = function() {
  const geo = 'в Вологде';
  if (this.isCategory) {
    return `Профессиональный ${this.name.toLowerCase()} ${geo}. Качественный ремонт, доступные цены, гарантия. Запишитесь онлайн или по телефону.`;
  }
  // this.description часто дословно совпадает у похожих услуг (одна и та же
  // формулировка про сроки ремонта у десятков моделей телефонов/ноутбуков),
  // поэтому name всегда идёт первым — это единственное гарантированно
  // уникальное поле в рамках шаблона.
  const base = this.description ? `${this.name}: ${this.description}` : `${this.name} ${geo}`;
  return `${base}.${this.price ? ` Стоимость ${this.price}.` : ''} Качественный ремонт ${geo}. Гарантия, выезд мастера.`;
};
serviceSchema.index({ name: 'text', description: 'text', content: 'text' });
serviceSchema.index({ slug: 1, isPublished: 1 });
serviceSchema.index({ keywords: 1 });

// Генерация H1
serviceSchema.methods.generateH1 = function() {
  const geo = 'в Вологде';
  if (this.isCategory) {
    return `${this.name} ${geo}`;
  }
  return `${this.name} ${geo}`;
};

// Статический метод для получения дерева услуг
serviceSchema.statics.getTree = async function(parentId = null) {
  const services = await this.find({ parent: parentId })
    .sort({ order: 1, name: 1 })
    .lean();
  
  for (let service of services) {
    if (service.isCategory) {
      service.children = await this.getTree(service._id);
    }
  }
  
  return services;
};

// Метод для получения хлебных крошек
serviceSchema.statics.getBreadcrumbs = async function(slug) {
  const service = await this.findOne({ slug }).populate('parent');
  if (!service) return [];
  
  const breadcrumbs = [];
  let current = service;
  
  // Собираем цепочку родителей
  while (current) {
    breadcrumbs.unshift({
      name: current.name,
      url: `/services/${current.slug}`,
      slug: current.slug
    });
    
    if (current.parent) {
      current = await this.findById(current.parent);
    } else {
      current = null;
    }
  }
  
  // Добавляем главную и страницу услуг
  return [
    { name: 'Главная', url: '/' },
    { name: 'Услуги', url: '/services' },
    ...breadcrumbs
  ];
};

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

export default Service;