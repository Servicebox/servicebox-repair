// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Order from '@/models/Order';
import Product from '@/models/Product';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';
import { fetchCrm } from '@/lib/crmClient';

// app/api/orders/route.js - исправленная POST функция
export async function POST(request) {
  try {
    await dbConnect();

    // Сессия опциональна: у корзины и формы оформления заказа нет требования
    // входа в аккаунт (localStorage-корзина работает без авторизации, как и
    // запись на услуги в src/app/api/bookings/route.js), а схема Order.userId
    // не помечена required — значит гостевые заказы предусмотрены изначально.
    // Раньше здесь был жёсткий 401 без сессии, из-за чего гость мог заполнить
    // всю форму оформления и получить отказ только на последнем шаге.
    const session = await getServerSession(request);
    console.log('🔐 Session in order creation:', session);

    const orderData = await request.json();
    console.log('📦 Order data received:', orderData);

    if (!orderData.products || orderData.products.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    // Автоматически генерируем номер заказа, если он не передан
    if (!orderData.orderNumber) {
      const now = new Date();
      const timestamp = now.getTime();
      const random = Math.floor(Math.random() * 10000);
      orderData.orderNumber = `ORD-${timestamp}-${random}`;
      console.log(`✅ авто генерация order number: ${orderData.orderNumber}`);
    }

    console.log('🔄 Checking product availability...');
    for (const item of orderData.products) {
      console.log(`📋 Checking product: ${item.name}, quantity: ${item.quantity}`);

      const product = await Product.findOne({ slug: item.slug });
      if (!product) {
        return NextResponse.json({
          error: `Товар "${item.name}" не найден`
        }, { status: 404 });
      }

      console.log(`📊 Product ${item.slug} current quantity: ${product.quantity}, requested: ${item.quantity}`);

      if (product.quantity < item.quantity) {
        return NextResponse.json({
          error: `Недостаточно товара "${item.name}". Доступно: ${product.quantity}, запрошено: ${item.quantity}`
        }, { status: 400 });
      }

      // Уменьшаем количество товара
      console.log(`➖ Reducing quantity for ${item.slug} from ${product.quantity} to ${product.quantity - item.quantity}`);
      product.quantity -= item.quantity;
      await product.save();
      console.log(`✅ Quantity updated for ${item.slug}`);
    }

    console.log('📝 Creating order...');
    const order = await Order.create({
      ...(session ? { userId: session.userId } : {}),
      ...orderData,
      status: 'pending',
      paymentStatus: orderData.paymentMethod === 'cash' ? 'pending' : 'pending'
    });

    console.log('✅ Order created:', order._id);

    // Дублируем заказ в CRM — best-effort, тот же паттерн, что и для записей
    // на услуги (src/app/api/bookings/route.js), чтобы сотрудники видели
    // заказы товаров рядом с заявками на ремонт и получали уведомление в
    // CRM так же, как при новом сообщении в чате. Не блокирует ответ клиенту
    // и не должно ронять заказ, если CRM недоступна.
    try {
      const productsList = orderData.products
        .map((item) => `• ${item.name} — ${item.quantity} шт. × ${item.price}₽ = ${item.totalPrice}₽`)
        .join('\n');
      const crmRes = await fetchCrm('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          clientName: orderData.customerInfo?.username || 'Не указано',
          clientPhone: orderData.customerInfo?.phone || undefined,
          clientEmail: orderData.customerInfo?.email || undefined,
          deviceType: 'Заказ товаров с сайта',
          defectDescription:
            `Заказ №${order.orderNumber}\n${productsList}\n` +
            `Сумма: ${orderData.pricing?.totalAmount}₽\n` +
            `Доставка: ${orderData.shippingMethod || 'pickup'}\n` +
            `Оплата: ${orderData.paymentMethod || 'cash'}` +
            (orderData.customerNotes ? `\nКомментарий: ${orderData.customerNotes}` : ''),
          source: 'сайт (заказ товаров)',
        }),
      });
      if (crmRes && !crmRes.ok) {
        console.error('[orders] CRM ответил ошибкой:', crmRes.status, await crmRes.text().catch(() => ''));
      }
    } catch (crmError) {
      console.error('❌ Ошибка отправки заказа в CRM:', crmError);
    }

    // Очищаем резервирования после создания заказа (только для авторизованных —
    // у гостевых заказов резервирований по userId нет)
    if (session) {
      console.log('🗑️ Clearing reservations...');
      const deletedReservations = await ProductReservation.deleteMany({
        userId: session.userId,
        status: 'reserved'
      });
      console.log(`✅ Removed ${deletedReservations.deletedCount} reservations`);
    }

    return NextResponse.json({
      success: true,
      order,
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: 'Заказ успешно создан'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const session = await getServerSession(request);
    console.log('🔐 Session in orders GET:', session);

    if (!session) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Для админов показываем все заказы, для пользователей - только их
    let query = {};
    if (session.role !== 'admin') {
      query.userId = session.userId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('📋 Fetching orders with query:', query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    console.log(`✅ Found ${orders.length} orders out of ${totalOrders} total`);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders
      }
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке заказов' },
      { status: 500 }
    );
  }
}