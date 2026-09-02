export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import BonusConfig from '@/models/BonusConfig';
import { getBonusRatePct } from '@/lib/bonuses';

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

export async function GET(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const ratePct = await getBonusRatePct();
  return NextResponse.json({ ratePct });
}

const rateSchema = z.object({
  ratePct: z.number().min(0).max(100),
});

export async function POST(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = rateSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  await BonusConfig.findOneAndUpdate(
    {},
    { ratePct: body.ratePct },
    { upsert: true }
  );

  return NextResponse.json({ ratePct: body.ratePct });
}
