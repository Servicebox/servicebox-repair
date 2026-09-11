export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import PriceItem from '@/models/PriceItem';
import { requireAdmin } from '@/lib/authGuard';

const patchSchema = z.object({
  name: z.string().trim().min(1, 'Укажите наименование').max(300).optional(),
  model: z.string().trim().max(200).optional(),
  revision: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  retailPrice: z.number().min(0, 'Цена не может быть отрицательной').optional(),
  purchasePrice: z.number().min(0).nullable().optional(),
  quantity: z.number().min(0).optional(),
  description: z.string().trim().max(2000).optional(),
});

// PATCH /api/admin/price-items/[id] — обновить одну позицию (частично)
export async function PATCH(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Некорректный id' }, { status: 400 });
  }

  let body;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ success: false, error: 'Нет данных для обновления' }, { status: 400 });
  }

  await dbConnect();
  const item = await PriceItem.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
  if (!item) {
    return NextResponse.json({ success: false, error: 'Позиция не найдена' }, { status: 404 });
  }

  return NextResponse.json({ success: true, item });
}

// DELETE /api/admin/price-items/[id] — удалить одну позицию
export async function DELETE(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Некорректный id' }, { status: 400 });
  }

  await dbConnect();
  const item = await PriceItem.findByIdAndDelete(id);
  if (!item) {
    return NextResponse.json({ success: false, error: 'Позиция не найдена' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
