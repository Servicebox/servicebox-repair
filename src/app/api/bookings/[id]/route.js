// src/app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function PUT(request, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    const { status } = await request.json();
    
    // Валидация статуса
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Недопустимый статус' 
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Бронирование не найдено' 
        },
        { status: 404 }
      );
    }

    // Сохраняем предыдущий статус
    const previousStatus = booking.status;
    booking.status = status;
    
    // Добавляем в историю
    booking.statusHistory.push({
      status: status,
      changedAt: new Date(),
      note: `Статус изменен администратором`
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message 
      },
      { status: 500 }
    );
  }
}