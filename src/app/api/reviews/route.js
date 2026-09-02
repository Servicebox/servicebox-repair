export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Review from '@/models/Review';
import User from '@/models/User';

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text:   z.string().trim().min(10, 'Минимум 10 символов').max(3000, 'Максимум 3000 символов'),
});

const listSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// GET /api/reviews?page=1&limit=10  — только одобренные отзывы
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const { page, limit } = listSchema.parse(Object.fromEntries(searchParams));
  const skip = (page - 1) * limit;

  const filter = { status: 'approved' };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id username avatar')
    .lean();
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const items = reviews.map(r => ({
    ...r,
    author: userMap[r.userId.toString()] ?? null,
  }));

  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/reviews
export async function POST(request) {
  await dbConnect();

  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  // Проверяем: нет ли уже активного (pending/approved) отзыва от этого юзера
  const existing = await Review.findOne({
    userId: user.id,
    status: { $in: ['pending', 'approved'] },
  }).lean();

  if (existing) {
    return NextResponse.json(
      { error: 'У вас уже есть активный отзыв. Дождитесь рассмотрения или его отклонения.' },
      { status: 409 }
    );
  }

  const review = await Review.create({
    userId: user.id,
    rating: body.rating,
    text:   body.text,
    status: 'pending',
  });

  return NextResponse.json(
    { ...review.toObject(), message: 'Отзыв отправлен на модерацию' },
    { status: 201 }
  );
}
