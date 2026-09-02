export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name:    z.string().trim().min(2,  'Введите имя (минимум 2 символа)').max(100),
  email:   z.string().trim().email('Введите корректный email'),
  phone:   z.string().trim().max(30).optional().default(''),
  message: z.string().trim().max(5000).optional().default(''),
});

// Rate limit: 3 запроса с одного IP за 10 минут
const RATE_LIMIT_MAX      = 3;
const RATE_LIMIT_WINDOW   = 10 * 60 * 1000; // 10 мин в мс
const rateLimitMap        = new Map(); // ip → { count, resetAt }

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

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
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Слишком много запросов. Попробуйте через 10 минут.' },
      { status: 429 }
    );
  }

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
