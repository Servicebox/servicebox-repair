export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getPricingMatrixData } from '@/lib/pricing-matrix';

// GET /api/repair-pricing?deviceType=phone — публичные данные для калькулятора
// (бренды, модели, услуги с priceVariants/basePrice/compatFlags). Без авторизации,
// только чтение.
export async function GET(request) {
  const deviceType = new URL(request.url).searchParams.get('deviceType');
  if (!deviceType) {
    return NextResponse.json({ error: 'deviceType обязателен' }, { status: 400 });
  }

  await dbConnect();
  const data = await getPricingMatrixData(deviceType);

  return NextResponse.json({ success: true, ...data });
}
