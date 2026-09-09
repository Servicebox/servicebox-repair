// app/api/analytics/visits/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import dbConnect from '@/lib/db';
import Visit from '@/models/Visit';
import { getServerSession } from '@/lib/session';
import { getClientIp, rlKey, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit';

const cut = (v, n) => (typeof v === 'string' ? v.slice(0, n) : undefined);

// POST — клиентский beacon на каждый переход по страницам. Публичный,
// поэтому ограничен по частоте (реальная сессия не превысит) и жёстко
// режется по длине полей. fail-open при недоступности Mongo.
export async function POST(request) {
  const rl = await consumeRateLimit(rlKey('visit-beacon-ip', getClientIp(request)), {
    max: 150,
    windowMs: 5 * 60 * 1000,
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfterMs);

  try {
    const body = await request.json().catch(() => ({}));
    const page = cut(body.page, 512);
    if (!page || !page.startsWith('/')) {
      return NextResponse.json({ success: false, error: 'bad page' }, { status: 400 });
    }

    await dbConnect();

    // Личность пользователя не записываем даже для авторизованных — счётчик
    // полностью обезличенный, без привязки истории просмотров к аккаунту.
    await Visit.create({
      page,
      referrer: cut(body.referrer, 512),
      device: cut(body.device, 32) || 'desktop',
      browser: cut(body.browser, 64) || 'unknown',
      visitorId: cut(body.visitorId, 64),
      ts: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics visit error:', error?.message || error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET — сводка для админского дашборда. Роль из БД (getServerSession).
export async function GET(request) {
  try {
    await dbConnect();

    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }
    if (session.role !== 'admin') {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days'), 10) || 7));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const match = { ts: { $gte: startDate } };

    const [total, uniqAgg, devices, browsers, topPages, byDay] = await Promise.all([
      Visit.countDocuments(match),
      // Уникальных считаем двухступенчатым $group→$count: промежуточный
      // $group стримит по одному документу на каждый id, не собирает
      // огромный массив в одном документе (иначе при большом числе
      // visitorId агрегат упирался бы в лимит BSON 16 МБ и весь GET падал).
      Visit.aggregate([
        { $match: match },
        { $match: { visitorId: { $ne: null } } },
        { $group: { _id: '$visitorId' } },
        { $count: 'uniq' },
      ]),
      Visit.aggregate([{ $match: match }, { $group: { _id: '$device', c: { $sum: 1 } } }]),
      Visit.aggregate([{ $match: match }, { $group: { _id: '$browser', c: { $sum: 1 } } }]),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: '$page', c: { $sum: 1 } } },
        { $sort: { c: -1 } },
        { $limit: 20 },
      ]),
      Visit.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$ts', timezone: 'Europe/Moscow' } },
            c: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const toObj = (arr) =>
      Object.fromEntries(arr.filter((x) => x._id != null && x._id !== '').map((x) => [x._id, x.c]));

    const stats = {
      totalVisits: total,
      uniqueUsers: uniqAgg[0]?.uniq || 0,
      devices: toObj(devices),
      browsers: toObj(browsers),
      topPages: toObj(topPages),
      byDay: Object.fromEntries(byDay.map((x) => [x._id, x.c])),
    };

    return NextResponse.json({ stats, period: days });
  } catch (error) {
    console.error('Analytics GET error:', error?.message || error);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}
