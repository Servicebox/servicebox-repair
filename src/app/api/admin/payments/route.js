export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import PaymentConfig from '@/models/PaymentConfig';

const PROVIDERS = ['tinkoff', 'yandex_split'];

const patchSchema = z.object({
  provider: z.enum(PROVIDERS),
  isActive: z.boolean(),
});

// GET /api/admin/payments  — список конфигураций всех провайдеров
export async function GET(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Создаём дефолтные записи если их нет
  await Promise.all(
    PROVIDERS.map(provider =>
      PaymentConfig.findOneAndUpdate(
        { provider },
        { $setOnInsert: { provider, isActive: false } },
        { upsert: true, new: true }
      )
    )
  );

  const configs = await PaymentConfig.find({ provider: { $in: PROVIDERS } }).lean();
  return NextResponse.json({ configs });
}

// PATCH /api/admin/payments  { provider, isActive }
export async function PATCH(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const updated = await PaymentConfig.findOneAndUpdate(
    { provider: body.provider },
    { $set: { isActive: body.isActive } },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ config: updated });
}
