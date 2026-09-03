// app/api/analytics/ai-traffic/export/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AiTraffic from '@/models/AiTraffic';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

const escape = (val) => {
    if (val == null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export async function GET(request) {
    // Экспорт аналитики доступен только администратору.
    const denied = await requireAdmin(request);
    if (denied) return denied;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const query = {};
        const start = searchParams.get('startDate');
        if (start && !isNaN(new Date(start).getTime())) {
            query.timestamp = { $gte: new Date(start) };
        }
        const bot = searchParams.get('bot');
        if (bot && bot !== 'all') query.bot = bot;

        const records = await AiTraffic.find(query)
            .sort({ timestamp: -1 })
            .limit(10000)
            .select('timestamp bot page query referrer language country')
            .lean();

        const headers = ['timestamp', 'bot', 'page', 'query', 'referrer', 'language', 'country'];
        const rows = records.map(r => headers.map(h => escape(r[h])));
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="ai-traffic-${new Date().toISOString().slice(0, 10)}.csv"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}