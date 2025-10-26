// models/ProductReservation.js
import mongoose from 'mongoose';

const ProductReservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSlug: { // Добавьте это поле если его нет
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['reserved', 'released', 'purchased'],
    default: 'reserved'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});


export default mongoose.models.ProductReservation || mongoose.model('ProductReservation', ProductReservationSchema);