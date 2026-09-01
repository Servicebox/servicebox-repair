// src/models/BoardPhoto.js
import mongoose from 'mongoose';
import { DEVICE_TYPES } from '@/lib/boardPhotos';

const BoardPhotoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    deviceType: { type: String, enum: DEVICE_TYPES, default: 'other', index: true },
    chip: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    imageName: { type: String, required: true, unique: true }, // <uuid>.webp на диске
    imageWidth: { type: Number, required: true },
    imageHeight: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BoardPhotoSchema.index({ title: 'text', chip: 'text', description: 'text' });

export default mongoose.models.BoardPhoto || mongoose.model('BoardPhoto', BoardPhotoSchema);
