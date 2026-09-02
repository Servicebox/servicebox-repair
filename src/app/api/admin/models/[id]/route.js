export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { requireAdminSession as requireAdmin } from '@/lib/authGuard';
import ModelDoc from '@/models/Model';
import Service from '@/models/Service';

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  gen: z.number().optional(),
  portType: z.string().trim().optional(),
  hasSeparateGlass: z.boolean().optional(),
  hasBga: z.boolean().optional(),
  hasThermalPads: z.boolean().optional(),
  tvType: z.string().trim().optional()
});

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// PUT /api/admin/models/[id] — обновить параметры модели устройства
export async function PUT(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
  }

  let body;
  try {
    body = updateSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверный формат данных', details: err.issues }, { status: 400 });
  }

  await dbConnect();
  const model = await ModelDoc.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!model) {
    return NextResponse.json({ error: 'Модель не найдена' }, { status: 404 });
  }

  return NextResponse.json({ success: true, model });
}

// DELETE /api/admin/models/[id] — удалить модель и связанные priceVariants
export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
  }

  await dbConnect();

  await Service.updateMany(
    { 'priceVariants.modelId': id },
    { $pull: { priceVariants: { modelId: id } } }
  );

  const model = await ModelDoc.findByIdAndDelete(id);
  if (!model) {
    return NextResponse.json({ error: 'Модель не найдена' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
