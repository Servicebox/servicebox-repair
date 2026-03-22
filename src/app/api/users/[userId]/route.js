// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    console.log('=== UPDATE USER API CALLED ===', userId);

    await dbConnect();

    // Получаем токен из cookies вместо сессии
    const token = request.cookies.get('token')?.value;
    console.log('🔐 Token in update user API:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    // Проверяем токен
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔓 Decoded token in update user:', decoded);
    } catch (jwtError) {
      console.log('❌ Invalid token in update user:', jwtError.message);
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь администратор
    if (decoded.role !== 'admin') {
      console.log('❌ User is not admin in update user');
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    // Получаем данные из тела запроса
    const body = await request.json();
    console.log('📦 Update data:', body);

    // Обновляем пользователя
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -verificationToken -resetPasswordToken');

    if (!updatedUser) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    console.log('✅ User updated successfully');

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}

// Также добавьте другие методы если нужно (GET, DELETE и т.д.)

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    console.log('=== GET USER API CALLED ===', userId);

    await dbConnect();

    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    // Проверяем токен
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Проверяем, что пользователь администратор
      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
      }

      // Находим пользователя
      const user = await User.findById(userId).select('-password -refreshToken -verificationToken -resetPasswordToken');

      if (!user) {
        return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
      }

      return NextResponse.json({ user });

    } catch (jwtError) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    console.log('=== DELETE USER API CALLED ===', userId);

    await dbConnect();

    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    // Проверяем токен
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Проверяем, что пользователь администратор
      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
      }

      // Не позволяем удалить самого себя
      if (decoded.userId === userId) {
        return NextResponse.json({ message: 'Нельзя удалить собственный аккаунт' }, { status: 400 });
      }

      // Удаляем пользователя
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
      }

      console.log('✅ User deleted successfully');

      return NextResponse.json({ message: 'Пользователь удален' });

    } catch (jwtError) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}