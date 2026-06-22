// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно'],
    trim: true,
    minlength: [2, 'Имя должно содержать минимум 2 символа']
  },
  firstName: {
    type: String,
    default: '',
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Введите корректный email']
  },
  password: {
    type: String,
    minlength: [6, 'Пароль должен содержать минимум 6 символов']
  },
  yandexId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  bonuses: {
    type: Number,
    default: 0,
    min: [0, 'Баланс бонусов не может быть отрицательным']
  },
  googleWalletPassId: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Биография не может превышать 500 символов']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  onlineStatus: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeenAt: Date,
  likes: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'likeTypes' }],
  likeTypes: [{ type: String, default: 'Product' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'favoriteTypes' }],
  favoriteTypes: [{ type: String, default: 'Product' }],
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    chatNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Хеширование пароля перед сохранением (пропускаем OAuth-юзеров без пароля)
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);