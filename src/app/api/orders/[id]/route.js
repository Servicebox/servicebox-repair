// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Order from '@/models/Order';
import dbConnect from '@/lib/db';

// Используется страницей /thank-you для показа номера и статуса заказа
// сразу после оформления — в том числе гостям без сессии, поэтому
// сознательно без проверки авторизации. ID заказа — непредсказуемый
// Mongo ObjectId, который клиент получает только один раз, сразу в ответе
// на создание заказа (тот же уровень доверия, что у типичных страниц
// подтверждения гостевого заказа в e-commerce).
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке заказа' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        $push: {
          statusHistory: {
            status: status,
            timestamp: new Date(),
            note: `Статус изменен администратором`
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    );
  }
}