const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Создаем директорию uploads если не существует
const uploadDir = path.resolve(__dirname, '..', 'uploads');

const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

ensureUploadDir();

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// Фильтры файлов
const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideos = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov', 'video/webm'];
  
  if (file.fieldname === 'images' && allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'videos' && allowedVideos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB максимум
    files: 13 // 10 изображений + 3 видео
  }
});

module.exports = {
  upload: upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 3 }
  ]),
  uploadDir
};