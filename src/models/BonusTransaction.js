import mongoose from 'mongoose';

const BonusTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['earn', 'spend', 'adjust'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        if (this.type === 'earn') return v > 0;
        if (this.type === 'spend') return v < 0;
        return v !== 0; // adjust: любое ненулевое значение
      },
      message: 'Недопустимое значение points для данного типа транзакции'
    }
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  description: {
    type: String,
    required: [true, 'Описание транзакции обязательно'],
    trim: true,
    maxlength: [500, 'Описание не может превышать 500 символов']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

BonusTransactionSchema.index({ userId: 1, createdAt: -1 });
BonusTransactionSchema.index({ orderId: 1 }, { sparse: true });

export default mongoose.models.BonusTransaction || mongoose.model('BonusTransaction', BonusTransactionSchema);
