// app/api/analytics/ai-traffic/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AiTraffic from '@/models/AiTraffic';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';
export const revalidate = false;

const KNOWN_BOTS = [
    'Google-Extended', 'GPTBot', 'CCBot', 'Omgilibot', 'FacebookBot',
    'YandexAccessibilityBot', 'BingPreview', 'Applebot-Extended',
    'Bytespider', 'ImagesiftBot', 'PerplexityBot', 'ClaudeBot', 'YouBot'
];


// POST: Запись визита бота (публичный)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Базовая валидация
        if (!body?.bot || !body?.page?.startsWith('/')) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
        }

        const entry = await AiTraffic.create({
            bot: KNOWN_BOTS.includes(body.bot) ? body.bot : 'unknown',
            page: body.page.trim(),
            query: body.query?.trim() || null,
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
            userAgent: body.userAgent || request.headers.get('user-agent') || 'unknown',
            ip: body.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
            referrer: body.referrer || request.headers.get('referer') || null,
            language: request.headers.get('accept-language')?.split(',')[0] || 'ru',
            country: request.headers.get('cf-ipcountry') || 'RU'
        });

        return NextResponse.json({ success: true, id: entry._id }, { status: 201 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// GET: Статистика (только администратор)
export async function GET(request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        // Фильтры
        const match = {};
        const start = searchParams.get('startDate');
        if (start && !isNaN(new Date(start).getTime())) {
            match.timestamp = { ...match.timestamp, $gte: new Date(start) };
        }
        const bot = searchParams.get('bot');
        if (bot && bot !== 'all' && KNOWN_BOTS.includes(bot)) {
            match.bot = bot;
        }

        // Статистика по ботам
        const stats = await AiTraffic.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$bot',
                    count: { $sum: 1 },
                    pages: { $addToSet: '$page' },
                    firstSeen: { $min: '$timestamp' },
                    lastSeen: { $max: '$timestamp' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 100 }
        ]);

        // Последние визиты
        const recent = await AiTraffic.find(match)
            .sort({ timestamp: -1 })
            .limit(20)
            .select('bot page query timestamp referrer')
            .lean();

        return NextResponse.json({
            success: true,
            data: stats,
            recent: recent,
            meta: { total: await AiTraffic.countDocuments(match) }
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// DELETE: Очистка старых записей (только администратор, + проверка Origin от CSRF)
export async function DELETE(request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    try {
        await dbConnect();
        const days = parseInt(new URL(request.url).searchParams.get('olderThanDays')) || 90;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await AiTraffic.deleteMany({ timestamp: { $lt: cutoff } });
        return NextResponse.json({ success: true, deleted: result.deletedCount });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// OPTIONS: CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Allow-Credentials': 'true'
        }
    });
}