export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import { getServerSession } from '@/lib/session';
import { assertSameOrigin } from '@/lib/authGuard';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { syncWalletBalance } from '@/lib/walletPass';

const adminAdjustSchema = z.object({
  userId:      z.string().min(1),
  type:        z.enum(['earn', 'spend', 'adjust']),
  points:      z.number().positive('Введите положительное число баллов'),
  description: z.string().trim().min(3, 'Укажите причину').max(500),
});

const historySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/bonuses  — баланс и история текущего пользователя
export async function GET(request) {
  await dbConnect();

  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const { page, limit } = historySchema.parse(Object.fromEntries(searchParams));
  const skip = (page - 1) * limit;

  const [userData, transactions, total] = await Promise.all([
    User.findById(user.id).select('bonuses').lean(),
    BonusTransaction.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BonusTransaction.countDocuments({ userId: user.id }),
  ]);

  return NextResponse.json({
    balance: userData?.bonuses ?? 0,
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/bonuses  — ручное начисление/списание (только Admin)
export async function POST(request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  await dbConnect();

  // Роль администратора — строго из БД (getServerSession), не из claim'а
  // токена: у операции реальная денежная стоимость (баллы уходят в
  // Google Wallet), нельзя доверять устаревшему/утёкшему admin-токену.
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });

  let body;
  try {
    body = adminAdjustSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  // Знак дельты: spend всегда уменьшает баланс
  const delta = body.type === 'spend' ? -body.points : body.points;

  // For spend: atomically check balance and decrement.
  // For earn/adjust: only match by _id — no balance precondition
  // (users created before the bonuses field existed may have bonuses: null,
  //  which would cause { $gte: 0 } to fail even for an earn operation).
  const query = body.type === 'spend'
    ? { _id: body.userId, bonuses: { $gte: body.points } }
    : { _id: body.userId };

  const updatedUser = await User.findOneAndUpdate(
    query,
    { $inc: { bonuses: delta } },
    { new: true, select: 'bonuses' }
  );

  if (!updatedUser) {
    const msg = body.type === 'spend'
      ? 'Недостаточно бонусов или пользователь не найден'
      : 'Пользователь не найден';
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const tx = await BonusTransaction.create({
    userId:      body.userId,
    type:        body.type,
    points:      delta,
    description: body.description,
  });

  await syncWalletBalance({ userId: body.userId, bonuses: updatedUser.bonuses });

  return NextResponse.json(
    { balance: updatedUser.bonuses, transaction: tx },
    { status: 201 }
  );
}
