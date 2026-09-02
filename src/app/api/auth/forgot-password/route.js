export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateToken, hashToken } from '@/lib/authTokens';
import { consumeRateLimit, rateLimitResponse, getClientIp, rlKey } from '@/lib/rateLimit';

const UNIFORM_OK = {
  message: 'Если email существует, ссылка для сброса пароля была отправлена',
};

export async function POST(request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email обязателен' }, { status: 400 });
    }
    const normEmail = email.toLowerCase().trim();

    // Лимиты: по IP и по email (считаем ВСЕ запросы, чтобы 429 не
    // раскрывал существование аккаунта).
    const ipRl = await consumeRateLimit(rlKey('forgot-ip', getClientIp(request)), {
      max: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (ipRl.limited) return rateLimitResponse(ipRl.retryAfterMs);

    const emailRl = await consumeRateLimit(rlKey('forgot-email', normEmail), {
      max: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (emailRl.limited) return rateLimitResponse(emailRl.retryAfterMs);

    // Ищем пользователя
    const user = await User.findOne({ email: normEmail });

    // Всегда возвращаем успех для предотвращения перебора email
    if (!user) {
      return NextResponse.json(UNIFORM_OK);
    }

    // Генерируем токен сброса: сырой уходит в письмо, в БД — только SHA-256 хеш
    const resetToken = generateToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 час

    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: hashToken(resetToken), resetPasswordExpires: resetTokenExpiry } }
    );

    // Отправляем email. Сбой отправки НЕ меняет ответ — иначе реальный
    // (но не доставившийся) email отличался бы от несуществующего.
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (emailError) {
      console.error('Forgot-password email send error:', emailError);
    }

    return NextResponse.json(UNIFORM_OK);
  } catch (error) {
    console.error('Forgot password error:', error);
    // Единообразный ответ даже при внутренней ошибке.
    return NextResponse.json(UNIFORM_OK);
  }
}