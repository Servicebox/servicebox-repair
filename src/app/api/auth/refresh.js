// app/api/re
import dbConnect from '@/lib/db';
import User from '@/models/User';

import { verifyToken, generateAccessToken } from '@/lib/tokens';
import { setTokens } from '@/lib/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const { userId, role } = decoded;
  const Model = role === 'admin' ? Admin : User;

  const user = await Model.findById(userId);
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({ userId, role });

  // Optionally, generate a new refresh token and update in database (rotate refresh token)
  // For now, we are not rotating the refresh token, but it is a good security practice.

  // Set the new access token in cookie
  res.setHeader('Set-Cookie', 
    serialize('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
  );

  res.status(200).json({ message: 'Token refreshed' });
}