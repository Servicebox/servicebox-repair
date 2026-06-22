import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['Product', 'News', 'Service', 'Image', 'Promotion'],
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

likeSchema.index({ userId: 1, entityId: 1, entityType: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model('Like', likeSchema);
