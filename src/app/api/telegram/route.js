import { NextResponse } from 'next/server';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { fetchCrm } from '@/lib/crmClient';
import { getClientIp, rlKey, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit';
export const runtime = 'nodejs';

// Используем бота для уведомлений в группу
const BOT_TOKEN = process.env.NOTIFY_BOT_TOKEN;
const CHAT_ID = process.env.NOTIFY_CHAT_ID;

export async function POST(request) {
  // Публичная форма заявки: 10 отправок с IP за 10 минут (защита от флуда
  // заявками в CRM-инбокс и спама в Telegram; запас на офисный NAT).
  const rl = await consumeRateLimit(rlKey('lead-form-ip', getClientIp(request)), {
    max: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

  const { name, phone, description, promotion } = await request.json();

  if (!name || !phone) {
    return NextResponse.json(
      {
        success: false,
        error: 'Заполните имя и телефон',
      },
      { status: 400 }
    );
  }
  if (String(name).length > 120 || String(phone).length > 40 ||
      (description && String(description).length > 3000)) {
    return NextResponse.json(
      { success: false, error: 'Слишком длинные данные формы' },
      { status: 413 }
    );
  }

  // Основной канал: заявка уходит в Инбокс CRM как диалог — надёжная запись,
  // которую видят сотрудники, и она не теряется, если Telegram недоступен.
  // Не заказ: у этой формы нет данных об устройстве/услуге (только имя,
  // телефон, короткий комментарий) — заказом это выглядело бы пустым, кроме
  // телефона; как сообщение в Инбоксе весь текст виден сразу, а сотрудник
  // сам создаёт заказ после звонка, если он нужен (кнопка "Создать заказ").
  let crmOk = false;
  try {
    const text = [`Телефон: ${phone}`, description, promotion ? `Акция: ${promotion}` : null]
      .filter(Boolean)
      .join('\n');

    const crmRes = await fetchCrm('/api/v1/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: `form-${randomUUID()}`,
        visitorName: name,
        visitorPhone: phone,
        text,
      }),
    });
    crmOk = !!crmRes && crmRes.ok;
    if (crmRes && !crmRes.ok) {
      console.error('[telegram-form] CRM ответил ошибкой:', crmRes.status, await crmRes.text().catch(() => ''));
    }
  } catch (crmError) {
    console.error('[telegram-form] Ошибка отправки заявки в CRM:', crmError);
  }

  // Вторичный канал: Telegram-уведомление — best-effort, его сбой больше не
  // должен блокировать заявку клиенту, если она уже дошла до CRM.
  let telegramOk = false;
  if (BOT_TOKEN && CHAT_ID) {
    try {
      const message = `📝 *Новая заявка с сайта*\n\n` +
        `👤 *Имя:* ${name}\n` +
        `📞 *Телефон:* ${phone}\n` +
        (description ? `📋 *Описание:* ${description}\n` : '') +
        (promotion ? `🎁 *Акция:* ${promotion}\n` : '') +
        `\n⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

      await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        { chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      );
      telegramOk = true;
    } catch (error) {
      console.error('[telegram-form] Telegram send error:', error.message, error.response?.data);
    }
  }

  if (!crmOk && !telegramOk) {
    return NextResponse.json(
      { success: false, error: 'Не удалось отправить заявку, попробуйте позже' },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, message: 'Заявка успешно отправлена' });
}

// Обработчик для GET запросов (тот самый который возвращает "Hello telegram!")
export async function GET() {
  return NextResponse.json({
    message: "Hello telegram!",
    usage: "Send POST request with form data to submit an application"
  });
}
