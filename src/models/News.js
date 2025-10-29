// src/models/News.js
import mongoose from 'mongoose';

const ContentBlockSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'image', 'video', 'youtube'], required: true },
  content: { type: String },
  media: { type: String },
  description: { type: String },
  mediaType: { type: String },
  position: { type: Number },
  videoUrl: { type: String },
  thumbnail: { type: String }
});

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Заголовок обязателен'] },
  slug: { type: String, unique: true },
  contentBlocks: [ContentBlockSchema],
  excerpt: { type: String, maxlength: 300 },
  featuredImage: { type: String },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  metaTitle: { type: String },
  metaDescription: { type: String },
  allowVideos: { type: Boolean, default: true }
}, { timestamps: true });

NewsSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (!this.excerpt && this.contentBlocks) {
    const firstTextBlock = this.contentBlocks.find(block => block.type === 'text');
    if (firstTextBlock?.content) {
      this.excerpt = firstTextBlock.content.substring(0, 300);
    }
  }
  next();
});

export default mongoose.models.News || mongoose.model('News', NewsSchema);