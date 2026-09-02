export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Favorite from '@/models/Favorite';
import Product from '@/models/Product';
import News from '@/models/News';
import Image from '@/models/Image';
import Promotion from '@/models/Promotion';

// Маппинг: itemType (нижний регистр из БД) → модель и поля
const TYPE_CONFIG = {
  product:   { Model: Product,   select: '_id name slug new_price images isActive' },
  news:      { Model: News,      select: '_id title slug excerpt featuredImage publishedAt' },
  photo:     { Model: Image,     select: '_id filePath description filename' },
  promotion: { Model: Promotion, select: '_id title shortDescription image endDate isActive' },
};

const ITEM_TYPES = Object.keys(TYPE_CONFIG);

const toggleSchema = z.object({
  itemId:   z.string().min(1),
  itemType: z.enum(ITEM_TYPES),
});

// GET /api/favorites?itemType=product&page=1&limit=12
// GET /api/favorites?itemType=product&checkId=<id>  — быстрая проверка одного документа
export async function GET(request) {
  await dbConnect();

  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const itemType = searchParams.get('itemType');
  const checkId  = searchParams.get('checkId');

  if (checkId) {
    const filter = { userId: user.id, itemId: checkId };
    if (itemType && ITEM_TYPES.includes(itemType)) filter.itemType = itemType;
    const exists = await Favorite.exists(filter);
    return NextResponse.json({ isSaved: !!exists });
  }

  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)));
  const skip  = (page - 1) * limit;

  const filter = { userId: new mongoose.Types.ObjectId(user.id) };
  if (itemType && ITEM_TYPES.includes(itemType)) filter.itemType = itemType;

  const [favorites, total] = await Promise.all([
    Favorite.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Favorite.countDocuments(filter),
  ]);

  // Группируем id по типу, затем параллельные запросы — без N+1 и без $lookup
  const grouped = {};
  for (const fav of favorites) {
    if (!grouped[fav.itemType]) grouped[fav.itemType] = [];
    grouped[fav.itemType].push(fav.itemId);
  }

  const populated = {};
  await Promise.all(
    Object.entries(grouped).map(async ([type, ids]) => {
      const cfg = TYPE_CONFIG[type];
      if (!cfg) return;
      const docs = await cfg.Model.find({ _id: { $in: ids } }).select(cfg.select).lean();
      populated[type] = Object.fromEntries(docs.map(d => [d._id.toString(), d]));
    })
  );

  const items = favorites
    .map(fav => {
      const doc = populated[fav.itemType]?.[fav.itemId.toString()];
      if (!doc) return null;
      return { favoriteId: fav._id, itemType: fav.itemType, addedAt: fav.createdAt, ...doc };
    })
    .filter(Boolean);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/favorites  { itemId, itemType }  — toggle
export async function POST(request) {
  await dbConnect();

  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  let body;
  try {
    body = toggleSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  const filter = { userId: user.id, itemId: body.itemId, itemType: body.itemType };
  const existing = await Favorite.findOne(filter).lean();

  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return NextResponse.json({ action: 'removed', itemId: body.itemId });
  }

  const favorite = await Favorite.create(filter);
  return NextResponse.json(
    { action: 'added', favoriteId: favorite._id, itemId: body.itemId },
    { status: 201 }
  );
}

// DELETE /api/favorites  { itemId, itemType }
export async function DELETE(request) {
  await dbConnect();

  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  let body;
  try {
    body = toggleSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  const result = await Favorite.deleteOne({ userId: user.id, itemId: body.itemId, itemType: body.itemType });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Не найдено в избранном' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Удалено из избранного' });
}
