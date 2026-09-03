import { NextResponse } from 'next/server';
import { fetchCrm } from '@/lib/crmClient';
import { getClientIp, rlKey, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit';
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId обязателен' }, { status: 400 });
  }

  let crmRes;
  try {
    crmRes = await fetchCrm(`/api/v1/chat/messages?sessionId=${encodeURIComponent(sessionId)}`, {
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[chat/messages GET] CRM request failed:', err);
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  if (!crmRes || !crmRes.ok) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  const crmData = await crmRes.json();
  const messages = (crmData.data?.messages || []).map((m) => ({
    _id: m._id,
    author: m.author === 'staff' ? 'admin' : 'user',
    text: m.text,
    senderName: crmData.data?.conversation?.visitorName,
    createdAt: m.createdAt,
  }));

  return NextResponse.json({ messages, total: messages.length });
}

export async function POST(request) {
  // Анонимный чат-виджет → CRM-инбокс. 60 сообщений с IP за 5 минут
  // (запас на живую переписку и офисный NAT).
  const rl = await consumeRateLimit(rlKey('chat-msg-ip', getClientIp(request)), {
    max: 60,
    windowMs: 5 * 60 * 1000,
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

  const body = await request.json();
  const { sessionId, text, senderName } = body;

  if (!sessionId || !text?.trim()) {
    return NextResponse.json({ error: 'sessionId и text обязательны' }, { status: 400 });
  }
  if (String(text).length > 4000 || (senderName && String(senderName).length > 120)) {
    return NextResponse.json({ error: 'Сообщение слишком длинное' }, { status: 413 });
  }

  let crmRes;
  try {
    crmRes = await fetchCrm('/api/v1/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, visitorName: senderName || 'Гость', text: text.trim() }),
    });
  } catch (err) {
    console.error('[chat/messages POST] CRM request failed:', err);
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  if (!crmRes || !crmRes.ok) {
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  const crmData = await crmRes.json();
  return NextResponse.json({ message: 'Отправлено', data: crmData.data });
}
