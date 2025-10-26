// app/api/depository/categories/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DepositoryCategory from '@/models/DepositoryCategory';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await DepositoryCategory.find({ isActive: true })
      .populate('parent', 'name')
      .sort({ name: 1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении категорий' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, parent, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Название категории обязательно' },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();
    
    // Проверяем существование категории
    const existingCategory = await DepositoryCategory.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
      parent: parent || null,
      isActive: true
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Категория с таким названием уже существует' },
        { status: 400 }
      );
    }

    const category = new DepositoryCategory({
      name: normalizedName,
      parent: parent || null,
      description: description || ''
    });

    await category.save();

    return NextResponse.json(
      { 
        message: 'Категория создана', 
        category: {
          _id: category._id,
          name: category.name,
          parent: category.parent,
          description: category.description
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании категории' },
      { status: 500 }
    );
  }
}