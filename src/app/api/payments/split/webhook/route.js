export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { awardOrderBonuses } from '@/lib/bonuses';
import { syncWalletBalance } from '@/lib/walletPass';

function verifyHmac(rawBody, signature) {
  const secret = process.env.YANDEX_SPLIT_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('Yandex Split webhook: YANDEX_SPLIT_WEBHOOK_SECRET не задан — проверка подписи пропущена');
    return true;
  }

  if (!signature) return false;

  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const rawBody = await request.text();

  // Яндекс Сплит (yastore) использует X-Yandex-Signature
  const signature = request.headers.get('x-yandex-signature')
    ?? request.headers.get('x-ya-signature')
    ?? request.headers.get('x-merchant-callback-signature');

  if (!verifyHmac(rawBody, signature)) {
    return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
  }

  await dbConnect();

  // Яндекс Сплит (yastore) передаёт merchantOrderId и status напрямую
  const merchantOrderId = event.merchantOrderId ?? event.orderId;
  const status          = (event.status ?? '').toLowerCase();

  if (!merchantOrderId) {
    return NextResponse.json({ error: 'merchantOrderId отсутствует' }, { status: 400 });
  }

  if (status === 'success' || status === 'completed' || status === 'captured') {
    const session = await mongoose.startSession();
    let walletSync = null;
    try {
      session.startTransaction();

      const order = await Order.findOneAndUpdate(
        { splitOrderId: merchantOrderId, paymentStatus: { $ne: 'paid' } },
        { paymentStatus: 'paid', status: 'processing' },
        { new: true, session }
      );

      if (!order) {
        await session.abortTransaction();
        return NextResponse.json({ ok: true, skipped: true });
      }

      if (order.userId && !order.bonusesAwarded) {
        const awardResult = await awardOrderBonuses({
          userId:      order.userId,
          orderId:     order._id,
          totalAmount: order.totalAmount,
          session,
        });
        walletSync = { userId: order.userId, bonuses: awardResult.newBalance };

        await Order.findByIdAndUpdate(order._id, { bonusesAwarded: true }, { session });
      }

      if (order.userId && order.discount > 0 && !order.bonusesSpent) {
        const spendResult = await User.findOneAndUpdate(
          { _id: order.userId, bonuses: { $gte: order.discount } },
          { $inc: { bonuses: -order.discount } },
          { new: true, session }
        );

        if (spendResult) {
          await BonusTransaction.create(
            [{
              userId: order.userId,
              type: 'spend',
              points: -order.discount,
              orderId: order._id,
              description: `Списание бонусов при оплате заказа ${order.orderNumber}`,
            }],
            { session }
          );
          walletSync = { userId: order.userId, bonuses: spendResult.bonuses };
        } else {
          // Баланс изменился между оформлением заказа и подтверждением оплаты
          // (например, бонусы уже потрачены где-то ещё). Принятая мягкая
          // деградация — клиент уже получил скидку через Split, повторных
          // попыток не делаем. См. спеку 2026-07-30-crm-bonus-integration-design.md,
          // раздел "Error handling".
          console.warn(`Order ${order.orderNumber}: insufficient bonus balance at spend time (${order.discount} needed), not debited`);
        }

        await Order.findByIdAndUpdate(order._id, { bonusesSpent: true }, { session });
      }

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error('Split webhook processing error:', err);
      return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
    } finally {
      session.endSession();
    }

    if (walletSync) {
      await syncWalletBalance(walletSync);
    }
  } else if (status === 'failed' || status === 'cancelled' || status === 'voided') {
    await Order.findOneAndUpdate(
      { splitOrderId: merchantOrderId },
      { paymentStatus: 'failed', status: 'cancelled' }
    );
  } else if (status === 'refunded') {
    await Order.findOneAndUpdate(
      { splitOrderId: merchantOrderId },
      { paymentStatus: 'refunded', status: 'cancelled' }
    );
  }

  return NextResponse.json({ ok: true });
}
