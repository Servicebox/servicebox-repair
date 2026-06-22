export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import CalculatorConfig from '@/models/CalculatorConfig';

// Минимальная структура — убеждаемся, что это объект с хотя бы одним ключом
const configSchema = z.object({
  pricingData: z.record(z.unknown()).refine(
    data => Object.keys(data).length > 0,
    { message: 'pricingData не должен быть пустым объектом' }
  )
});

// GET /api/admin/calculator-config — только для авторизованных
export async function GET(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const config = await CalculatorConfig.findOne().lean();
  if (!config) {
    return NextResponse.json({ error: 'Конфигурация не найдена' }, { status: 404 });
  }

  return NextResponse.json({ success: true, pricingData: config.pricingData });
}

// PUT /api/admin/calculator-config — полная замена конфигурации
export async function PUT(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = configSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверный формат данных', details: err.errors }, { status: 400 });
  }

  const config = await CalculatorConfig.findOneAndUpdate(
    {},
    { $set: { pricingData: body.pricingData } },
    { new: true, upsert: true, runValidators: true }
  );

  return NextResponse.json({ success: true, message: 'Конфигурация сохранена', id: config._id });
}
