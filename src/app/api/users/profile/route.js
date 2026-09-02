// app/api/users/profile/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-helpers';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();

    const auth = await verifyToken(request);
    if (!auth) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const user = await User.findById(auth.id).select('-password -verificationToken -resetPasswordToken');
    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();

    const auth = await verifyToken(request);
    if (!auth) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();

    // Допускаемые поля для обновления
    const allowedFields = ['firstName', 'lastName', 'phone', 'city', 'bio', 'avatar'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      auth.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    return NextResponse.json({
      message: 'Профиль обновлен',
      user
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
