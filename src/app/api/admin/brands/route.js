export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import Brand from '@/models/Brand';
import ModelDoc from '@/models/Model';

const createSchema = z.object({
  name: z.string().trim().min(1),
  deviceType: z.string().trim().min(1),
  multiplier: z.number().positive().default(1)
});

async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

// GET /api/admin/brands?deviceType=phone — бренды устройства с вложенными моделями
export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deviceType = new URL(request.url).searchParams.get('deviceType');
  if (!deviceType) {
    return NextResponse.json({ error: 'deviceType обязателен' }, { status: 400 });
  }

  await dbConnect();

  const brands = await Brand.find({ deviceType }).sort({ name: 1 }).lean();
  const models = await ModelDoc.find({ brandId: { $in: brands.map(b => b._id) } })
    .sort({ name: 1 })
    .lean();

  const modelsByBrand = new Map();
  for (const model of models) {
    const key = model.brandId.toString();
    if (!modelsByBrand.has(key)) modelsByBrand.set(key, []);
    modelsByBrand.get(key).push(model);
  }

  const result = brands.map(brand => ({
    ...brand,
    models: modelsByBrand.get(brand._id.toString()) || []
  }));

  return NextResponse.json({ success: true, brands: result });
}

// POST /api/admin/brands — создать бренд
export async function POST(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверный формат данных', details: err.errors }, { status: 400 });
  }

  await dbConnect();
  const brand = await Brand.create(body);

  return NextResponse.json({ success: true, brand }, { status: 201 });
}
