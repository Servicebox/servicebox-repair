// src/app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

async function updateBookingStatus(id, status) {
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: 'Недопустимый статус' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ success: false, message: 'Бронирование не найдено' }, { status: 404 });
  }

  booking.status = status;
  booking.statusHistory.push({
    status,
    changedAt: new Date(),
    note: 'Статус изменён',
  });

  await booking.save();
  return NextResponse.json({ success: true, data: booking });
}

export async function PUT(request, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    const { status } = await request.json();
    return await updateBookingStatus(id, status);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    const { status } = await request.json();
    return await updateBookingStatus(id, status);
  } catch (error) {
    console.error('Patch booking error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}