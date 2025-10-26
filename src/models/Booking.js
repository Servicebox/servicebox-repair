import mongoose from 'mongoose';

const generateTrackingCode = () => {
  return 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const bookingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
  serviceName: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  userEmail: { type: String },
  deviceModel: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'],
    default: 'pending'
  },
  trackingCode: { type: String, unique: true, default: generateTrackingCode },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);