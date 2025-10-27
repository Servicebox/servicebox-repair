import { NextResponse } from 'next/server';

import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    // Ищем администратора в базе данных
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Сравниваем пароль
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
      { id: admin._id, isAdmin: true }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );

    // Возвращаем успешный ответ с токеном
    return new Response(JSON.stringify({ token }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}