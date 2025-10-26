// app/api/gallery/route.js (обновленный POST)
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import dbConnect from '../../../../lib/db'; // Подключение к БД
import Image from '../../../../models/Image'; // Модель изображения


export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');
    const description = formData.get('description') || '';
    const groupId = formData.get('groupId') || null; // ID группы, если передано

    // Подключаемся к БД
    await dbConnect();

    // Создаем директорию для загрузок
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    await mkdir(uploadDir, { recursive: true });

    const processedImages = [];

    for (const file of files) {
      // Проверяем, является ли файл изображением
      if (!file.type.startsWith('image/')) {
        continue; // Пропускаем не-изображения
      }

      // Генерируем уникальное имя для WebP-файла
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const webpFilename = `${timestamp}-${randomString}.webp`;
      const webpFilePath = path.join(uploadDir, webpFilename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Конвертируем и обрабатываем изображение с помощью Sharp
      const processedWebpBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      // Сохраняем WebP-файл
      await writeFile(webpFilePath, processedWebpBuffer);

      // Создаем объект данных для сохранения в БД
      const imageData = {
        filename: webpFilename,
        originalName: file.name,
        filePath: `/uploads/gallery/${webpFilename}`,
        description: description,
        size: processedWebpBuffer.length,
        type: 'image/webp',
      };

      if (groupId) {
        imageData.groupId = groupId; // Привязываем к группе, если указана
      }

      // Сохраняем в БД
      const newImage = new Image(imageData);
      await newImage.save();

      processedImages.push({
        id: newImage._id.toString(), // Возвращаем ID из БД
        ...imageData
      });
    }

    return NextResponse.json({
      success: true,
      message: `Изображения успешно загружены и сконвертированы в WebP`,
      images: processedImages,
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось обработать изображения' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить изображение
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный ID изображения' },
        { status: 400 }
      );
    }

    const image = await Image.findById(id);
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Изображение не найдено' },
        { status: 404 }
      );
    }

    // Удаляем файл с диска
    try {
      const filePath = path.join(process.cwd(), 'public', image.filePath);
      await unlink(filePath);
    } catch (error) {
      console.warn('Не удалось удалить файл:', error);
    }

    // Удаляем из базы данных
    await Image.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Изображение удалено'
    });

  } catch (error) {
    console.error('Ошибка удаления:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления' },
      { status: 500 }
    );
  }
}