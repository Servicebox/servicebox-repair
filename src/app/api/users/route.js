// app/api/users/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    console.log('🎯 === ADMIN USERS API CALLED ===');

    await dbConnect();

    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value;
    console.log('🔐 Token in API:', token);

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔓 Decoded token:', decoded);
    } catch (jwtError) {
      console.log('❌ Invalid token');
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь администратор
    if (decoded.role !== 'admin') {
      console.log('❌ User is not admin');
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    // Получаем параметры пагинации из URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Получаем пользователей
    const users = await User.find({})
      .select('-password -refreshToken -verificationToken -resetPasswordToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Общее количество пользователей
    const total = await User.countDocuments();

    console.log(`✅ Fetched ${users.length} users`);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}