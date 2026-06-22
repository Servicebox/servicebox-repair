export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Order from '@/models/Order';
import PaymentConfig from '@/models/PaymentConfig';

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
});

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
  const totalKop = Math.round(totalRub * 100);
  const merchantOrderId = `SB-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';

  const splitPayload = {
    merchantOrderId,
    amount: totalKop,
    currency: 'RUB',
    items: body.items.map(i => ({
      id: i.productId,
      title: i.name,
      price: Math.round(i.price * 100),
      count: i.quantity,
      type: 'PHYSICAL',
    })),
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
    totalAmount: totalRub,
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
