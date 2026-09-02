// lib/session.js
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User'; // ← только User

export async function getServerSession(request) {
  try {
    await dbConnect();
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(valueParts.join('='));
    });

    const token = cookies['token'];
    if (!token) return null;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (e) {
      return null;
    }

    const user = await User.findById(decoded.userId).select('-password +tokenVersion');
    if (!user) return null;

    // Заблокированный аккаунт — не сессия.
    if (user.isActive === false) return null;

    // Реальная инвалидация ранее выданных JWT: при смене пароля / роли /
    // выходе tokenVersion в БД инкрементируется. Токены без claim tv
    // (выпущенные до внедрения) трактуем как tv:0.
    if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) return null;

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      emailVerified: !!user.emailVerified,
    };
  } catch (error) {
    return null;
  }
}