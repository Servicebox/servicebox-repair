// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Order from '@/models/Order';
import dbConnect from '@/lib/db';

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