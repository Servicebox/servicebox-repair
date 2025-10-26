// src/app/api/promotions/route.js
import { NextResponse } from 'next/server';
import Promotion from '@/models/Promotion';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    const promotions = await Promotion.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении акций' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Валидация обязательных полей
    if (!body.title || !body.description || !body.endDate) {
      return NextResponse.json(
        { success: false, error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Проверка даты
    if (new Date(body.endDate) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Дата окончания должна быть в будущем' },
        { status: 400 }
      );
    }

    const promotion = await Promotion.create(body);

    return NextResponse.json({
      success: true,
      data: promotion
    }, { status: 201 });

  } catch (error) {
    console.error('Create promotion error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при создании акции' },
      { status: 500 }
    );
  }
}