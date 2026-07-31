import mongoose from 'mongoose';

const BonusConfigSchema = new mongoose.Schema({
  ratePct: {
    type: Number,
    required: true,
    min: [0, 'Процент не может быть отрицательным'],
    max: [100, 'Процент не может превышать 100']
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

export default mongoose.models.BonusConfig || mongoose.model('BonusConfig', BonusConfigSchema);
