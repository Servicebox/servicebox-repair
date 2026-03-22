// models/Booking.js
import mongoose from 'mongoose';

const generateTrackingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const bookingSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Service' 
  },
  serviceName: { 
    type: String, 
    trim: true
  },
  userName: { 
    type: String, 
    required: true,
    trim: true
  },
  userPhone: { 
    type: String, 
    required: true,
    trim: true
  },
  userEmail: { 
    type: String,
    trim: true,
    lowercase: true
  },
  deviceModel: { 
    type: String,
    trim: true
  },
  notes: { 
    type: String,
    trim: true
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

// Упрощенный middleware - убираем строгую валидацию
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

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);