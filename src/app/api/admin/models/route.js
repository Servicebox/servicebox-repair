export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { requireAdminSession as requireAdmin } from '@/lib/authGuard';
import Brand from '@/models/Brand';
import ModelDoc from '@/models/Model';

const createSchema = z.object({
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Некорректный brandId'),
  name: z.string().trim().min(1),
  gen: z.number().default(1),
  portType: z.string().trim().optional(),
  hasSeparateGlass: z.boolean().default(false),
  hasBga: z.boolean().default(false),
  hasThermalPads: z.boolean().default(false),
  tvType: z.string().trim().optional()
});

// POST /api/admin/models — создать модель устройства для бренда
export async function POST(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверный формат данных', details: err.issues }, { status: 400 });
  }

  await dbConnect();

  const brand = await Brand.findById(body.brandId).lean();
  if (!brand) {
    return NextResponse.json({ error: 'Бренд не найден' }, { status: 404 });
  }

  const model = await ModelDoc.create(body);

  return NextResponse.json({ success: true, model }, { status: 201 });
}
