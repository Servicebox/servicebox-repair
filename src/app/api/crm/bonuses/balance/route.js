export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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

export async function GET(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId');
  if (userId) {
    let user;
    try {
      user = await User.findById(userId).select('bonuses').lean();
    } catch (err) {
      if (err.name === 'CastError') {
        return NextResponse.json({ error: 'Неверный userId' }, { status: 400 });
      }
      throw err;
    }
    return NextResponse.json({ balance: user?.bonuses ?? 0 });
  }

  const phonesParam = searchParams.get('phones');
  if (phonesParam) {
    const phones = phonesParam.split(',').map(p => p.trim()).filter(Boolean).slice(0, 50);
    const balances = {};
    for (const phone of phones) {
      const matcher = phoneMatchRegex(phone);
      if (!matcher) {
        balances[phone] = 0;
        continue;
      }
      const user = await User.findOne({ phone: matcher }).select('bonuses').lean();
      balances[phone] = user?.bonuses ?? 0;
    }
    return NextResponse.json({ balances });
  }

  const phone = searchParams.get('phone');
  const matcher = phoneMatchRegex(phone);
  if (!matcher) {
    return NextResponse.json({ error: 'phone обязателен и должен быть валидным' }, { status: 400 });
  }

  const user = await User.findOne({ phone: matcher }).select('bonuses').lean();
  return NextResponse.json({ balance: user?.bonuses ?? 0 });
}
