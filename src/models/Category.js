// models/Category.js
import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название подкатегории обязательно'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  }
});

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название категории обязательно'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  subcategories: [SubcategorySchema],
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Генерация slug для категории
CategorySchema.pre('save', async function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = await generateUniqueSlug(this.name, this.constructor);
  }
  next();
});

// Генерация slug для подкатегорий
SubcategorySchema.pre('save', async function(next) {
  if (!this.slug || this.isModified('name')) {
    const fullName = `${this.parent().name} ${this.name}`;
    this.slug = await generateUniqueSlug(fullName, this.parent().constructor);
  }
  next();
});

// Функция для генерации уникального slug
async function generateUniqueSlug(text, model) {
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  let baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;
  let existingDoc;

  do {
    existingDoc = await model.findOne({ slug });
    if (existingDoc) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  } while (existingDoc);

  return slug;
}

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);