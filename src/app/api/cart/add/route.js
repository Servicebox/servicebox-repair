// app/api/cart/add/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Product from '@/models/Product';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
    }

    const { itemSlug } = await request.json();
    console.log('➕ Adding to cart:', { userId: session.userId, itemSlug });
    
    if (!itemSlug) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }

    // Найдем продукт по slug
    const product = await Product.findOne({ slug: itemSlug });
    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    console.log(`🔍 Found product: ${product.name}, ID: ${product._id}`);

    let reservation = await ProductReservation.findOne({
      userId: session.userId,
      productId: product._id,
      status: 'reserved',
      expiresAt: { $gt: new Date() }
    });

    if (reservation) {
      reservation.quantity += 1;
      await reservation.save();
      console.log(`📈 Increased quantity for ${product.slug} to ${reservation.quantity}`);
    } else {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      reservation = await ProductReservation.create({
        userId: session.userId,
        productId: product._id,
        productSlug: product.slug,
        quantity: 1,
        expiresAt
      });
      console.log(`🆕 Created reservation for ${product.slug}`);
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в корзину: ' + error.message },
      { status: 500 }
    );
  }
}