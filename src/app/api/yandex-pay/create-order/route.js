export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Order from '@/models/Order';

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
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  totalAmount: z.number().positive(),
});

export async function POST(request) {
  await dbConnect();

  const caller = await verifyToken(request);
  if (!caller) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
  }

  const merchantId  = process.env.YANDEX_PAY_MERCHANT_ID;
  const merchantKey = process.env.YANDEX_PAY_MERCHANT_API_KEY;
  const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';
  const isSandbox   = process.env.NODE_ENV !== 'production';

  if (!merchantId || !merchantKey) {
    console.error('Yandex Pay: YANDEX_PAY_MERCHANT_ID или YANDEX_PAY_MERCHANT_API_KEY не заданы');
    return NextResponse.json({ error: 'Платёжный провайдер не настроен' }, { status: 503 });
  }

  const merchantOrderId = `SB-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const apiBase = isSandbox
    ? 'https://sandbox.pay.yandex.ru'
    : 'https://pay.yandex.ru';

  // Формат суммы требует строку с двумя знаками после запятой
  const formatAmount = (rub) => rub.toFixed(2);

  const yaPayPayload = {
    orderId: merchantOrderId,
    currencyCode: 'RUB',
    availablePaymentMethods: ['CARD', 'SPLIT'],
    cart: {
      items: body.items.map(i => ({
        productId: i.productId,
        title:     i.name,
        quantity:  { count: String(i.quantity) },
        total:     formatAmount(i.price * i.quantity),
      })),
      total: { amount: formatAmount(body.totalAmount) },
    },
    // Email или телефон для фискального чека
    fiscalContact: body.customer.email || body.customer.phone || '',
    redirectUrls: {
      onSuccess: `${baseUrl}/thank-you?orderId=${merchantOrderId}`,
      onError:   `${baseUrl}/payment/error?orderId=${merchantOrderId}`,
    },
  };

  let paymentUrl;
  try {
    const yaRes = await fetch(`${apiBase}/api/merchant/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Api-Key ${merchantKey}`,
        'X-Request-Id':  randomUUID(),
      },
      body: JSON.stringify(yaPayPayload),
    });

    const yaData = await yaRes.json();

    if (!yaRes.ok || yaData.status !== 'success') {
      console.error('Yandex Pay API error:', yaData);
      return NextResponse.json({ error: 'Ошибка платёжного провайдера' }, { status: 502 });
    }

    paymentUrl = yaData.data?.paymentUrl;
  } catch (err) {
    console.error('Yandex Pay fetch error:', err);
    return NextResponse.json({ error: 'Нет связи с платёжным провайдером' }, { status: 502 });
  }

  if (!paymentUrl) {
    return NextResponse.json({ error: 'Платёжный провайдер не вернул ссылку' }, { status: 502 });
  }

  const order = await Order.create({
    orderNumber:  merchantOrderId,
    userId:       caller.id,
    splitOrderId: merchantOrderId,
    customerInfo: {
      username: body.customer.name,
      email:    body.customer.email,
      phone:    body.customer.phone ?? '',
    },
    products: body.items.map(i => ({
      productId:  i.productId,
      name:       i.name,
      slug:       i.slug ?? i.productId,
      image:      i.image ?? '',
      price:      i.price,
      quantity:   i.quantity,
      totalPrice: i.price * i.quantity,
    })),
    subtotal:      body.totalAmount,
    totalAmount:   body.totalAmount,
    paymentMethod: 'yandex_pay',
    paymentStatus: 'pending',
    status:        'pending',
    shippingAddress: {
      fullName: body.customer.name,
      address:  'Самовывоз',
      city:     'Вологда',
    },
  });

  return NextResponse.json({ paymentUrl, orderId: order._id, orderNumber: merchantOrderId }, { status: 201 });
}
