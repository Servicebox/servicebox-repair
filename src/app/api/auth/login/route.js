export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

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

    const user = await User.findOne({ email }).select('+password +tokenVersion');

    // Ветка «нет пользователя»: всё равно тратим время на bcrypt и отвечаем
    // тем же 401, что и при неверном пароле — не раскрываем, есть ли аккаунт.
    if (!user || !user.password) {
      await bcrypt.compare(password, DUMMY_HASH);
      return NextResponse.json({ message: 'Неверные учетные данные' }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
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
