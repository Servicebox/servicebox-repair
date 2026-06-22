import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Оценка обязательна'],
    min: [1, 'Минимальная оценка — 1'],
    max: [5, 'Максимальная оценка — 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Оценка должна быть целым числом'
    }
  },
  text: {
    type: String,
    required: [true, 'Текст отзыва обязателен'],
    trim: true,
    minlength: [10, 'Отзыв должен содержать минимум 10 символов'],
    maxlength: [3000, 'Отзыв не может превышать 3000 символов']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

ReviewSchema.index({ status: 1, createdAt: -1 });
// Один активный (pending/approved) отзыв на пользователя
ReviewSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'approved'] } } }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
