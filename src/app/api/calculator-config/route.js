import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CalculatorConfig from '@/models/CalculatorConfig';
import { requireAdmin } from '@/lib/authGuard';

// GET: Отдаём конфигурацию калькулятору
export async function GET() {
    try {
        await dbConnect();
        const config = await CalculatorConfig.findOne();
        if (!config) return NextResponse.json({ success: false, message: 'Нет конфигурации' });
        return NextResponse.json({ success: true, pricingData: config.pricingData });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Сохраняем изменения из админки
export async function POST(request) {
    // Перезаписывать конфиг калькулятора цен может только администратор
    // (+ проверка Origin от CSRF). Актуальная админка ходит в
    // /api/admin/calculator-config; этот роут оставлен для совместимости.
    const denied = await requireAdmin(request);
    if (denied) return denied;

    try {
        await dbConnect();
        const { pricingData } = await request.json();

        if (!pricingData || typeof pricingData !== 'object') {
            return NextResponse.json({ success: false, error: 'Неверный формат JSON' }, { status: 400 });
        }

        // Ищем запись. Если есть - обновляем, если нет - создаём
        let config = await CalculatorConfig.findOne();
        if (config) {
            config.pricingData = pricingData;
            await config.save();
        } else {
            await CalculatorConfig.create({ pricingData });
        }

        return NextResponse.json({ success: true, message: 'Цены успешно сохранены' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}