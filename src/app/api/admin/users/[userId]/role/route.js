// app/api/admin/users/[id]/role/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

import jwt from 'jsonwebtoken';

async function checkAdminAuth(request) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Не авторизован', status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await User.findById(decoded.userId);
    if (!user) {
      user = await Admin.findById(decoded.userId);
    }

    if (!user) {
      return { success: false, error: 'Пользователь не найден', status: 401 };
    }

    if (user.role !== 'admin') {
      return { success: false, error: 'Доступ запрещен', status: 403 };
    }

    return { success: true, user };

  } catch (error) {
    return { success: false, error: 'Невалидный токен', status: 401 };
  }
}

export async function PUT(request, { params }) {
  const authResult = await checkAdminAuth(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = params;
    const { role } = await request.json();

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Некорректная роль' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    let user = await User.findById(id);
    let isAdminCollection = false;

    if (!user) {
      user = await Admin.findById(id);
      isAdminCollection = true;
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Обновляем роль
    user.role = role;
    await user.save();

    return NextResponse.json({
      message: 'Роль пользователя успешно изменена'
    });

  } catch (error) {
    console.error('Change role error:', error);
    return NextResponse.json(
      { message: 'Ошибка при изменении роли' },
      { status: 500 }
    );
  }
}