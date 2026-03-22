import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { username, email, password, phone } = await request.json();

    // Валидация
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Имя, email и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем существующего пользователя
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Создаем токен верификации
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Создаем пользователя
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      verificationToken,
      verificationTokenExpires,
      emailVerified: false
    });

    await user.save();

    // Отправляем email для верификации
    try {
      await sendVerificationEmail(user.email, verificationToken, user.username);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json({
      message: 'Регистрация успешна! Проверьте ваш email для подтверждения.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}