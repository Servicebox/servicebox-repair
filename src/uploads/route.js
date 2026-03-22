// src/app/api/upload/route.js
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Обработка multipart/form-data
    const formData = await req.formData();
    const files = formData.getAll('product');

    const imageUrls = [];

    for (const file of files) {
      if (!file || typeof file === 'string') continue;

      // Чтение файла как Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Генерация уникального имени файла
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const filename = `image-${timestamp}-${random}.webp`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      const filepath = path.join(uploadDir, filename);

      // Создание директории, если не существует
      await mkdir(uploadDir, { recursive: true });

      // Конвертация и сжатие изображения
      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(filepath);

      // Сохранение URL для ответа
      imageUrls.push(`uploads/images/${filename}`);
    }

    res.status(200).json({ image_urls: imageUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
}