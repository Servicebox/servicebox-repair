// app/api/admin/users/route.js
// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session'; // ← ваша реализация
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;
  const searchFilter = search
    ? {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(searchFilter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalUsers = await User.countDocuments(searchFilter);

  return NextResponse.json({
    users: users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      limit,
    },
  });
}