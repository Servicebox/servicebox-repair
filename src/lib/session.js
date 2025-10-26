// lib/session.js
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
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return null;
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    if (!user) return null;

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    };
  } catch (error) {
    return null;
  }
}