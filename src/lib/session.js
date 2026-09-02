// lib/session.js
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User'; // ← только User
import { getTokenCookie } from '@/lib/cookies';

export async function getServerSession(request) {
  try {
    await dbConnect();

    const token = getTokenCookie(request);
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