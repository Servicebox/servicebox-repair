// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Основная информация о заказе
  orderNumber: {
    type: String,
    unique: true,

  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Информация о покупателе
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
  
  // Адрес доставки
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Россия'
    }
  },
  
  // Товары в заказе
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
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
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  
  // Стоимость заказа
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  
  // Статус заказа
  status: {
    type: String,
    enum: [
      'pending',      // Ожидает обработки
      'confirmed',    // Подтвержден
      'processing',   // В обработке
      'shipped',      // Отправлен
      'delivered',    // Доставлен
      'cancelled',    // Отменен
      'refunded'      // Возврат
    ],
    default: 'pending'
  },
  
  // Способ доставки
  shippingMethod: {
    type: String,
    enum: ['pickup', 'courier', 'post'],
    default: 'pickup'
  },
  
  // Способ оплаты
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  
  // Статус оплаты
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Трек номер для отслеживания
  trackingNumber: String,
  
  // Дата доставки
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Комментарии
  customerNotes: String,
  adminNotes: String,
  
  // История статусов
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});


OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const now = new Date();
      const timestamp = now.getTime();
      const random = Math.floor(Math.random() * 10000);
      this.orderNumber = `ORD-${timestamp}-${random}`;
      console.log(`✅ Generated order number: ${this.orderNumber}`);
    } catch (error) {
      console.error('❌ Error generating order number:', error);
      // Fallback - используем timestamp
      this.orderNumber = `ORD-${Date.now()}`;
    }
  }
  next();
});

// Расчет общей суммы перед сохранением
OrderSchema.pre('save', function(next) {
  // Пересчитываем общую сумму
  this.pricing.subtotal = this.products.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
  
  this.pricing.totalAmount = this.pricing.subtotal + this.pricing.shippingCost + this.pricing.tax - this.pricing.discount;
  
  next();
});

// Метод для обновления статуса с сохранением истории
OrderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  return this.save();
};

// Статический метод для получения заказов пользователя
OrderSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Статический метод для получения заказов по статусу
OrderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Виртуальное поле для форматированной даты
OrderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('ru-RU');
});

// Виртуальное поле для общего количества товаров
OrderSchema.virtual('totalItems').get(function() {
  return this.products.reduce((total, product) => total + product.quantity, 0);
});

// Убедимся, что виртуальные поля включаются в JSON
OrderSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);