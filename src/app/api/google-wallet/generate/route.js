export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import User from '@/models/User';
import { generateWalletJwt } from '@/lib/walletPass';

export async function GET(request) {
  await dbConnect();

  const caller = verifyToken(request);
  if (!caller) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const user = await User.findById(caller.id)
    .select('username firstName lastName bonuses googleWalletPassId')
    .lean();

  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  let saveUrl, objectId;
  try {
    ({ saveUrl, objectId } = generateWalletJwt({
      userId:   caller.id,
      username: displayName,
      bonuses:  user.bonuses ?? 0,
    }));
  } catch (err) {
    console.error('Wallet JWT generation error:', err.message);
    return NextResponse.json({ error: 'Ошибка генерации пропуска' }, { status: 500 });
  }

  // Сохраняем objectId в профиле если ещё не сохранён
  if (!user.googleWalletPassId) {
    await User.findByIdAndUpdate(caller.id, { googleWalletPassId: objectId });
  }

  return NextResponse.json({ saveUrl, objectId });
}
