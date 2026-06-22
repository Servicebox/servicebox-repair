import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['news', 'photo', 'promotion'],
    required: true
  },
  text: {
    type: String,
    required: [true, 'Текст комментария обязателен'],
    trim: true,
    minlength: [2, 'Комментарий слишком короткий'],
    maxlength: [2000, 'Комментарий не может превышать 2000 символов']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

CommentSchema.index({ targetId: 1, targetType: 1, status: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
