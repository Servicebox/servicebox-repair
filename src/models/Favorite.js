import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemType: {
    type: String,
    enum: ['product', 'news', 'photo', 'promotion'],
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

FavoriteSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, itemType: 1 });

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
