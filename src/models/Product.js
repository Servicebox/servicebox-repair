// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  category: String,
  subcategory: String,
  old_price: Number,
  new_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [String],
  specifications: Map,
  isActive: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Виртуальное поле для доступного количества
ProductSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Метод для проверки доступности
ProductSchema.methods.isAvailable = function(requiredQuantity = 1) {
  return this.availableQuantity >= requiredQuantity;
};

// Статический метод для получения товаров с учетом резервирования
ProductSchema.statics.getAvailableProducts = function() {
  return this.find({ 
    isActive: true,
    $expr: { $gt: [{ $subtract: ['$quantity', '$reservedQuantity'] }, 0] }
  });
};

export default mongoose.models.Product || 
       mongoose.model('Product', ProductSchema);