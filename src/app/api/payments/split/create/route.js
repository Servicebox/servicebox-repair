export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Order from '@/models/Order';
import PaymentConfig from '@/models/PaymentConfig';
import User from '@/models/User';

const itemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
  slug: z.string().optional(),
});

const createSchema = z.object({
  items: z.array(itemSchema).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  bonusPoints: z.number().int().min(0).optional().default(0),
});

/**
 * В payload Яндекс Сплит одновременно передаются и общая `amount`, и цена
 * ЗА ЕДИНИЦУ по каждой позиции (`price` × `count`). Раз цена в позиции —
 * целое число копеек за штуку, а не за всю строку, произвольную скидку
 * нельзя всегда разложить без остатка при quantity > 1 (например, скидка
 * 1899.97 → 1329.98 при 3 шт. в одной строке не делится ровно на 3).
 * Поэтому здесь СНАЧАЛА считается цена за единицу с округлением по каждой
 * позиции, а затем из этих же округлённых цен пересобирается фактическая
 * сумма (`actualTotalKop`) — она и уходит в Яндекс как `amount`, чтобы
 * позиции и итог гарантированно совпадали. Расхождение с "идеальной"
 * скидкой — не больше нескольких копеек суммарно и не влияет на баллы,
 * списываемые с бонусного баланса (те остаются целым числом, как ввёл
 * клиент) — оно есть только в сумме, которую видит платёжный провайдер.
 */
function buildDiscountedSplitItems(items, totalKopBeforeDiscount, totalKopAfterDiscount) {
  if (totalKopBeforeDiscount === totalKopAfterDiscount) {
    const splitItems = items.map(i => ({
      id: i.productId,
      title: i.name,
      price: Math.round(i.price * 100),
      count: i.quantity,
      type: 'PHYSICAL',
    }));
    return { splitItems, actualTotalKop: totalKopAfterDiscount };
  }

  const ratio = totalKopAfterDiscount / totalKopBeforeDiscount;
  let actualTotalKop = 0;

  const splitItems = items.map(i => {
    const lineTotalKopBefore = Math.round(i.price * i.quantity * 100);
    const lineTotalKopAfter = Math.round(lineTotalKopBefore * ratio);
    const unitPriceKop = Math.round(lineTotalKopAfter / i.quantity);
    actualTotalKop += unitPriceKop * i.quantity;

    return {
      id: i.productId,
      title: i.name,
      price: unitPriceKop,
      count: i.quantity,
      type: 'PHYSICAL',
    };
  });

  return { splitItems, actualTotalKop };
}

export async function POST(request) {
  await dbConnect();

  const user = verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const config = await PaymentConfig.findOne({ provider: 'yandex_split' }).lean();
  if (!config?.isActive) {
    return NextResponse.json({ error: 'Оплата долями временно недоступна' }, { status: 503 });
  }

  const apiUrl = process.env.YANDEX_SPLIT_API_URL;
  const apiKey = process.env.YANDEX_SPLIT_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('Yandex Split: YANDEX_SPLIT_API_URL или YANDEX_SPLIT_API_KEY не заданы');
    return NextResponse.json({ error: 'Платёжный провайдер не настроен' }, { status: 503 });
  }

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const totalRub = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalKopBeforeDiscount = Math.round(totalRub * 100);

  let bonusPoints = 0;
  if (body.bonusPoints > 0) {
    const caller = await User.findById(user.id).select('bonuses').lean();
    const maxRedeemable = Math.min(caller?.bonuses ?? 0, Math.floor(totalRub * 0.5));
    bonusPoints = Math.min(body.bonusPoints, maxRedeemable);
  }

  const discountedTotalRub = totalRub - bonusPoints;
  const nominalTotalKop = Math.round(discountedTotalRub * 100);
  const { splitItems, actualTotalKop } = buildDiscountedSplitItems(body.items, totalKopBeforeDiscount, nominalTotalKop);
  const merchantOrderId = `SB-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';

  const splitPayload = {
    merchantOrderId,
    amount: actualTotalKop,
    currency: 'RUB',
    items: splitItems,
    customer: {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
    },
    returnUrl: `${baseUrl}/thank-you?orderId=${merchantOrderId}`,
    failureUrl: `${baseUrl}/payment/error?orderId=${merchantOrderId}`,
  };

  let splitData;
  try {
    const splitRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Request-Id': randomUUID(),
      },
      body: JSON.stringify(splitPayload),
    });

    splitData = await splitRes.json();

    if (!splitRes.ok) {
      console.error('Yandex Split API error:', splitData);
      return NextResponse.json({ error: 'Ошибка платёжного провайдера' }, { status: 502 });
    }
  } catch (err) {
    console.error('Yandex Split fetch error:', err);
    return NextResponse.json({ error: 'Нет связи с платёжным провайдером' }, { status: 502 });
  }

  const paymentUrl = splitData?.redirectUrl ?? splitData?.paymentUrl;
  const splitOrderId = splitData?.orderId ?? splitData?.id ?? merchantOrderId;

  if (!paymentUrl) {
    console.error('Yandex Split: нет redirectUrl в ответе:', splitData);
    return NextResponse.json({ error: 'Платёжный провайдер не вернул ссылку' }, { status: 502 });
  }

  const order = await Order.create({
    orderNumber: merchantOrderId,
    userId: user.id,
    splitOrderId,
    customerInfo: {
      username: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
    },
    products: body.items.map(i => ({
      productId: i.productId,
      name: i.name,
      slug: i.slug ?? i.productId,
      image: i.image ?? '',
      price: i.price,
      quantity: i.quantity,
      totalPrice: i.price * i.quantity,
    })),
    subtotal: totalRub,
    discount: bonusPoints,
    totalAmount: discountedTotalRub,
    paymentMethod: 'yandex_split',
    paymentStatus: 'pending',
    status: 'pending',
    shippingAddress: {
      fullName: body.customerName,
      address: 'Самовывоз',
      city: 'Вологда',
    },
  });

  return NextResponse.json({ paymentUrl, orderId: order._id, orderNumber: merchantOrderId }, { status: 201 });
}
