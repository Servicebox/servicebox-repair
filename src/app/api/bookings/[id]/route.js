import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function PATCH(request, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    const { status } = await request.json();
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: 'Запись не найдена' },
        { status: 404 }
      );
    }
    
    // Добавляем запись в историю статусов
    booking.statusHistory.push({
      status,
      changedAt: new Date()
    });
    
    booking.status = status;
    await booking.save();
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    const booking = await Booking.findById(id)
      .populate('serviceId');
    
    if (!booking) {
      return NextResponse.json(
        { message: 'Запись не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}