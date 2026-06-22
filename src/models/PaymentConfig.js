import mongoose from 'mongoose';

const PaymentConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['tinkoff', 'yandex_split'],
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  // Только идентификатор секрета (не сам секрет).
  // Реальные ключи хранятся исключительно в process.env.
  webhookSecretRef: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

export default mongoose.models.PaymentConfig || mongoose.model('PaymentConfig', PaymentConfigSchema);
