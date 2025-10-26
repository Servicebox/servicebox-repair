// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';


export async function POST(request) {
  try {
    await dbConnect();
    
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token обязателен' },
        { status: 400 }
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Ищем пользователя с этим refresh token
      let user = await User.findOne({ 
        _id: decoded.userId, 
        refreshToken: refreshToken 
      }).select('-password');
      
      if (!user) {
        user = await Admin.findOne({ 
          _id: decoded.userId, 
          refreshToken: refreshToken 
        }).select('-password');
      }

      if (!user) {
        return NextResponse.json(
          { message: 'Невалидный refresh token' },
          { status: 401 }
        );
      }

      // Генерируем новый access token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return NextResponse.json({
        token
      });

    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Невалидный refresh token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}