export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';

// Повторная отправка письма подтверждения email.
// Ответ всегда одинаковый (200) — нельзя перебором узнать, какие email
// зарегистрированы. Антифлуд: не чаще раза в 5 минут на аккаунт.
// Полноценный rate-limit по IP/email — Phase 4.

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа
const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 минут
const UNIFORM_OK = {
  message: 'Если аккаунт существует и email не подтверждён, письмо отправлено.',
};

function ok() {
  return NextResponse.json(UNIFORM_OK);
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || email.length > 254) return ok();

    // verificationToken / verificationTokenExpires — select: false, запрашиваем явно.
    // Остальные поля (email, emailVerified, isActive, username) в выборке по умолчанию.
    const user = await User.findOne({ email }).select(
      '+verificationToken +verificationTokenExpires'
    );

    // Нечего делать: нет аккаунта / уже подтверждён / заблокирован.
    if (!user || user.emailVerified || user.isActive === false) return ok();

    const now = Date.now();
    const expiresAt = user.verificationTokenExpires
      ? user.verificationTokenExpires.getTime()
      : 0;
    const issuedAt = expiresAt ? expiresAt - TOKEN_TTL_MS : 0;

    // Антифлуд: последнее письмо отправлено меньше 5 минут назад — молчим.
    if (issuedAt && now - issuedAt < RESEND_COOLDOWN_MS) return ok();

    // Если действующий (непросроченный) токен уже есть — переотправляем ЕГО,
    // а не генерируем новый: спам-запросы не должны инвалидировать ссылку,
    // которую пользователь уже получил при регистрации.
    let token = user.verificationToken;
    if (!token || expiresAt <= now) {
      token = crypto.randomBytes(32).toString('hex');
    }
    // Точечный updateOne, а не user.save() — не гоняем валидацию всего
    // документа (легаси-профиль под новые ограничения дал бы 500).
    // verificationTokenExpires служит и меткой «последней отправки» для
    // кулдауна, поэтому сдвигаем её при любой отправке.
    await User.updateOne(
      { _id: user._id },
      { $set: { verificationToken: token, verificationTokenExpires: new Date(now + TOKEN_TTL_MS) } }
    );

    try {
      await sendVerificationEmail(user.email, token, user.username);
    } catch (emailError) {
      console.error('Resend verification email error:', emailError);
      // Ответ не меняем — не раскрываем внутренние сбои.
    }

    return ok();
  } catch (error) {
    console.error('Resend verification error:', error);
    return ok();
  }
}
