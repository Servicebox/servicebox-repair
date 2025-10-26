// models/Group.js
import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);