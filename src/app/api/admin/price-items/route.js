export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import PriceItem from '@/models/PriceItem';
import { requireAdmin } from '@/lib/authGuard';

const MAX_LIMIT = 100;

const itemSchema = z.object({
  name: z.string().trim().min(1, 'Укажите наименование').max(300),
  model: z.string().trim().max(200).optional().default(''),
  revision: z.string().trim().max(100).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  retailPrice: z.number().min(0, 'Цена не может быть отрицательной'),
  purchasePrice: z.number().min(0).nullable().optional().default(null),
  quantity: z.number().min(0).optional().default(0),
  description: z.string().trim().max(2000).optional().default(''),
});

// GET /api/admin/price-items?q=&category=&page=&limit= — список для таблицы в админке
export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit'), 10) || 30));

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;

  const [items, total, categories] = await Promise.all([
    // При текстовом поиске сортируем по названию (не по релевантности —
    // $meta:'textScore' в sort требует его же в проекции, а лишняя
    // проекция рискует случайно обрезать поля ответа). Список небольшой,
    // алфавитный порядок при поиске читается не хуже.
    PriceItem.find(filter)
      .sort(q ? { name: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PriceItem.countDocuments(filter),
    PriceItem.distinct('category', { category: { $ne: '' } }),
  ]);

  return NextResponse.json({
    success: true,
    items,
    total,
    page,
    limit,
    categories: categories.sort((a, b) => a.localeCompare(b, 'ru')),
  });
}

// POST /api/admin/price-items — создать одну позицию
export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body;
  try {
    body = itemSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  await dbConnect();
  const item = await PriceItem.create(body);
  return NextResponse.json({ success: true, item }, { status: 201 });
}

// DELETE /api/admin/price-items?confirm=DELETE_ALL — очистить весь прайс-лист.
// Отдельный жёсткий параметр — чтобы случайный вызов без подтверждения
// от UI ничего не стёр.
export async function DELETE(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  if (searchParams.get('confirm') !== 'DELETE_ALL') {
    return NextResponse.json({ success: false, error: 'Требуется подтверждение' }, { status: 400 });
  }

  await dbConnect();
  const result = await PriceItem.deleteMany({});
  return NextResponse.json({ success: true, deletedCount: result.deletedCount });
}
