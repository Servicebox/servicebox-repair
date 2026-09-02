// app/api/auth/me/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from '@/lib/session';

export async function GET(request) {
  try {
    await dbConnect();

    // getServerSession проверяет подпись (HS256), существование пользователя,
    // роль из БД и tokenVersion (отзыв ранее выданных токенов).
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        avatar: user.avatar || '',
        avatarUrl: user.avatarUrl || '',
        bonuses: user.bonuses ?? 0,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
