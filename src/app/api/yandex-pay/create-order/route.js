import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Order from '@/models/Order';
import connectDB from '@/lib/db';

// Временный тестовый ключ для Яндекс.Пэй (замените на реальный в продакшене)
const TEST_API_KEY = 'test_api_key_' + Date.now();

export async function POST(request) {
  await connectDB();

  try {
    const body = await request.json();
    console.log('📦 Создание заказа Яндекс.Пэй (тестовый режим):', {
      amount: body.amount,
      productsCount: body.products?.length,
      splitPlan: body.splitPlan,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone
    });

    // Валидация данных
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Неверная сумма заказа' },
        { status: 400 }
      );
    }

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Нет товаров в заказе' },
        { status: 400 }
      );
    }

    // Создаем заказ в нашей БД (в тестовом режиме)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderData = {
      orderNumber,
      userId: body.userId || null,
      customerInfo: {
        username: body.customerName || 'Покупатель',
        email: body.customerEmail || 'test@example.com', // Значение по умолчанию
        phone: body.customerPhone || '+79999999999' // Значение по умолчанию
      },
      products: body.products.map(product => ({
        productId: product.id || product.slug || 'unknown', // Используем slug как ID
        name: product.name || 'Товар',
        slug: product.slug || product.id || 'unknown',
        image: product.image || '',
        price: product.price || 0,
        quantity: product.quantity || 1,
        totalPrice: (product.price || 0) * (product.quantity || 1)
      })),
      pricing: {
        subtotal: body.amount,
        shippingCost: body.shippingCost || 0,
        discount: body.discount || 0,
        tax: body.tax || 0,
        totalAmount: body.amount + (body.shippingCost || 0)
      },
      shippingMethod: body.shippingMethod || 'pickup',
      paymentMethod: 'yandex_pay',
      paymentDetails: {
        gateway: 'yandex_pay',
        splitPlan: body.splitPlan || null
      },
      status: 'pending',
      paymentStatus: 'pending'
    };

    // Сохраняем заказ в БД
    const order = new Order(orderData);
    await order.save();

    console.log('✅ Заказ сохранен в БД:', order._id);

    // ТЕСТОВЫЙ РЕЖИМ: возвращаем фиктивные данные Яндекс.Пэй
    // В продакшене здесь должен быть реальный вызов API Яндекс.Пэй

    const paymentId = `payment_${uuidv4().substring(0, 8)}`;
    const confirmationUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/payment/success?orderId=${order._id}&paymentId=${paymentId}`;

    console.log('🟡 Тестовый режим: создан фиктивный платеж', paymentId);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: paymentId,
      status: 'pending',
      amount: body.amount,
      currency: 'RUB',
      confirmationUrl: confirmationUrl,
      splitPlan: body.splitPlan || null,
      testMode: true,
      message: 'ТЕСТОВЫЙ РЕЖИМ: Платеж создан в тестовом режиме. В продакшене будет реальный вызов Яндекс.Пэй API.'
    });

  } catch (error) {
    console.error('❌ Ошибка создания заказа Яндекс.Пэй:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка создания платежа',
        message: error.message,
        // Добавляем больше деталей для отладки
        validationErrors: error.errors,
        stack: process.env.NODE_ENV === 'production' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'API создания заказа Яндекс.Пэй',
    status: 'active',
    mode: process.env.NODE_ENV || 'production',
    testMode: true,
    instructions: 'В тестовом режиме создаются фиктивные платежи. Для реальных платежей настройте переменные окружения.'
  });
}