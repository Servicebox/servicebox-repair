// models/Image.js
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  filePath: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  description: String,
  filename: String,
  originalName: String,
  size: Number,
  type: String,
  uploadedAt: { type: Date, default: Date.now },
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);