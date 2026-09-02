export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { requireAdminSession as requireAdmin } from '@/lib/authGuard';
import Service from '@/models/Service';
import { getPricingMatrixData } from '@/lib/pricing-matrix';

// GET /api/admin/pricing-matrix?deviceType=phone
export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deviceType = new URL(request.url).searchParams.get('deviceType');
  if (!deviceType) {
    return NextResponse.json({ error: 'deviceType обязателен' }, { status: 400 });
  }

  await dbConnect();
  const data = await getPricingMatrixData(deviceType);

  return NextResponse.json({ success: true, ...data });
}

const saveSchema = z.object({
  changes: z.array(z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    modelId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    price: z.number().nonnegative()
  })).default([]),
  basePrices: z.array(z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    basePrice: z.number().nonnegative().nullable()
  })).default([])
});

// PUT /api/admin/pricing-matrix — массовое сохранение ячеек матрицы (priceVariants + basePrice)
export async function PUT(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = saveSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверный формат данных', details: err.issues }, { status: 400 });
  }

  await dbConnect();

  const changesByService = new Map();
  for (const change of body.changes) {
    if (!changesByService.has(change.serviceId)) changesByService.set(change.serviceId, []);
    changesByService.get(change.serviceId).push(change);
  }

  for (const [serviceId, changes] of changesByService) {
    const service = await Service.findById(serviceId).select('priceVariants').lean();
    if (!service) continue;

    const variants = [...(service.priceVariants || [])];
    for (const { modelId, price } of changes) {
      const idx = variants.findIndex(v => String(v.modelId) === modelId);
      if (idx >= 0) variants[idx] = { modelId, price };
      else variants.push({ modelId, price });
    }

    await Service.updateOne({ _id: serviceId }, { $set: { priceVariants: variants } });
  }

  for (const { serviceId, basePrice } of body.basePrices) {
    await Service.updateOne({ _id: serviceId }, { $set: { basePrice } });
  }

  return NextResponse.json({ success: true, updated: changesByService.size, basePricesUpdated: body.basePrices.length });
}
