// src/app/api/bookings/track/[code]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { code } = params;
    
    console.log('🔍 Поиск бронирования по коду:', code);
    
    const booking = await Booking.findOne({ trackingCode: code.toUpperCase() })
      .populate('serviceId');
    
    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Запись с таким кодом не найдена' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Бронирование найдено:', booking.trackingCode);
    
    return NextResponse.json({
      success: true,
      booking: booking
    });
    
  } catch (error) {
    console.error('❌ Error tracking booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при поиске записи' 
      },
      { status: 500 }
    );
  }
}