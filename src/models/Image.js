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
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);