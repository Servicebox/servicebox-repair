export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateToken, hashToken } from '@/lib/authTokens';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email обязателен' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Всегда возвращаем успех для предотвращения перебора email
    if (!user) {
      return NextResponse.json({
        message: 'Если email существует, ссылка для сброса пароля была отправлена'
      });
    }

    // Генерируем токен сброса: сырой уходит в письмо, в БД — только SHA-256 хеш
    const resetToken = generateToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 час

    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: hashToken(resetToken), resetPasswordExpires: resetTokenExpiry } }
    );

    // Отправляем email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
      
      return NextResponse.json({
        message: 'Если email существует, ссылка для сброса пароля была отправлена'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { message: 'Ошибка при отправке email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при запросе сброса пароля' },
      { status: 500 }
    );
  }
}