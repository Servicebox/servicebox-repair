// app/api/depository/files/[id]/download/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DepositoryFile from '@/models/DepositoryFile';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const file = await DepositoryFile.findById(params.id);

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик скачиваний
    await DepositoryFile.findByIdAndUpdate(params.id, {
      $inc: { downloadCount: 1 }
    });

    // Читаем файл
    const fileBuffer = await readFile(file.filePath);

    // Возвращаем файл для скачивания
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.size.toString()
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    return NextResponse.json(
      { message: 'Ошибка при скачивании файла' },
      { status: 500 }
    );
  }
}