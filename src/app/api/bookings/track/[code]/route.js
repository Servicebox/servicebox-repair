// src/app/api/bookings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import mongoose from 'mongoose';

// ✅ Вспомогательная функция проверки валидности ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export async function POST(request) {
  await dbConnect();

  try {
    const { serviceId, serviceName, userName, userPhone, userEmail, deviceModel, notes } = await request.json();

    console.log('📝 Получены данные для бронирования:', {
      serviceId, serviceName, userName, userPhone, userEmail, deviceModel, notes
    });

    let finalServiceName = serviceName || 'Не указана';
    let validServiceId = null;

    // ✅ Проверяем, является ли serviceId валидным ObjectId
    if (serviceId && isValidObjectId(serviceId)) {
      // Это реальная услуга из БД — пытаемся найти её
      try {
        const service = await Service.findById(serviceId);
        if (service) {
          finalServiceName = serviceName || service.name;
          validServiceId = serviceId;
          console.log('✅ Услуга найдена в БД:', service.name);
        } else {
          console.warn('⚠️ Услуга не найдена в БД, используем serviceName из запроса');
        }
      } catch (dbError) {
        console.warn('⚠️ Ошибка поиска услуги в БД:', dbError.message);
      }
    } else {
      // Это виртуальный ID (например, 'calculator-bundle') — не ищем в БД
      console.log('ℹ️ Виртуальный serviceId, используем serviceName из запроса:', serviceName);
    }

    const booking = new Booking({
      serviceId: validServiceId, // Сохраняем только валидный ObjectId или null
      serviceName: finalServiceName,
      userName,
      userPhone,
      userEmail,
      deviceModel,
      notes,
      status: 'pending'
    });

    await booking.save();

    console.log('✅ Бронирование создано успешно:', {
      id: booking._id,
      trackingCode: booking.trackingCode,
      serviceName: booking.serviceName
    });

    // Отправка уведомления в Telegram
    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
      try {
        const telegramMsg = `📝 Новая запись!\n\n` +
          `🔧 Услуга: ${booking.serviceName}\n` +
          `👤 Клиент: ${booking.userName}\n` +
          `📱 Телефон: ${booking.userPhone}\n` +
          `📧 Email: ${booking.userEmail || 'не указан'}\n` +
          `📱 Устройство: ${booking.deviceModel || 'не указано'}\n` +
          `📝 Заметки: ${booking.notes || 'нет'}\n` +
          `🆔 Трек-код: ${booking.trackingCode}`;

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.CHAT_ID,
            text: telegramMsg
          })
        });

        console.log('✅ Уведомление отправлено в Telegram');
      } catch (telegramError) {
        console.error('❌ Ошибка отправки в Telegram:', telegramError);
      }
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

// GET - получение всех бронирований
export async function GET() {
  await dbConnect();

  try {
    const bookings = await Booking.find()
      .populate('serviceId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - обновление статуса бронирования
export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const { status } = await request.json();

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

    const previousStatus = booking.status;
    booking.status = status;

    booking.statusHistory.push({
      status: status,
      changedAt: new Date(),
      note: `Статус изменен с "${previousStatus}" на "${status}"`
    });

    await booking.save();

    console.log(`✅ Статус бронирования ${id} обновлен: ${previousStatus} -> ${status}`);

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