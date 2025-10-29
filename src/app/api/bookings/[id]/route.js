import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { status } = await request.json();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: 'Бронирование не найдено' },
        { status: 404 }
      );
    }

    // Обновляем статус и добавляем в историю
    const oldStatus = booking.status;
    booking.status = status;
    
    if (!booking.statusHistory) {
      booking.statusHistory = [];
    }
    
    booking.statusHistory.push({
      status: status,
      changedAt: new Date(),
      note: `Статус изменен с "${oldStatus}" на "${status}"`
    });

    await booking.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Статус обновлен',
      booking 
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении статуса' },
      { status: 500 }
    );
  }
}
