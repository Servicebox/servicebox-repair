import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId обязателен' }, { status: 400 });
  }

  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;
  if (!crmApiUrl || !crmApiKey) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  let crmRes;
  try {
    crmRes = await fetch(`${crmApiUrl}/api/v1/chat/messages?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${crmApiKey}` },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[chat/messages GET] CRM request failed:', err);
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  if (!crmRes.ok) {
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
  const body = await request.json();
  const { sessionId, text, senderName } = body;

  if (!sessionId || !text?.trim()) {
    return NextResponse.json({ error: 'sessionId и text обязательны' }, { status: 400 });
  }

  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;
  if (!crmApiUrl || !crmApiKey) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  let crmRes;
  try {
    crmRes = await fetch(`${crmApiUrl}/api/v1/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${crmApiKey}`,
      },
      body: JSON.stringify({ sessionId, visitorName: senderName || 'Гость', text: text.trim() }),
    });
  } catch (err) {
    console.error('[chat/messages POST] CRM request failed:', err);
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  if (!crmRes.ok) {
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  const crmData = await crmRes.json();
  return NextResponse.json({ message: 'Отправлено', data: crmData.data });
}
