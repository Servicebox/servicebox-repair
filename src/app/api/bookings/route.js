import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';

export async function POST(request) {
  await dbConnect();
  
  try {
    const { serviceId, serviceName, userName, userPhone, userEmail, deviceModel, notes } = await request.json();
    
    // Проверка существования услуги
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return NextResponse.json(
        { message: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    const booking = new Booking({
      serviceId,
      serviceName,
      userName,
      userPhone,
      userEmail,
      deviceModel,
      notes,
      status: 'pending'
    });

    await booking.save();

    // Отправка уведомления в Telegram (опционально)
    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
      const telegramMsg = `📝 Новая запись!\n\n` +
        `🔧 Услуга: ${booking.serviceName}\n` +
        `👤 Клиент: ${booking.userName}\n` +
        `📱 Телефон: ${booking.userPhone}\n` +
        `📧 Email: ${booking.userEmail || 'не указан'}\n` +
        `📱 Устройство: ${booking.deviceModel || 'не указано'}\n` +
        `📝 Заметки: ${booking.notes}\n` +
        `🆔 Трек-код: ${booking.trackingCode}`;

      // Реализация отправки в Telegram
       await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: telegramMsg
         })
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}

export async function GET() {
  await dbConnect();
  
  try {
    const bookings = await Booking.find()
      .populate('serviceId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}