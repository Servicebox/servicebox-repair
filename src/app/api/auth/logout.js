import dbConnect from '@/lib/db';
import User from '@/models/User';

import { verifyToken } from '@/lib/tokens';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  // Get the refresh token from the cookie
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Verify the token to get the user ID and role
    const decoded = verifyToken(refreshToken);
    if (decoded) {
      const { userId, role } = decoded;
      // Depending on the role, we use the appropriate model
      const Model = role === 'admin' ? Admin : User;
      await Model.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
    }
  }

  // Clear the cookies
  res.setHeader('Set-Cookie', [
    serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    }),
    serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    }),
  ]);

  res.status(200).json({ message: 'Logout successful' });
}