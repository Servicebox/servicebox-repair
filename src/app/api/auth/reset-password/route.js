// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Токен и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Находим пользователя по токену сброса
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Недействительный или просроченный токен сброса' },
        { status: 400 }
      );
    }

    // Обновляем пароль
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({
      message: 'Пароль успешно изменен'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при сбросе пароля' },
      { status: 500 }
    );
  }
}