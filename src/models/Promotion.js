import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название акции обязательно'],
    trim: true,
    maxlength: [200, 'Название не может быть длиннее 200 символов']
  },
  description: {
    type: String,
    required: [true, 'Описание акции обязательно'],
    maxlength: [1000, 'Описание не может быть длиннее 1000 символов']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Краткое описание не может быть длиннее 200 символов']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Дата окончания акции обязательна']
  },
  image: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  conditions: {
    type: String,
    maxlength: [500, 'Условия не могут быть длиннее 500 символов']
  }
}, {
  timestamps: true
});

// Виртуальное поле для проверки активности
PromotionSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Метод для обновления статуса активности
PromotionSchema.methods.updateStatus = function() {
  this.isActive = !this.isExpired;
  return this.save();
};

export default mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);