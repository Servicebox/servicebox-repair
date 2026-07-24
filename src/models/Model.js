// models/Model.js
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Фактор поколения/эпохи устройства, используется в оценке auto-estimate
  gen: {
    type: Number,
    default: 1
  },
  portType: String,
  hasSeparateGlass: {
    type: Boolean,
    default: false
  },
  hasBga: {
    type: Boolean,
    default: false
  },
  hasThermalPads: {
    type: Boolean,
    default: false
  },
  // Только для tv: 'led' | 'qled' | 'mini_led' | 'oled' — сверяется с Service.compatFlags.requiresTvType
  tvType: String
}, {
  timestamps: true
});

modelSchema.index({ brandId: 1, name: 1 });

const Model = mongoose.models.Model || mongoose.model('Model', modelSchema);

export default Model;
