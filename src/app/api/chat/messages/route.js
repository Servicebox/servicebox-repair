import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

// koznova.site's DNS zone currently has two A records — one valid, one a stray
// 0.0.0.0 — so roughly half of connection attempts by hostname fail outright,
// in a random order per lookup (confirmed via repeated `resolvectl query` from
// this server — not a one-time cache fluke). The bad record has already been
// removed at the registrar but hasn't fully propagated yet. 4 attempts brings
// the odds of an all-bad-IP retry sequence down to 1-in-16 in the meantime.
// Remove this retry once the DNS fix has fully propagated (check with
// `resolvectl query koznova.site` a few times in a row — only one IP should
// ever come back).
async function fetchCrmWithRetry(url, options, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw lastErr;
}

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
    crmRes = await fetchCrmWithRetry(`${crmApiUrl}/api/v1/chat/messages?sessionId=${encodeURIComponent(sessionId)}`, {
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
    crmRes = await fetchCrmWithRetry(`${crmApiUrl}/api/v1/chat/messages`, {
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
