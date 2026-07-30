export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { phoneMatchRegex } from '@/lib/phone';

function validateApiKey(request) {
  const envKey = process.env.CRM_BONUS_API_KEY;
  if (!envKey) return false;

  const auth = request.headers.get('authorization') ?? '';
  const key = auth.replace('Bearer ', '').trim();
  if (!key) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(envKey));
  } catch {
    return false;
  }
}

const redeemSchema = z.object({
  phone: z.string().min(7),
  points: z.number().positive(),
});

export async function POST(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = redeemSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const matcher = phoneMatchRegex(body.phone);
  if (!matcher) {
    return NextResponse.json({ error: 'Неверный телефон' }, { status: 400 });
  }

  const updatedUser = await User.findOneAndUpdate(
    { phone: matcher, bonuses: { $gte: body.points } },
    { $inc: { bonuses: -body.points } },
    { new: true, select: 'bonuses' }
  );

  if (!updatedUser) {
    return NextResponse.json({ error: 'Недостаточно бонусов или клиент не найден' }, { status: 409 });
  }

  await BonusTransaction.create({
    userId: updatedUser._id,
    type: 'spend',
    points: -body.points,
    description: 'Списание бонусов в сервисном центре (CRM)',
  });

  return NextResponse.json({ ok: true, newBalance: updatedUser.bonuses });
}
