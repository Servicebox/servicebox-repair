// app/api/depository/files/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DepositoryFile from '@/models/DepositoryFile';
import DepositoryCategory from '@/models/DepositoryCategory';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = { isActive: true };

    if (category && category !== 'all' && category !== '') {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        query.category = category;
      }
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const files = await DepositoryFile.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении файлов', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category');
    const description = formData.get('description') || '';

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не загружен' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: 'Категория обязательна' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const categoryExists = await DepositoryCategory.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Категория не найдена' },
        { status: 400 }
      );
    }

    // Создаем папку для загрузки
    const uploadDir = path.join(process.cwd(), 'uploads', 'depository');
    await mkdir(uploadDir, { recursive: true });

    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Сохраняем файл
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Сохраняем в базу
    const depositoryFile = new DepositoryFile({
      originalName: file.name,
      filename: uniqueFilename,
      filePath: filePath,
      mimetype: file.type,
      size: file.size,
      category: category,
      description: description.trim(),
      uploader: 'Admin'
    });

    await depositoryFile.save();
    await depositoryFile.populate('category', 'name');

    return NextResponse.json(
      { 
        message: 'Файл загружен', 
        file: depositoryFile 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json(
      { message: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}