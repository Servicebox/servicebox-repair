import mongoose from 'mongoose';

const generateTrackingCode = () => {
  return 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const bookingSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Service' 
  },
  serviceName: { 
    type: String, 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  userPhone: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String 
  },
  deviceModel: { 
    type: String 
  },
  notes: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'],
    default: 'pending'
  },
  trackingCode: { 
    type: String, 
    unique: true, 
    default: generateTrackingCode 
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String
  }]
}, { 
  timestamps: true 
});

// Добавляем статус в историю при создании
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: this.status,
      changedAt: new Date(),
      note: 'Запись создана'
    }];
  }
  next();
});

// Метод для обновления статуса
bookingSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    note: note
  });
  return this.save();
};

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
