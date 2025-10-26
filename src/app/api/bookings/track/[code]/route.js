import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { code } = params;
    const booking = await Booking.findOne({ trackingCode: code })
      .populate('serviceId');
    
    if (!booking) {
      return NextResponse.json(
        { message: 'Запись не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Track booking error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}