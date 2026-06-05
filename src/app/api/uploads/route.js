// app/api/uploads/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Это предотвращает ошибку "Response body object should not be disturbed or locked"
export const config = {
  api: {
    bodyParser: false,
  },
};

// Увеличиваем лимит размера тела запроса (по умолчанию 10MB)
export const maxDuration = 60; // 60 секунд на загрузку

const CONFIG = {
  maxFileSizes: {
    image: 100 * 1024 * 1024,
    video: 1000 * 1024 * 1024,
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
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
    // ✅ БЕЗОПАСНОЕ ЧТЕНИЕ FORMDATA С TRY/CATCH
    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('❌ Error parsing FormData:', parseError);
      return NextResponse.json(
        { success: false, error: 'Ошибка парсинга формы. Возможно, файл слишком большой.' },
        { status: 400 }
      );
    }

    const files = formData.getAll('files');
    const category = formData.get('category') || 'default';

    console.log('Upload request:', {
      fileCount: files.length,
      fileNames: files.map(f => f?.name),
      fileTypes: files.map(f => f?.type),
      fileSizes: files.map(f => f?.size),
      category
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Файлы не загружены' },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      if (!file || !file.name) {
        uploadResults.push({ success: false, error: 'Неверный файл' });
        continue;
      }

      const fileType = file.type.split('/')[0];
      const isImage = fileType === 'image';
      const isVideo = fileType === 'video';

      if (!isImage && !isVideo) {
        uploadResults.push({
          success: false,
          error: 'Недопустимый тип файла. Разрешены только изображения и видео'
        });
        continue;
      }

      const maxSize = isImage ? CONFIG.maxFileSizes.image : CONFIG.maxFileSizes.video;
      if (file.size > maxSize) {
        uploadResults.push({
          success: false,
          error: `Размер файла ${file.name} не должен превышать ${Math.round(maxSize / 1024 / 1024)}MB`
        });
        continue;
      }

      const allowedTypes = isImage ? CONFIG.allowedTypes.image : CONFIG.allowedTypes.video;
      if (!allowedTypes.includes(file.type)) {
        uploadResults.push({
          success: false,
          error: `Недопустимый формат файла ${file.name}. Разрешены: ${allowedTypes.join(', ')}`
        });
        continue;
      }

      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        let filename, filePath, publicUrl;

        if (isImage) {
          filename = `${timestamp}-${randomString}.webp`;
          filePath = path.join(uploadDir, filename);

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const processedImage = await sharp(buffer)
            .webp({ quality: CONFIG.imageProcessing.quality, effort: 6 })
            .resize(
              CONFIG.imageProcessing.sizes[category]?.width || CONFIG.imageProcessing.sizes.default.width,
              CONFIG.imageProcessing.sizes[category]?.height || CONFIG.imageProcessing.sizes.default.height,
              { fit: 'inside', withoutEnlargement: true }
            )
            .toBuffer();

          await writeFile(filePath, processedImage);
        } else {
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

        console.log('✅ File uploaded successfully:', { filename, publicUrl, originalName: file.name, type: file.type, size: file.size });
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        uploadResults.push({
          success: false,
          error: `Ошибка обработки файла ${file.name}: ${fileError.message}`
        });
      }
    }

    const successfulUploads = uploadResults.filter(result => result.success);
    if (successfulUploads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Не удалось загрузить ни один файл', details: uploadResults.map(r => r.error) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadResults,
      image_urls: successfulUploads.map(file => file.url)
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Upload error details:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке файла', details: process.env.NODE_ENV === 'production' ? error.message : undefined },
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