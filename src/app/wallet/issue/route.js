export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { findOrCreateUserByPhone } from '@/lib/bonuses';
import { generateWalletJwt } from '@/lib/walletPass';

export async function GET(request) {
  await dbConnect();

  const phone = new URL(request.url).searchParams.get('phone');
  const user = await findOrCreateUserByPhone(phone);
  if (!user) {
    return NextResponse.json({ error: 'Неверный номер телефона' }, { status: 400 });
  }

  const { saveUrl } = generateWalletJwt({
    userId: user._id.toString(),
    username: user.username,
    bonuses: user.bonuses,
  });

  return NextResponse.redirect(saveUrl);
}
