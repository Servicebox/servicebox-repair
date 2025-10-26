// lib/auth.js
import jwt from 'jsonwebtoken';
import dbConnect from './db';
import User from '@/models/User';

export async function verifyAdmin(request) {
  try {
    await dbConnect();
    
    // Получаем токен из cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Токен не предоставлен', status: 401 };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Ищем пользователя в обеих коллекциях
      let user = await User.findById(decoded.userId);
      if (!user) {
        user = await Admin.findById(decoded.userId);
      }

      if (!user) {
        return { success: false, error: 'Пользователь не найден', status: 404 };
      }

      // Проверяем роль администратора
      if (user.role !== 'admin') {
        return { success: false, error: 'Доступ запрещен. Требуются права администратора', status: 403 };
      }

      return { 
        success: true, 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return { success: false, error: 'Невалидный токен', status: 401 };
    }

  } catch (error) {
    console.error('Admin verification error:', error);
    return { success: false, error: 'Ошибка сервера', status: 500 };
  }
}