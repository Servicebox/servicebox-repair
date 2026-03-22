// app/api/depository/categories/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DepositoryCategory from '@/models/DepositoryCategory';
import DepositoryFile from '@/models/DepositoryFile';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const category = await DepositoryCategory.findById(params.id)
      .populate('parent', 'name');

    if (!category) {
      return NextResponse.json(
        { message: 'Категория не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении категории' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Название категории обязательно' },
        { status: 400 }
      );
    }

    const category = await DepositoryCategory.findByIdAndUpdate(
      params.id,
      { 
        name: name.trim(),
        description: description || ''
      },
      { new: true, runValidators: true }
    ).populate('parent', 'name');

    if (!category) {
      return NextResponse.json(
        { message: 'Категория не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Категория обновлена', category }
    );
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении категории' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Проверяем есть ли файлы в категории
    const filesCount = await DepositoryFile.countDocuments({ 
      category: params.id 
    });

    if (filesCount > 0) {
      return NextResponse.json(
        { message: 'Невозможно удалить категорию с файлами' },
        { status: 400 }
      );
    }

    // Проверяем есть ли подкатегории
    const subcategoriesCount = await DepositoryCategory.countDocuments({ 
      parent: params.id 
    });

    if (subcategoriesCount > 0) {
      return NextResponse.json(
        { message: 'Невозможно удалить категорию с подкатегориями' },
        { status: 400 }
      );
    }

    const category = await DepositoryCategory.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: 'Категория не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Категория удалена' }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { message: 'Ошибка при удалении категории' },
      { status: 500 }
    );
  }
}