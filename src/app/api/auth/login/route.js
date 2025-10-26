// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Неверные учетные данные' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Неверные учетные данные' },
        { status: 401 }
      );
    }

    // ВРЕМЕННО отключаем проверку верификации email
    // if (!user.emailVerified) {
    //   return NextResponse.json(
    //     { message: 'Подтвердите ваш email перед входом' },
    //     { status: 403 }
    //   );
    // }

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Обновляем последний вход
    user.lastLogin = new Date();
    await user.save();

    // Устанавливаем cookie
    const response = NextResponse.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при входе' },
      { status: 500 }
    );
  }
}