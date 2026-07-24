export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Сопоставление статусов заказа из CRM (src/models/Order.ts, OrderStatus)
// с текстом для публичной страницы отслеживания.
const STATUS_LABELS = {
  new: 'Принят',
  diagnostics: 'Диагностика',
  waiting_approval: 'Ожидает согласования',
  waiting_parts: 'Ожидает запчасти',
  in_repair: 'В ремонте',
  quality_check: 'Проверка качества',
  ready: 'Готов к выдаче',
  issued: 'Выдан',
  cancelled: 'Отменён',
  client_declined: 'Клиент отказался',
};

// Поиск по одной лишь фамилии — самый частый случай коллизии (однофамильцы),
// поэтому без указанного телефона отдаём урезанный ответ: статус и номер
// заказа достаточно, чтобы клиент узнал СВОЙ заказ, но не дефект/стоимость/
// полный телефон чужого человека с той же фамилией.
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 минут
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• ${digits.slice(-4)}`;
}

export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Слишком много запросов. Попробуйте через несколько минут.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Некорректный запрос' }, { status: 400 });
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!phone && name.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Введите номер телефона или фамилию (минимум 2 символа)' },
      { status: 400 }
    );
  }

  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;

  if (!crmApiUrl || !crmApiKey) {
    console.error('[tracking/search] CRM_API_URL/CRM_API_KEY не заданы');
    return NextResponse.json(
      { success: false, error: 'Сервис отслеживания временно недоступен' },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({ limit: '15' });
  if (phone) params.set('clientPhone', phone);
  if (name) params.set('clientName', name);

  let crmRes;
  try {
    crmRes = await fetch(`${crmApiUrl}/api/v1/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${crmApiKey}` },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[tracking/search] CRM request failed:', err);
    return NextResponse.json(
      { success: false, error: 'Сервис отслеживания временно недоступен' },
      { status: 503 }
    );
  }

  if (!crmRes.ok) {
    console.error('[tracking/search] CRM responded with', crmRes.status);
    return NextResponse.json(
      { success: false, error: 'Сервис отслеживания временно недоступен' },
      { status: 503 }
    );
  }

  const crmData = await crmRes.json();
  const orders = Array.isArray(crmData.data) ? crmData.data : [];

  // Если найдено и телефон совпал — считаем, что запросил владелец заказа,
  // отдаём полную детализацию. Если совпала только фамилия — урезаем ответ.
  const hasPhone = Boolean(phone);

  const results = orders.map((order) => {
    const base = {
      number: order.number,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      deviceType: order.deviceType,
      deviceBrand: order.deviceBrand,
      deviceModel: order.deviceModel,
      createdAt: order.createdAt,
      dueDate: order.dueDate,
      issuedAt: order.issuedAt,
      clientName: order.clientName,
      clientPhone: hasPhone ? order.clientPhone : maskPhone(order.clientPhone),
    };

    if (!hasPhone) return base;

    return {
      ...base,
      defectDescription: order.defectDescription,
      masterComment: order.masterComment,
      estimatedCost: order.estimatedCost,
      finalCost: order.finalCost,
      warrantyExpires: order.warrantyExpires,
      photos: order.photos ?? [],
      history: (order.statusHistory ?? []).map((h) => ({
        status: h.status,
        statusLabel: STATUS_LABELS[h.status] ?? h.status,
        comment: h.comment,
        date: h.createdAt,
      })),
    };
  });

  if (!results.length) {
    return NextResponse.json(
      { success: false, error: 'Заказы не найдены. Проверьте номер телефона или фамилию.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, results });
}
