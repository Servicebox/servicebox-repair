import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  try {
    await dbConnect();
    
    // Проверяем, есть ли уже заказы
    const count = await Order.countDocuments();
    
    if (count === 0) {
      // Создаем тестовые заказы
      const testOrders = [
        {
          orderNumber: 'TEST-001',
          customerInfo: {
            username: 'Иван Иванов',
            email: 'ivan@example.com',
            phone: '+79110001122'
          },
          products: [
            {
              productId: 'borofone-bo22',
              name: 'Наушники накладные Bluetooth BOROFONE BO22',
              slug: 'bluetooth-borofone-bo22',
              price: 2399.98,
              quantity: 1,
              totalPrice: 2399.98,
              image: '/uploads/products/1765573007436-8de04yvvfz.webp'
            }
          ],
          pricing: {
            subtotal: 2399.98,
            shippingCost: 0,
            discount: 0,
            tax: 0,
            totalAmount: 2399.98
          },
          shippingMethod: 'pickup',
          shippingAddress: {
            address: 'ул. Ленина, 6',
            city: 'Вологда'
          },
          paymentMethod: 'cash',
          status: 'pending',
          paymentStatus: 'pending'
        },
        {
          orderNumber: 'TEST-002',
          customerInfo: {
            username: 'Анна Петрова',
            email: 'anna@example.com',
            phone: '+79112223344'
          },
          products: [
            {
              productId: 'iphone-11-face-id',
              name: 'Шлейф совместим с iPhone 11',
              slug: 'iphone-11-face-id-orig-factory',
              price: 800,
              quantity: 2,
              totalPrice: 1600,
              image: '/uploads/products/1765735702903-9ctdfcz98o.webp'
            },
            {
              productId: 'wbt-93',
              name: 'Наушники WALKER WBT-93',
              slug: 'bluetooth-walker-wbt-93-ancenc',
              price: 3300,
              quantity: 1,
              totalPrice: 3300,
              image: '/uploads/products/1765570568097-jbop8hu8ej.webp'
            }
          ],
          pricing: {
            subtotal: 4900,
            shippingCost: 300,
            discount: 0,
            tax: 0,
            totalAmount: 5200
          },
          shippingMethod: 'courier',
          shippingAddress: {
            address: 'ул. Северная, 7А, офис 405',
            city: 'Вологда',
            postalCode: '160000'
          },
          paymentMethod: 'card',
          status: 'confirmed',
          paymentStatus: 'paid'
        }
      ];
      
      await Order.insertMany(testOrders);
      
      return NextResponse.json({
        success: true,
        message: 'Тестовые заказы созданы',
        count: testOrders.length
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Заказы уже существуют',
      count
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания тестовых данных' },
      { status: 500 }
    );
  }
}