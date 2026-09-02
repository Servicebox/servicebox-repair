export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { assertSameOrigin } from '@/lib/authGuard';

export async function POST(request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const response = NextResponse.json({ message: 'Выход выполнен успешно' });

  // Инвалидируем ВСЕ ранее выданные токены этого пользователя (не только
  // текущую cookie): захваченный JWT перестаёт работать сразу, а не через
  // 7 дней. Best-effort — даже если что-то не так, cookie всё равно чистим.
  try {
    const token = request.cookies.get('token')?.value;
    const decoded = token ? verifyToken(token) : null;
    if (decoded?.userId) {
      await dbConnect();
      await User.updateOne({ _id: decoded.userId }, { $inc: { tokenVersion: 1 } });
    }
  } catch (error) {
    console.error('Logout tokenVersion bump failed:', error);
  }

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
