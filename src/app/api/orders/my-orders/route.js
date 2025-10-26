// app/api/orders/my-orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Order from '@/models/Order';
import dbConnect from '@/lib/db';

export async function GET(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    console.log('🔐 Session in my-orders:', session);
    
    if (!session) {
      console.log('❌ No session in my-orders');
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    console.log('📋 Fetching orders for user:', session.userId);
    const orders = await Order.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`✅ Found ${orders.length} orders for user ${session.userId}`);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке заказов' },
      { status: 500 }
    );
  }
}