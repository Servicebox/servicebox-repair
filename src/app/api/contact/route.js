export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, rlKey, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit';

const schema = z.object({
  name:    z.string().trim().min(2,  'Введите имя (минимум 2 символа)').max(100),
  email:   z.string().trim().email('Введите корректный email'),
  phone:   z.string().trim().max(30).optional().default(''),
  message: z.string().trim().max(5000).optional().default(''),
});

// Rate limit: 5 заявок с одного IP за 10 минут. Хранилище — Mongo
// (переживает рестарт, общее для всех инстансов), fail-open при сбое БД.
const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

function getMskTime() {
  return new Date().toLocaleString('ru-RU', {
    timeZone:    'Europe/Moscow',
    day:         'numeric',
    month:       'long',
    year:        'numeric',
    hour:        '2-digit',
    minute:      '2-digit',
  });
}

function buildTelegramMessage({ name, email, phone, message }) {
  return [
    '📩 *Новая заявка с сайта СЕРВИС БОКС*',
    '',
    `👤 Имя: ${name}`,
    `📧 Email: ${email}`,
    `📱 Телефон: ${phone || 'не указан'}`,
    '',
    '💬 Сообщение:',
    message || '*(не заполнено)*',
    '',
    `🕐 Время: ${getMskTime()} МСК`,
  ].join('\n');
}

async function sendToTelegram(text) {
  const token  = process.env.SUPPORT_BOT_TOKEN;
  const chatId = process.env.SUPPORT_CHAT_ID;

  if (!token || !chatId) {
    console.error('[contact] SUPPORT_BOT_TOKEN или SUPPORT_CHAT_ID не заданы');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[contact] Telegram API error:', err);
  }
}

export async function POST(request) {
  const ip = getClientIp(request);
  const rl = await consumeRateLimit(rlKey('contact-ip', ip), {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW,
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

  let body;
  try {
    body = schema.parse(await request.json());
  } catch (err) {
    const message = err.issues?.[0]?.message ?? 'Неверные данные';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }

  try {
    await sendToTelegram(buildTelegramMessage(body));
  } catch (err) {
    console.error('[contact] sendToTelegram threw:', err);
    // Не возвращаем 500 — форма уже отработала, пусть пользователь не страдает
  }

  return NextResponse.json({ success: true });
}
