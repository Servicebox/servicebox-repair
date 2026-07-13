export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import Brand from '@/models/Brand';
import ModelDoc from '@/models/Model';
import Service from '@/models/Service';

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  multiplier: z.number().positive().optional()
});

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

// PUT /api/admin/brands/[id] — обновить название/мультипликатор бренда
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
    return NextResponse.json({ error: 'Неверный формат данных', details: err.errors }, { status: 400 });
  }

  await dbConnect();
  const brand = await Brand.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!brand) {
    return NextResponse.json({ error: 'Бренд не найден' }, { status: 404 });
  }

  return NextResponse.json({ success: true, brand });
}

// DELETE /api/admin/brands/[id] — удалить бренд, его модели и связанные priceVariants
export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
  }

  await dbConnect();

  const models = await ModelDoc.find({ brandId: id }).select('_id').lean();
  const modelIds = models.map(m => m._id);

  if (modelIds.length) {
    await Service.updateMany(
      { 'priceVariants.modelId': { $in: modelIds } },
      { $pull: { priceVariants: { modelId: { $in: modelIds } } } }
    );
    await ModelDoc.deleteMany({ brandId: id });
  }

  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    return NextResponse.json({ error: 'Бренд не найден' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
