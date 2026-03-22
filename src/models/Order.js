// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Основные поля
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  customerInfo: {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  
  // Товары в заказе
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    image: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Финансовая информация (ОБЯЗАТЕЛЬНЫЕ ПОЛЯ)
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Доставка
  shippingMethod: {
    type: String,
    enum: ['pickup', 'courier', 'post'],
    default: 'pickup'
  },
  
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Россия'
    },
    postalCode: String,
    phone: String
  },
  
  // Оплата
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  
  // Статусы
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Дополнительная информация
  customerNotes: String,
  
  adminNotes: String,
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
  
}, {
  timestamps: true
});

// Предварительная генерация номера заказа
OrderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

// Пост-сохранение: проверка обязательных полей
OrderSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    console.error('❌ Ошибка валидации Order:', error.errors);
  }
  next();
});

// Индексы
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ 'customerInfo.email': 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);