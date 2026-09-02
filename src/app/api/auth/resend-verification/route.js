export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken, hashToken } from '@/lib/authTokens';
import { sendVerificationEmail } from '@/lib/email';
import { consumeRateLimit, getClientIp, rlKey } from '@/lib/rateLimit';

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

    // Лимит по IP. Тело ответа то же (не раскрываем ни лимит, ни существование
    // аккаунта), но добавляем Retry-After — подсказка воспитанным клиентам.
    const rl = await consumeRateLimit(rlKey('resend-ip', getClientIp(request)), {
      max: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (rl.limited) {
      return NextResponse.json(UNIFORM_OK, {
        headers: { 'Retry-After': String(Math.max(1, Math.ceil(rl.retryAfterMs / 1000))) },
      });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || email.length > 254) return ok();

    // verificationTokenExpires — select: false, запрашиваем явно (нужен для
    // кулдауна). verificationToken в БД хранится хешем, «переотправить тот же»
    // нельзя — сырого значения у нас нет, поэтому всегда генерируем новый.
    const user = await User.findOne({ email }).select('+verificationTokenExpires');

    // Нечего делать: нет аккаунта / уже подтверждён / заблокирован.
    if (!user || user.emailVerified || user.isActive === false) return ok();

    const now = Date.now();
    const expiresAt = user.verificationTokenExpires
      ? user.verificationTokenExpires.getTime()
      : 0;
    const issuedAt = expiresAt ? expiresAt - TOKEN_TTL_MS : 0;

    // Антифлуд: последнее письмо отправлено меньше 5 минут назад — молчим.
    if (issuedAt && now - issuedAt < RESEND_COOLDOWN_MS) return ok();

    // Сырой токен — в письмо, в БД — SHA-256 хеш.
    const rawToken = generateToken();
    await User.updateOne(
      { _id: user._id },
      { $set: { verificationToken: hashToken(rawToken), verificationTokenExpires: new Date(now + TOKEN_TTL_MS) } }
    );

    try {
      await sendVerificationEmail(user.email, rawToken, user.username);
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
