import mongoose from 'mongoose';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import BonusConfig from '@/models/BonusConfig';
import { phoneMatchRegex, normalizePhoneDigits } from '@/lib/phone';

/**
 * Текущая ставка кэшбэка в процентах. Читается из БД (BonusConfig) на каждый
 * вызов — без кэша, чтобы изменение через CRM применялось сразу, без
 * рестарта сервера. Переменная окружения BONUS_RATE_PCT остаётся запасным
 * значением на случай, если ставку ещё ни разу не сохраняли через новый
 * маршрут — см. дизайн-спеку 2026-07-31-crm-bonus-rate-control-design.md.
 */
export async function getBonusRatePct() {
  const config = await BonusConfig.findOne().lean();
  if (config) return config.ratePct;
  return parseFloat(process.env.BONUS_RATE_PCT ?? '3');
}

/**
 * Атомарно начисляет бонусы пользователю за завершённый заказ.
 * Использует Mongoose session для транзакции.
 * Возвращает { awarded, points } или бросает ошибку.
 */
export async function awardOrderBonuses({ userId, orderId, totalAmount, session }) {
  const ratePct = await getBonusRatePct();
  const points = Math.max(1, Math.floor(totalAmount * (ratePct / 100)));

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { bonuses: points } },
    { new: true, session }
  );

  await BonusTransaction.create(
    [{
      userId,
      type: 'earn',
      points,
      orderId,
      description: `Кэшбэк ${ratePct}% за заказ`,
    }],
    { session }
  );

  return { awarded: true, points, newBalance: updatedUser.bonuses };
}

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

/**
 * Начисляет бонусы за ремонт, завершённый в CRM (crm-repair), найденный по
 * телефону клиента. Если пользователя с таким телефоном нет на сайте —
 * создаёт "тихий" аккаунт — см. дизайн-спеку
 * 2026-07-30-crm-bonus-integration-design.md, раздел "Correction found while
 * reading the actual User schema".
 */
export async function awardCrmRepairBonus({ phone, finalCost, crmOrderNumber, session }) {
  if (!finalCost || finalCost <= 0) return { awarded: false, reason: 'zero_amount' };

  const user = await findOrCreateUserByPhone(phone, { session });
  if (!user) return { awarded: false, reason: 'invalid_phone' };

  const ratePct = await getBonusRatePct();
  const points = Math.max(1, Math.floor(finalCost * (ratePct / 100)));

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $inc: { bonuses: points } },
    { new: true, session }
  );

  await BonusTransaction.create(
    [{
      userId: user._id,
      type: 'earn',
      points,
      crmOrderNumber,
      description: `Кэшбэк ${ratePct}% за ремонт (заказ CRM ${crmOrderNumber})`,
    }],
    { session }
  );

  return { awarded: true, points, userId: user._id.toString(), newBalance: updatedUser.bonuses };
}
