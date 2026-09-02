export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { consumeRateLimit, resetRateLimit, rateLimitResponse, getClientIp, rlKey } from '@/lib/rateLimit';

// Лимиты входа: по IP — все попытки (щедрый предел, т.к. nginx уже режет
// /api/auth/login до 2 r/s на реальный IP; здесь — только санитарный потолок,
// чтобы не пострадали пользователи за общим NAT); по email — только НЕУДАЧНЫЕ
// (сбрасываются при успешном входе), окно короткое.
const IP_MAX = 30;
const IP_WINDOW_MS = 5 * 60 * 1000;
const EMAIL_FAIL_MAX = 8;
const EMAIL_FAIL_WINDOW_MS = 15 * 60 * 1000;

// Фиксированный валидный bcrypt-хэш (cost 12) от случайной строки.
// Используется, когда пользователь не найден: bcrypt.compare всё равно
// выполняется, чтобы время ответа не зависело от существования аккаунта
// (защита от перебора email по таймингу).
const DUMMY_HASH = '$2b$12$xlEaZwjH9nIvnNmLx.nAQu2c/10oQ4.sZYMh6MFfoCRP/nJOFlIHW';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 });
    }

    // Rate-limit ДО любой работы с БД/bcrypt.
    const ip = getClientIp(request);
    const ipRl = await consumeRateLimit(rlKey('login-ip', ip), { max: IP_MAX, windowMs: IP_WINDOW_MS });
    if (ipRl.limited) return rateLimitResponse(ipRl.retryAfterMs);

    const emailFailKey = rlKey('login-fail', email);
    const emailRl = await consumeRateLimit(emailFailKey, {
      max: EMAIL_FAIL_MAX,
      windowMs: EMAIL_FAIL_WINDOW_MS,
      peek: true,
    });
    if (emailRl.limited) {
      const mins = Math.max(1, Math.ceil(emailRl.retryAfterMs / 60000));
      return NextResponse.json(
        {
          code: 'ACCOUNT_LOCKED',
          message: `Слишком много неудачных попыток входа. Повторите через ~${mins} мин или воспользуйтесь «Забыли пароль?».`,
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(emailRl.retryAfterMs / 1000)) } }
      );
    }

    const user = await User.findOne({ email }).select('+password +tokenVersion');

    // Ветка «нет пользователя»: всё равно тратим время на bcrypt и отвечаем
    // тем же 401, что и при неверном пароле — не раскрываем, есть ли аккаунт.
    if (!user || !user.password) {
      await bcrypt.compare(password, DUMMY_HASH);
      await consumeRateLimit(emailFailKey, { max: EMAIL_FAIL_MAX, windowMs: EMAIL_FAIL_WINDOW_MS });
      return NextResponse.json({ message: 'Неверные учетные данные' }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await consumeRateLimit(emailFailKey, { max: EMAIL_FAIL_MAX, windowMs: EMAIL_FAIL_WINDOW_MS });
      return NextResponse.json({ message: 'Неверные учетные данные' }, { status: 401 });
    }

    // Пароль верный — теперь можно раскрыть состояние аккаунта.
    if (user.isActive === false) {
      return NextResponse.json(
        { message: 'Аккаунт заблокирован. Обратитесь в поддержку.' },
        { status: 403 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Подтвердите email, чтобы войти. Проверьте почту или запросите новое письмо.',
        },
        { status: 403 }
      );
    }

    // Успешный вход — снимаем накопленный lockout по email.
    await resetRateLimit(emailFailKey);

    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion ?? 0,
    });

    // Обновляем lastLogin точечно (updateOne), а не user.save() — иначе
    // Mongoose прогонит валидацию всего документа, и любой легаси-профиль,
    // не проходящий новые ограничения (maxlength username/email), давал бы
    // 500 при каждом входе. lastLogin в хэшировании/хуках не нуждается.
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    const response = NextResponse.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Ошибка сервера при входе' }, { status: 500 });
  }
}
