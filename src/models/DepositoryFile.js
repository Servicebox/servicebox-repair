// models/DepositoryFile.js
import mongoose from 'mongoose';

const DepositoryFileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DepositoryCategory',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  uploader: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.DepositoryFile || mongoose.model('DepositoryFile', DepositoryFileSchema);