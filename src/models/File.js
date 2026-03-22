import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
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
  description: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    enum: ['firmware', 'dashboard', 'document', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

export default mongoose.models.File || mongoose.model('File', FileSchema);