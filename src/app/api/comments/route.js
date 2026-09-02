export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Comment from '@/models/Comment';
import User from '@/models/User';

const TARGET_TYPES = ['news', 'photo', 'promotion'];

const createSchema = z.object({
  targetId:   z.string().min(1),
  targetType: z.enum(TARGET_TYPES),
  text:       z.string().trim().min(2, 'Минимум 2 символа').max(2000, 'Максимум 2000 символов'),
});

const listSchema = z.object({
  targetId:   z.string().min(1),
  targetType: z.enum(TARGET_TYPES),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(50).default(20),
});

// GET /api/comments?targetId=...&targetType=news&page=1&limit=20
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  let params;
  try {
    params = listSchema.parse(Object.fromEntries(searchParams));
  } catch (err) {
    return NextResponse.json({ error: 'Неверные параметры', details: err.issues }, { status: 400 });
  }

  const { targetId, targetType, page, limit } = params;
  const skip = (page - 1) * limit;

  const filter = {
    targetId: new mongoose.Types.ObjectId(targetId),
    targetType,
    status: 'approved',
  };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  // Обогащаем данными авторов одним запросом
  const userIds = [...new Set(comments.map(c => c.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id username avatar')
    .lean();
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const items = comments.map(c => ({
    ...c,
    author: userMap[c.userId.toString()] ?? null,
  }));

  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/comments
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

  const comment = await Comment.create({
    userId:     user.id,
    targetId:   body.targetId,
    targetType: body.targetType,
    text:       body.text,
  });

  // Возвращаем с данными автора
  const author = await User.findById(user.id).select('_id username avatar').lean();

  return NextResponse.json({ ...comment.toObject(), author }, { status: 201 });
}
