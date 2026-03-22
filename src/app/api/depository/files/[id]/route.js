// app/api/depository/files/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DepositoryFile from '@/models/DepositoryFile';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const file = await DepositoryFile.findById(params.id)
      .populate('category', 'name');

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении файла' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { description, tags } = await request.json();

    const file = await DepositoryFile.findByIdAndUpdate(
      params.id,
      {
        description: description || '',
        tags: tags || []
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Файл обновлен', file }
    );
  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении файла' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const file = await DepositoryFile.findById(params.id);

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден' },
        { status: 404 }
      );
    }

    // Удаляем физический файл
    try {
      await unlink(file.filePath);
    } catch (fsError) {
      console.warn('Файл не найден на диске:', fsError);
    }

    // Удаляем запись из базы
    await DepositoryFile.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Файл удален' }
    );
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { message: 'Ошибка при удалении файла' },
      { status: 500 }
    );
  }
}