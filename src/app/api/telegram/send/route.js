// src/app/api/telegram/send/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getClientIp, rlKey, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit';

const BOT_TOKEN = process.env.SUPPORT_BOT_TOKEN;
const CHAT_ID = process.env.SUPPORT_CHAT_ID;

export async function POST(request) {
  // Анонимный чат-виджет → Telegram поддержки. 40 сообщений с IP за 5 минут:
  // с запасом на живую переписку и офисный NAT, но отсекает флуд.
  const rl = await consumeRateLimit(rlKey('tg-send-ip', getClientIp(request)), {
    max: 40,
    windowMs: 5 * 60 * 1000,
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json(
        { error: 'Bot token or chat ID not configured' }, 
        { status: 500 }
      );
    }

    const { userId, userName, text } = await request.json();

    if (!userId || !userName || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, text' },
        { status: 400 }
      );
    }
    if (String(text).length > 4000 || String(userName).length > 120) {
      return NextResponse.json({ error: 'Сообщение слишком длинное' }, { status: 413 });
    }

    const message = `✉️ Сообщение от ${userName} (ID:${userId}):\n\n${text}`;

    // Исправлено: убрал пробел в URL
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Telegram response:', response.data);

    return NextResponse.json({ 
      success: true, 
      messageId: response.data.result?.message_id 
    });
  } catch (error) {
    console.error('Telegram send error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return NextResponse.json(
      { error: 'Failed to send message to Telegram' },
      { status: 500 }
    );
  }
}