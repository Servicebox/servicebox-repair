// app/api/analytics/visits/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getServerSession } from '@/lib/session';

// Временное хранилище в памяти (для демо). Ограничено кольцевым буфером —
// иначе поток POST-ов (в т.ч. злонамеренный) разрастил бы массив до OOM.
const MAX_VISITS = 5000;
const visits = [];

function pushVisit(visit) {
  visits.push(visit);
  if (visits.length > MAX_VISITS) {
    visits.splice(0, visits.length - MAX_VISITS);
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));

    // Поля клиента режем по длине — иначе 5000 записей × мегабайтные строки
    // page/referrer всё равно съедят память.
    const cut = (v, n) => (typeof v === 'string' ? v.slice(0, n) : undefined);

    const visit = {
      id: Date.now(),
      userId: null,
      sessionId: cut(request.cookies.get('sessionId')?.value, 128) || 'anonymous',
      page: cut(body.page, 512),
      device: cut(body.device, 32) || 'desktop',
      browser: cut(body.browser, 64) || 'unknown',
      timestamp: new Date(),
      referrer: cut(body.referrer, 512),
    };

    // Проверяем, авторизован ли пользователь
    const token = request.cookies.get('token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) visit.userId = decoded.id ?? decoded.userId;
    }

    pushVisit(visit);

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error) {
    console.error('Analytics visit error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    // Роль берём из БД (getServerSession), а не из claim'а токена.
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }
    if (session.role !== 'admin') {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Фильтруем визиты за период
    const periodVisits = visits.filter(v => new Date(v.timestamp) > startDate);

    // Считаем статистику
    const stats = {
      totalVisits: periodVisits.length,
      uniqueUsers: new Set(periodVisits.map(v => v.userId || v.sessionId)).size,
      devices: {},
      browsers: {},
      topPages: {},
      byDay: {}
    };

    periodVisits.forEach(visit => {
      // Устройства
      stats.devices[visit.device] = (stats.devices[visit.device] || 0) + 1;
      // Браузеры
      stats.browsers[visit.browser] = (stats.browsers[visit.browser] || 0) + 1;
      // Популярные страницы
      stats.topPages[visit.page] = (stats.topPages[visit.page] || 0) + 1;
      // По дням
      const day = visit.timestamp.toLocaleDateString('ru-RU');
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return NextResponse.json({ stats, period: days });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
