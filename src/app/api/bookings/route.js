// src/app/api/bookings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import { verifyToken } from '@/lib/auth-helpers';
import { fetchCrm } from '@/lib/crmClient';

export async function POST(request) {
  await dbConnect();

  try {
    const { serviceId, serviceName, userName, userPhone, userEmail, deviceModel, notes } = await request.json();

    console.log('📝 Получены данные для бронирования:', {
      serviceId, serviceName, userName, userPhone, userEmail, deviceModel, notes
    });

    // Проверка существования услуги и получение serviceName
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { message: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    console.log('✅ Услуга найдена:', service.name);

    // Используем serviceName из запроса ИЛИ из найденной услуги
    const finalServiceName = serviceName || service.name;

    const booking = new Booking({
      serviceId,
      serviceName: finalServiceName, // Гарантируем, что serviceName будет заполнен
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

    // Дублируем заявку в CRM как заказ — best-effort, не блокирует ответ клиенту
    // и не должно ронять бронирование, если CRM недоступна. Локальная запись
    // (Booking, trackingCode, /admin-panel/bookings, история в профиле
    // пользователя) остаётся источником правды для сайта — это лишь копия
    // для CRM, чтобы сотрудники видели заявку рядом со своими заказами.
    try {
      const crmRes = await fetchCrm('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          clientName: userName,
          clientPhone: userPhone,
          clientEmail: userEmail || undefined,
          deviceType: 'Не указано (запись через сайт)',
          deviceModel: deviceModel || undefined,
          defectDescription: `Услуга: ${finalServiceName}${notes ? `\n${notes}` : ''}`,
          source: 'сайт (запись)',
        }),
      });
      if (crmRes && !crmRes.ok) {
        console.error('[bookings] CRM ответил ошибкой:', crmRes.status, await crmRes.text().catch(() => ''));
      }
    } catch (crmError) {
      console.error('❌ Ошибка отправки заявки в CRM:', crmError);
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

// GET - для пользователя: только свои заявки; для admin: все
export async function GET(request) {
  await dbConnect();

  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Не авторизован' }, { status: 401 });
    }

    // Admin видит все бронирования, обычный пользователь — только свои
    const query = user.role === 'admin' ? {} : { userEmail: user.email };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });

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
    const { id } = params; // получаем id из параметров пути
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

    // Сохраняем предыдущий статус для истории
    const previousStatus = booking.status;

    // Обновляем статус
    booking.status = status;

    // Добавляем запись в историю статусов
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
