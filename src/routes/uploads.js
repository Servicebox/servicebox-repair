const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')  // ← Сохранять сразу в public/images
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueName = `product_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Разрешаем только определенные типы файлов
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/octet-stream') { // BIOS файлы
      cb(null, true);
    } else {
      cb(new Error('Неверный тип файла'), false);
    }
  }
});

// Загрузка изображений товаров
router.post('/product-images', upload.single('image'), (req, res) => {
  try {
    res.json({
      success: true,
      filename: req.file.filename,
      path: `api/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Загрузка файлов BIOS
router.post('/bios', upload.single('bios'), (req, res) => {
  try {
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `api/uploads/depository/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;