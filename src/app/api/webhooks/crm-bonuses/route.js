export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import ProcessedCrmBonusEvent from '@/models/ProcessedCrmBonusEvent';
import { awardCrmRepairBonus } from '@/lib/bonuses';
import { syncWalletBalance } from '@/lib/walletPass';

function verifyHmac(rawBody, header) {
  const secret = process.env.CRM_BONUS_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('CRM bonus webhook: CRM_BONUS_WEBHOOK_SECRET не задан — проверка подписи пропущена');
    return true;
  }

  if (!header) return false;

  // crm-repair подписывает как `sha256=<hex>` (см. src/lib/outboundWebhook.ts)
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(header));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature');

  if (!verifyHmac(rawBody, signature)) {
    return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
  }

  if (payload.event !== 'order.status_changed' || payload.data?.status !== 'issued') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { orderNumber, clientPhone, finalCost } = payload.data;
  if (!orderNumber || !clientPhone || !finalCost) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await dbConnect();

  const eventKey = `${orderNumber}:issued`;
  try {
    await ProcessedCrmBonusEvent.create({ eventKey });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    throw err;
  }

  const session = await mongoose.startSession();
  let result;
  try {
    session.startTransaction();
    result = await awardCrmRepairBonus({
      phone: clientPhone,
      finalCost,
      crmOrderNumber: orderNumber,
      session,
    });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error('CRM bonus webhook processing error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  } finally {
    session.endSession();
  }

  if (result?.awarded) {
    await syncWalletBalance({ userId: result.userId, bonuses: result.newBalance });
  }

  return NextResponse.json({ ok: true });
}
