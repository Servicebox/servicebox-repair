import mongoose from 'mongoose';

const ContentBlockSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'image', 'video'], required: true },
  content: { type: String }, // для текстовых блоков
  media: { type: String }, // путь к файлу
  description: { type: String }, // подпись к медиа
  mediaType: { type: String }, // для видео
  position: { type: Number }
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
  metaDescription: { type: String }
}, { timestamps: true });

// Генерация slug и excerpt перед сохранением
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