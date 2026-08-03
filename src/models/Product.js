// models/Product.js
// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  // Основная информация
  name: {
    type: String,
    required: [true, 'Название товара обязательно'],
    trim: true,
    minlength: 3
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true
  },

  description: {
    type: String,
    default: ''
  },

  // Поля для микроразметки и YML
  brand: {
    type: String,
    required: true,
    default: 'ServiceBox35'
  },

  vendor: {
    type: String,
    default: 'ServiceBox35'
  },

  vendorCode: {
    type: String,
    default: ''
  },

  sku: {
    type: String,
    default: ''
  },

  gtin: {
    type: String,
    default: ''
  },

  // Категория (важно для YML)
  category: {
    type: String,
    required: true,
    index: true
  },

  subcategory: {
    type: String,
    default: ''
  },

  // Поля интеграции с поставщиком OPTFM — см.
  // docs/superpowers/specs/2026-08-03-optfm-supplier-integration-design.md.
  // Заполняются только у товаров, синхронизированных из внешнего каталога;
  // у товаров, введённых вручную через админку, остаются undefined.
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptfmCategory',
  },

  supplierSource: {
    type: String,
  },

  supplierProductId: {
    type: String,
  },

  supplierPriceRaw: {
    type: Number,
  },

  // Цены
  old_price: {
    type: Number,
    min: 0,
    default: 0,
    set: v => Math.round(Number(v) * 100) / 100
  },

  new_price: {
    type: Number,
    required: [true, 'Цена обязательна'],
    min: 0.01,
    set: v => Math.round(Number(v) * 100) / 100
  },

  // Остатки
  quantity: {
    type: Number,
    default: 1,
    min: 0,
    set: v => Math.max(0, Math.round(Number(v)))
  },

  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.max(0, Math.round(Number(v)))
  },

  // Изображения
  images: {
    type: [String],
    default: []
  },

  // Параметры для YML
  params: {
    type: Map,
    of: String,
    default: () => new Map()
  },

  // Вес и габариты
  weight: {
    type: Number,
    default: 0.5,
    min: 0,
    set: v => Math.max(0, Number(v))
  },

  dimensions: {
    length: {
      type: Number,
      default: 20,
      min: 0,
      set: v => Math.max(0, Number(v))
    },
    width: {
      type: Number,
      default: 20,
      min: 0,
      set: v => Math.max(0, Number(v))
    },
    height: {
      type: Number,
      default: 10,
      min: 0,
      set: v => Math.max(0, Number(v))
    },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm'],
      default: 'cm'
    }
  },

  // Страна производства
  country: {
    type: String,
    default: 'Россия'
  },

  // Статусы
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },

  // Для экспорта в YML
  ymlExport: {
    type: Boolean,
    default: true,
    index: true
  },

  // Дополнительные поля для YML
  manufacturer_warranty: {
    type: Boolean,
    default: true
  },

  delivery: {
    type: Boolean,
    default: true
  },

  pickup: {
    type: Boolean,
    default: true
  },

  store: {
    type: Boolean,
    default: false
  },

  sales_notes: {
    type: String,
    default: 'Минимальный заказ 1 шт. Доставка 1-3 дня.'
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
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Преобразуем Map в обычный объект для JSON
      if (ret.params instanceof Map) {
        ret.params = Object.fromEntries(ret.params);
      }

      // Преобразуем _id в строку
      if (ret._id && typeof ret._id === 'object') {
        ret._id = ret._id.toString();
      }

      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ВИРТУАЛЬНЫЕ ПОЛЯ
ProductSchema.virtual('availableQuantity').get(function () {
  const quantity = this.quantity || 0;
  const reserved = this.reservedQuantity || 0;
  return Math.max(0, quantity - reserved);
});

ProductSchema.virtual('hasStock').get(function () {
  return this.availableQuantity > 0;
});

ProductSchema.virtual('isAvailableForYML').get(function () {
  return this.isActive &&
    !this.isDeleted &&
    this.ymlExport !== false &&
    this.new_price > 0 &&
    this.availableQuantity > 0;
});

// Индексы
ProductSchema.index({ slug: 1, isActive: 1, isDeleted: 1 });
ProductSchema.index({ category: 1, isActive: 1, ymlExport: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ ymlExport: 1, isActive: 1 });
// Уникален только среди товаров поставщика (partial) — у ручных товаров
// supplierProductId не задан, они под это ограничение не попадают.
ProductSchema.index(
  { supplierProductId: 1 },
  { unique: true, partialFilterExpression: { supplierProductId: { $exists: true } } }
);

// Валидация перед сохранением
ProductSchema.pre('save', function (next) {
  // Автоматически заполняем обязательные поля
  if (!this.vendorCode && this.sku) {
    this.vendorCode = this.sku;
  }

  if (!this.sku && this.vendorCode) {
    this.sku = this.vendorCode;
  }

  if (!this.brand || this.brand.trim() === '') {
    this.brand = 'ServiceBox35';
  }

  if (!this.vendor || this.vendor.trim() === '') {
    this.vendor = this.brand;
  }

  // Убедимся, что slug в нижнем регистре
  if (this.slug) {
    this.slug = this.slug.toLowerCase();
  }

  // Обработка dimensions
  if (!this.dimensions) {
    this.dimensions = {
      length: 20,
      width: 20,
      height: 10,
      unit: 'cm'
    };
  }

  // Обязательные параметры для YML
  if (!this.params || !(this.params instanceof Map)) {
    this.params = new Map();
  }

  const requiredParams = {
    'Производитель': this.brand,
    'Артикул': this.sku || this.vendorCode || this.slug || this._id?.toString(),
    'Вес': `${(this.weight || 0.5).toFixed(2)} кг`,
    'Длина': `${this.dimensions.length || 20} см`,
    'Ширина': `${this.dimensions.width || 20} см`,
    'Высота': `${this.dimensions.height || 10} см`,
    'Габариты': `${this.dimensions.length || 20}x${this.dimensions.width || 20}x${this.dimensions.height || 10} см`,
    'Гарантия': '12 месяцев',
    'Страна': this.country || 'Россия'
  };

  Object.entries(requiredParams).forEach(([key, value]) => {
    if (value && !this.params.has(key)) {
      this.params.set(key, String(value));
    }
  });

  next();
});

// Метод для YML данных
ProductSchema.methods.getYmlData = function () {
  const available = this.isAvailableForYML;
  const availableQuantity = this.availableQuantity;

  return {
    id: this.sku || this.vendorCode || this.slug || this._id.toString(),
    available: available,
    count: availableQuantity > 0 ? availableQuantity : 0,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru'}/product/${this.slug}`,
    price: this.new_price,
    oldprice: this.old_price > this.new_price ? this.old_price : undefined,
    currencyId: 'RUB',
    vendor: this.vendor || this.brand,
    vendorCode: this.vendorCode || this.sku || this.slug,
    description: this.description || this.name,
    weight: this.weight || 0.5,
    dimensions: this.dimensions || { length: 20, width: 20, height: 10, unit: 'cm' },
    availableQuantity: availableQuantity,
    hasStock: availableQuantity > 0
  };
};

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;