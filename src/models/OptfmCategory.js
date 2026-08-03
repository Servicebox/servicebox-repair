// models/OptfmCategory.js
import mongoose from 'mongoose';

const OptfmCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptfmCategory',
    default: null,
  },
  depthLevel: {
    type: Number,
    required: true,
    default: 1,
  },
  // Id раздела в системе поставщика — ключ для идемпотентного upsert
  supplierSectionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sort: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

OptfmCategorySchema.virtual('children', {
  ref: 'OptfmCategory',
  localField: '_id',
  foreignField: 'parentId',
});

OptfmCategorySchema.set('toJSON', { virtuals: true });
OptfmCategorySchema.set('toObject', { virtuals: true });

export default mongoose.models.OptfmCategory || mongoose.model('OptfmCategory', OptfmCategorySchema);
