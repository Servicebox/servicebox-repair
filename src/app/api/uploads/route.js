// app/api/uploads/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const CONFIG = {
  maxFileSizes: {
    image: 5 * 1024 * 1024, // 5MB
    video: 50 * 1024 * 1024, // 50MB
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
  },
  imageProcessing: {
    quality: 80,
    sizes: {
      news: { width: 1200, height: 630 },
      products: { width: 800, height: 600 },
      promotions: { width: 800, height: 400 },
      gallery: { width: 1200, height: 800 },
      deposit: { width: 1000, height: 1000 },
      default: { width: 800, height: 600 }
    }
  }
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files'); // Изменил на 'files' для множественной загрузки
    const category = formData.get('category') || 'default';

    console.log('Upload request:', {
      fileCount: files.length,
      fileNames: files.map(f => f?.name),
      fileTypes: files.map(f => f?.type),
      fileSizes: files.map(f => f?.size),
      category
    });

    // Проверка наличия файлов
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Файлы не загружены' },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      if (!file || !file.name) {
        uploadResults.push({
          success: false,
          error: 'Неверный файл'
        });
        continue;
      }

      // Определяем тип файла
      const fileType = file.type.split('/')[0];
      const isImage = fileType === 'image';
      const isVideo = fileType === 'video';

      // Валидация типа файла
      if (!isImage && !isVideo) {
        uploadResults.push({
          success: false,
          error: 'Недопустимый тип файла. Разрешены только изображения и видео'
        });
        continue;
      }

      // Валидация размера файла
      const maxSize = isImage ? CONFIG.maxFileSizes.image : CONFIG.maxFileSizes.video;
      if (file.size > maxSize) {
        uploadResults.push({
          success: false,
          error: `Размер файла ${file.name} не должен превышать ${maxSize / 1024 / 1024}MB`
        });
        continue;
      }

      // Валидация MIME типа
      const allowedTypes = isImage ? CONFIG.allowedTypes.image : CONFIG.allowedTypes.video;
      if (!allowedTypes.includes(file.type)) {
        uploadResults.push({
          success: false,
          error: `Недопустимый формат файла ${file.name}. Разрешены: ${allowedTypes.join(', ')}`
        });
        continue;
      }

      try {
        // Создаем директорию для категории
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
        await mkdir(uploadDir, { recursive: true });

        // Генерируем уникальное имя файла
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        
        let filename, filePath, publicUrl;

        if (isImage) {
          // Для изображений конвертируем в WebP
          filename = `${timestamp}-${randomString}.webp`;
          filePath = path.join(uploadDir, filename);
          
          // Обрабатываем изображение с sharp
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const processedImage = await sharp(buffer)
            .webp({ 
              quality: CONFIG.imageProcessing.quality,
              effort: 6
            })
            .resize(
              CONFIG.imageProcessing.sizes[category]?.width || CONFIG.imageProcessing.sizes.default.width, 
              CONFIG.imageProcessing.sizes[category]?.height || CONFIG.imageProcessing.sizes.default.height, 
              {
                fit: 'inside',
                withoutEnlargement: true
              }
            )
            .toBuffer();

          await writeFile(filePath, processedImage);
        } else {
          // Для видео сохраняем оригинал
          const originalExtension = path.extname(file.name);
          filename = `${timestamp}-${randomString}${originalExtension}`;
          filePath = path.join(uploadDir, filename);
          
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await writeFile(filePath, buffer);
        }

        publicUrl = `/uploads/${category}/${filename}`;

        uploadResults.push({
          success: true,
          url: publicUrl,
          filename: filename,
          originalName: file.name,
          type: file.type,
          size: file.size,
          category: category
        });

        console.log('File uploaded successfully:', {
          filename,
          publicUrl,
          originalName: file.name,
          type: file.type,
          size: file.size
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        uploadResults.push({
          success: false,
          error: `Ошибка обработки файла ${file.name}: ${fileError.message}`
        });
      }
    }

    // Проверяем, есть ли успешные загрузки
    const successfulUploads = uploadResults.filter(result => result.success);
    if (successfulUploads.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не удалось загрузить ни один файл',
          details: uploadResults.map(r => r.error)
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadResults,
      image_urls: successfulUploads.map(file => file.url) // для обратной совместимости
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error details:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке файла',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      maxSizes: CONFIG.maxFileSizes,
      allowedTypes: CONFIG.allowedTypes
    }
  });
}