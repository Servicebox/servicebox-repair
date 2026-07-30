import mongoose from 'mongoose';

const ProcessedCrmBonusEventSchema = new mongoose.Schema({
  eventKey: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.ProcessedCrmBonusEvent
  || mongoose.model('ProcessedCrmBonusEvent', ProcessedCrmBonusEventSchema);
