import mongoose from 'mongoose';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { phoneMatchRegex, normalizePhoneDigits } from '@/lib/phone';

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

/**
 * Начисляет бонусы за ремонт, завершённый в CRM (crm-repair), найденный по
 * телефону клиента. Если пользователя с таким телефоном нет на сайте —
 * создаёт "тихий" аккаунт (без пароля, с плейсхолдер-email) — см. дизайн-спеку
 * 2026-07-30-crm-bonus-integration-design.md, раздел "Correction found while
 * reading the actual User schema".
 */
/**
 * Находит пользователя по телефону или создаёт "тихий" аккаунт (без пароля,
 * с плейсхолдер-email) — общая логика для начисления бонусов из CRM и для
 * выдачи карты лояльности по прямой ссылке (см. /wallet/issue). Возвращает
 * null, если phone не проходит валидацию как телефон вообще.
 */
export async function findOrCreateUserByPhone(phone, { session } = {}) {
  const matcher = phoneMatchRegex(phone);
  if (!matcher) return null;

  let user = await User.findOne({ phone: matcher }).session(session);
  if (!user) {
    const digits = normalizePhoneDigits(phone);
    [user] = await User.create(
      [{
        username: 'Клиент ServiceBox',
        email: `phone${digits}@bonus.crm`,
        phone: digits,
        isPhoneOnlyAccount: true,
        bonuses: 0,
      }],
      { session }
    );
  }
  return user;
}

export async function awardCrmRepairBonus({ phone, finalCost, crmOrderNumber, session }) {
  if (!finalCost || finalCost <= 0) return { awarded: false, reason: 'zero_amount' };

  const user = await findOrCreateUserByPhone(phone, { session });
  if (!user) return { awarded: false, reason: 'invalid_phone' };

  const points = Math.max(1, Math.floor(finalCost * BONUS_RATE));

  await User.updateOne(
    { _id: user._id },
    { $inc: { bonuses: points } },
    { session }
  );

  await BonusTransaction.create(
    [{
      userId: user._id,
      type: 'earn',
      points,
      crmOrderNumber,
      description: `Кэшбэк ${Math.round(BONUS_RATE * 100)}% за ремонт (заказ CRM ${crmOrderNumber})`,
    }],
    { session }
  );

  return { awarded: true, points, userId: user._id.toString() };
}
