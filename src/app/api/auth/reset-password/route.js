// app/api/auth/reset-password/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashToken } from '@/lib/authTokens';
import { sendPasswordChangedEmail } from '@/lib/email';
import { consumeRateLimit, rateLimitResponse, getClientIp, rlKey } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    await dbConnect();

    // Ограничиваем перебор токена сброса по IP.
    const rl = await consumeRateLimit(rlKey('reset-ip', getClientIp(request)), {
      max: 15,
      windowMs: 15 * 60 * 1000,
    });
    if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Токен и пароль обязательны' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { message: 'Пароль должен содержать от 6 до 128 символов' },
        { status: 400 }
      );
    }

    // В БД лежит SHA-256 хеш токена — ищем по хешу входящего значения.
    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+tokenVersion');

    if (!user) {
      return NextResponse.json(
        { message: 'Недействительный или просроченный токен сброса' },
        { status: 400 }
      );
    }

    // Обновляем пароль (хэшируется в pre('save') модели User)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();
    // Инвалидируем все ранее выданные сессии этого пользователя.
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;

    await user.save({ validateModifiedOnly: true });

    console.warn('[security] password reset completed', {
      userId: user._id.toString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Уведомление на почту — best-effort, не влияет на ответ.
    sendPasswordChangedEmail(user.email, user.username).catch((e) =>
      console.error('sendPasswordChangedEmail failed:', e)
    );

    return NextResponse.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при сбросе пароля' },
      { status: 500 }
    );
  }
}
