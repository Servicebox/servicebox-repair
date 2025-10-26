// models/DepositoryCategory.js
import mongoose from 'mongoose';

const DepositoryCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DepositoryCategory',
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.DepositoryCategory || mongoose.model('DepositoryCategory', DepositoryCategorySchema);