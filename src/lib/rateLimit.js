// lib/rateLimit.js
// Mongo-backed rate limiter для auth-эндпоинтов.
//
//   const rl = await consumeRateLimit(`login-ip:${ip}`, { max: 10, windowMs: 5*60_000 });
//   if (rl.limited) return rateLimitResponse(rl.retryAfterMs);
//
// Fail-open: если Mongo недоступна — запрос пропускается (не блокируем
// легитимных пользователей из-за сбоя БД), но пишем в лог.
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RateLimit from '@/models/RateLimit';

// Идентификатор (email/IP) не кладём в БД в открытом виде — только HMAC.
// Коллекция ratelimits имеет иной профиль доступа, чем users (бэкапы, логи).
// Отдельный подключ (не сам JWT_SECRET) — доменное разделение.
const RL_HMAC_KEY = crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'rate-limit-fallback-key')
  .update('ratelimit-v1')
  .digest();

function hashId(value) {
  return crypto.createHmac('sha256', RL_HMAC_KEY).update(String(value)).digest('hex').slice(0, 32);
}

/**
 * Ключ rate-limit из префикса-корзины и идентификатора.
 *   rlKey('login-ip', ip) → "login-ip:<hmac>"
 * Если идентификатор не определён ('unknown'/пусто) — возвращаем null;
 * consumeRateLimit(null) просто пропускает проверку (не сваливаем всех в
 * одну корзину). Никакого совпадения по суффиксу.
 */
export function rlKey(bucket, identifier) {
  if (!identifier || identifier === 'unknown') return null;
  return `${bucket}:${hashId(identifier)}`;
}

/**
 * Реальный IP клиента.
 * За nginx на этом сервере: `proxy_set_header X-Real-IP $remote_addr` — это
 * TCP-peer, клиент подделать не может. А X-Forwarded-For идёт через
 * `$proxy_add_x_forwarded_for`: nginx ДОПИСЫВАЕТ реальный IP СПРАВА к тому,
 * что прислал клиент, поэтому первый элемент XFF — под контролем клиента и
 * доверять ему нельзя. Берём X-Real-IP; если его нет — последний элемент XFF
 * (тот, что добавил прокси).
 */
export function getClientIp(request) {
  const real = request.headers.get('x-real-ip');
  if (real && real.trim()) return real.trim();

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return 'unknown';
}

/**
 * Атомарно увеличивает счётчик окна и сообщает, превышен ли лимит.
 * @param {string} key
 * @param {{max:number, windowMs:number, peek?:boolean}} opts
 *   peek: только проверить, не увеличивая (для «сначала лимит, потом работа»
 *   когда инкремент делается отдельно на неудачной ветке).
 * @returns {Promise<{limited:boolean, remaining:number, retryAfterMs:number}>}
 */
export async function consumeRateLimit(key, { max, windowMs, peek = false }) {
  const now = Date.now();

  // key === null → идентификатор не определён (rlKey вернул null): пропускаем.
  if (!key) {
    return { limited: false, remaining: max, retryAfterMs: 0 };
  }

  try {
    await dbConnect();

    if (peek) {
      const doc = await RateLimit.findOne({ key }).lean();
      const live = doc && doc.resetAt.getTime() > now ? doc : null;
      const count = live ? live.count : 0;
      return {
        limited: count >= max,
        remaining: Math.max(0, max - count),
        retryAfterMs: live ? live.resetAt.getTime() - now : 0,
      };
    }

    // Одно атомарное обновление с aggregation-pipeline: если окно ещё живо —
    // count+1 и resetAt не трогаем; иначе — новое окно (count=1).
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      [
        {
          $set: {
            count: {
              $cond: [
                { $gt: ['$resetAt', new Date(now)] },
                { $add: [{ $ifNull: ['$count', 0] }, 1] },
                1,
              ],
            },
            resetAt: {
              $cond: [
                { $gt: ['$resetAt', new Date(now)] },
                '$resetAt',
                new Date(now + windowMs),
              ],
            },
          },
        },
      ],
      { upsert: true, new: true }
    );

    return {
      limited: doc.count > max,
      remaining: Math.max(0, max - doc.count),
      retryAfterMs: doc.resetAt.getTime() - now,
    };
  } catch (error) {
    console.error('[rateLimit] fail-open, ошибка Mongo:', error?.message || error);
    return { limited: false, remaining: max, retryAfterMs: 0 };
  }
}

/** Сбросить счётчик (напр. после успешного входа — снять lockout по email). */
export async function resetRateLimit(key) {
  try {
    await dbConnect();
    await RateLimit.deleteOne({ key });
  } catch (error) {
    console.error('[rateLimit] resetRateLimit error:', error?.message || error);
  }
}

/** Единый ответ 429 с Retry-After. */
export function rateLimitResponse(retryAfterMs) {
  const seconds = Math.max(1, Math.ceil((retryAfterMs || 60_000) / 1000));
  return NextResponse.json(
    { message: 'Слишком много попыток. Повторите позже.' },
    { status: 429, headers: { 'Retry-After': String(seconds) } }
  );
}
