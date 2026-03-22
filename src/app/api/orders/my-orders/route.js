// app/api/orders/my-orders/route.js
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import { getServerSession } from '@/lib/session'; // Правильный импорт

export async function GET(request) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(request);
    
    console.log('🔐 Session in my-orders:', session);
    
    if (!session || !session.userId) {
      console.log('❌ No session or userId found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized',
          message: 'Необходима авторизация' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    await connectDB();
    
    console.log(`📋 Fetching orders for user: ${session.userId}`);
    
    // Ищем заказы пользователя
    const orders = await Order.find({ 
      $or: [
        { userId: session.userId },
        { 'customerInfo.email': session.email }
      ],
      isDeleted: false 
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
    console.log(`✅ Found ${orders.length} orders for user ${session.userId}`);
    
    // Форматируем заказы для фронтенда
    const formattedOrders = orders.map(order => {
      // Проверяем, что products - массив
      const products = Array.isArray(order.products) ? order.products : [];
      
      return {
        ...order,
        _id: order._id.toString(),
        orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        customerInfo: order.customerInfo || {
          username: session.username || 'Пользователь',
          email: session.email || 'Не указан',
          phone: order.shippingAddress?.phone || ''
        },
        // Обеспечиваем обратную совместимость
        items: products, // для старых компонентов
        products: products, // для новых компонентов
        pricing: {
          subtotal: order.subtotal || 0,
          shippingCost: order.shippingCost || 0,
          discount: order.discount || 0,
          tax: order.tax || 0,
          totalAmount: order.totalAmount || 0
        },
        // Форматируем адрес доставки
        shippingAddress: formatShippingAddress(order.shippingAddress),
        // Статус
        status: order.status || 'pending'
      };
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        orders: formattedOrders,
        count: formattedOrders.length,
        message: `Найдено ${formattedOrders.length} заказов`
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal Server Error',
        message: 'Ошибка сервера при получении заказов',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Вспомогательная функция для форматирования адреса
function formatShippingAddress(address) {
  if (!address) return 'Не указан';
  
  if (typeof address === 'string') {
    return address;
  }
  
  // Если это объект (новая модель Order)
  if (address.fullName) {
    const parts = [
      address.fullName,
      address.address,
      address.city,
      address.country,
      address.postalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  // Если это старый формат
  return JSON.stringify(address);
}