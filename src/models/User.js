// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно'],
    trim: true,
    minlength: [2, 'Имя должно содержать минимум 2 символа'],
    maxlength: [50, 'Имя не может превышать 50 символов']
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
    maxlength: [254, 'Email не может превышать 254 символа'],
    // Прежняя маска резала TLD длиннее 3 символов (.info, .name, .online,
    // .store) и адреса вида user+tag@ — легитимные регистрации падали.
    // Практичная проверка: непустой local, @, домен с точкой и TLD ≥ 2.
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Введите корректный email']
  },
  password: {
    type: String,
    // select: false — хэш пароля не должен попадать в обычные выборки
    // (User.findById без явного .select('+password')). Логин и смена
    // пароля запрашивают поле явно.
    select: false,
    minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    maxlength: [128, 'Пароль не может превышать 128 символов']
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
  isPhoneOnlyAccount: {
    type: Boolean,
    default: false
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
  // Секретные токены — select: false, чтобы не утекали в ответы API и логи.
  // Роуты, которым они нужны, запрашивают их явным .select('+поле').
  verificationToken: { type: String, select: false },
  verificationTokenExpires: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  // Момент последней смены пароля — для инвалидации ранее выданных JWT
  // (используется начиная с Phase 3).
  passwordChangedAt: { type: Date, select: false },
  // Версия токенов пользователя. Инкремент = разлогинить все прежние сессии
  // (смена пароля, ручной сброс). Проверка включается в Phase 3.
  tokenVersion: { type: Number, default: 0, select: false },
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

// Метод для сравнения паролей.
// Защита от вызова без .select('+password'): если хэш не загружен —
// возвращаем false, а не бросаем исключение внутри bcrypt.
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);