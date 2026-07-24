// models/Brand.js
import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Совпадает с ключом устройства в pricing-data.js (phone, laptop, tablet, tv, console, videocard)
  deviceType: {
    type: String,
    required: true
  },
  multiplier: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

brandSchema.index({ deviceType: 1, name: 1 });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

export default Brand;
