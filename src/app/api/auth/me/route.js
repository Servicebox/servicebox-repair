import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await dbConnect();

    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    try {
      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Находим пользователя
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { message: 'Пользователь не найден' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });

    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}