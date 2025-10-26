// app/api/cart/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';

export async function GET(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ cart: {} }, { status: 200 });
    }

    console.log('🛒 Fetching cart for user:', session.userId);
    
    // Находим активные резервирования пользователя
    const reservations = await ProductReservation.find({
      userId: session.userId,
      status: 'reserved',
      expiresAt: { $gt: new Date() }
    });

    console.log(`📦 Found ${reservations.length} reservations`);

    // Формируем корзину по productSlug
    const cart = {};
    reservations.forEach(reservation => {
      if (reservation.productSlug) {
        cart[reservation.productSlug] = reservation.quantity;
        console.log(`➕ Added to cart: ${reservation.productSlug} - ${reservation.quantity}`);
      }
    });

    console.log('✅ Final cart:', cart);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке корзины: ' + error.message },
      { status: 500 }
    );
  }
}