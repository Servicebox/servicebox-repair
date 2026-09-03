// src/app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getServerSession } from '@/lib/session';
import { assertSameOrigin } from '@/lib/authGuard';

const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'];

/**
 * Смена статуса брони.
 *  - администратор — любой статус (панель /admin-panel/bookings, /tracking);
 *  - обычный пользователь — только СВОЯ бронь (совпадение userEmail с email
 *    сессии) и только отмена ('canceled') — как делает UserBookings.js.
 * Раньше эндпоинт не проверял ничего: аноним мог перевести любую бронь по id
 * в любой статус.
 */
async function updateBookingStatus(request, id) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const session = await getServerSession(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Требуется вход в аккаунт' },
      { status: 401 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Некорректный id' }, { status: 400 });
  }

  const { status } = await request.json().catch(() => ({}));
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: 'Недопустимый статус' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ success: false, message: 'Бронирование не найдено' }, { status: 404 });
  }

  const isAdmin = session.role === 'admin';
  if (!isAdmin) {
    // Отмена своей брони — только с подтверждённым email аккаунта, иначе
    // тот, кто зарегистрировал чужой email, смог бы отменять гостевые брони.
    if (!session.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Подтвердите email, чтобы управлять записями' },
        { status: 403 }
      );
    }
    const owns =
      booking.userEmail &&
      session.email &&
      booking.userEmail.toLowerCase() === session.email.toLowerCase();
    if (!owns) {
      return NextResponse.json({ success: false, message: 'Нет доступа к этой записи' }, { status: 403 });
    }
    if (status !== 'canceled') {
      return NextResponse.json(
        { success: false, message: 'Свою запись можно только отменить' },
        { status: 403 }
      );
    }
  }

  const previousStatus = booking.status;
  booking.status = status;
  booking.statusHistory.push({
    status,
    changedAt: new Date(),
    note: isAdmin
      ? `Статус изменён с "${previousStatus}" на "${status}"`
      : 'Отменено пользователем',
  });
  await booking.save();

  return NextResponse.json({ success: true, data: booking });
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    return await updateBookingStatus(request, id);
  } catch (error) {
    console.error('Update booking error:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    return await updateBookingStatus(request, id);
  } catch (error) {
    console.error('Patch booking error:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}
