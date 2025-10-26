import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import dbConnect from '../../../lib/db';
import Image from '../../../models/Image';
import Group from '../../../models/Group';

// Конфигурация галереи
const GALLERY_CONFIG = {
  maxFiles: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  imageProcessing: {
    quality: 80
  }
};

// GET - Получить все изображения
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    let query = {};
    if (groupId) {
      query.groupId = groupId;
    }

    const images = await Image.find(query).sort({ uploadedAt: -1 }).lean();

    const formattedImages = images.map(img => ({
      id: img._id.toString(),
      filename: img.filename,
      originalName: img.originalName,
      filePath: img.filePath,
      description: img.description,
      uploadedAt: img.uploadedAt,
      size: img.size,
      type: img.type,
      groupId: img.groupId ? img.groupId.toString() : null,
    }));

    return NextResponse.json({
      success: true,
      images: formattedImages,
    });

  } catch (error) {
    console.error('GET all images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить несколько изображений
export async function DELETE(request) {
  try {
    await dbConnect();
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No IDs provided for deletion' },
        { status: 400 }
      );
    }

    const result = await Image.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} images deleted successfully.`,
    });

  } catch (error) {
    console.error('DELETE images error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}

// POST - Загрузить новые изображения
export async function POST(request) {
  let processedImages = [];
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');

  try {
    await mkdir(uploadDir, { recursive: true });
    await dbConnect();

    const formData = await request.formData();
    const files = formData.getAll('images');
    const description = formData.get('description') || '';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Файлы не загружены' },
        { status: 400 }
      );
    }

    if (files.length > GALLERY_CONFIG.maxFiles) {
      return NextResponse.json(
        { success: false, error: `Максимум ${GALLERY_CONFIG.maxFiles} изображений` },
        { status: 400 }
      );
    }

    // Создаем группу для изображений
    const group = await Group.create({ description });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!GALLERY_CONFIG.allowedTypes.includes(file.type)) {
        await cleanupFiles(processedImages, uploadDir);
        await Group.findByIdAndDelete(group._id);
        return NextResponse.json(
          { success: false, error: `Недопустимый тип файла: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > GALLERY_CONFIG.maxFileSize) {
        await cleanupFiles(processedImages, uploadDir);
        await Group.findByIdAndDelete(group._id);
        return NextResponse.json(
          { success: false, error: `Файл "${file.name}" превышает 5MB` },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `${timestamp}-${randomString}.webp`;
      const filePath = path.join(uploadDir, filename);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Конвертируем в WebP с оптимизацией
        const processedImage = await sharp(buffer)
          .webp({ 
            quality: GALLERY_CONFIG.imageProcessing.quality,
            effort: 4
          })
          .resize(1200, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer();

        await writeFile(filePath, processedImage);

        const imageData = {
          filename,
          originalName: file.name,
          filePath: `/uploads/gallery/${filename}`,
          description,
          uploadedAt: new Date(),
          size: processedImage.length,
          type: 'image/webp',
          groupId: group._id
        };

        const savedImage = await Image.create(imageData);
        
        processedImages.push({
          id: savedImage._id.toString(),
          ...imageData,
          uploadedAt: savedImage.uploadedAt.toISOString()
        });

      } catch (fileError) {
        console.error('Ошибка обработки файла:', fileError);
        try {
          await unlink(filePath);
        } catch (unlinkError) {
          console.warn('Не удалось удалить файл:', unlinkError);
        }
        await cleanupFiles(processedImages, uploadDir);
        await Group.findByIdAndDelete(group._id);
        throw new Error(`Ошибка обработки файла: ${fileError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Успешно загружено ${processedImages.length} изображений`,
      images: processedImages
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка загрузки:', error);
    await cleanupFiles(processedImages, uploadDir);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Ошибка загрузки'
      },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для очистки файлов
async function cleanupFiles(images, uploadDir) {
  for (const image of images) {
    try {
      await unlink(path.join(uploadDir, image.filename));
    } catch (cleanupError) {
      console.warn('Ошибка очистки:', cleanupError);
    }
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}