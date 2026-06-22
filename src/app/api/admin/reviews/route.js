export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import Review from '@/models/Review';
import User from '@/models/User';

// GET /api/admin/reviews?status=pending&page=1&limit=20
export async function GET(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // pending | approved | rejected | all
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const skip   = (page - 1) * limit;

  const filter = status && status !== 'all' ? { status } : {};

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
  const users   = await User.find({ _id: { $in: userIds } }).select('_id username email').lean();
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const items = reviews.map(r => ({ ...r, author: userMap[r.userId.toString()] ?? null }));

  return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
