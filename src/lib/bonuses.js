import mongoose from 'mongoose';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';

const BONUS_RATE = parseFloat(process.env.BONUS_RATE_PCT ?? '3') / 100;

/**
 * Атомарно начисляет бонусы пользователю за завершённый заказ.
 * Использует Mongoose session для транзакции.
 * Возвращает { awarded, points } или бросает ошибку.
 */
export async function awardOrderBonuses({ userId, orderId, totalAmount, session }) {
  const points = Math.max(1, Math.floor(totalAmount * BONUS_RATE));

  await User.findByIdAndUpdate(
    userId,
    { $inc: { bonuses: points } },
    { session }
  );

  await BonusTransaction.create(
    [{
      userId,
      type: 'earn',
      points,
      orderId,
      description: `Кэшбэк ${Math.round(BONUS_RATE * 100)}% за заказ`,
    }],
    { session }
  );

  return { awarded: true, points };
}
