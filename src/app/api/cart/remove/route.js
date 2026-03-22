// app/api/cart/remove/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Product from '@/models/Product';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    const { itemSlug } = await request.json();

    if (!itemSlug) {
      return NextResponse.json(
        { error: 'Не указан товар' },
        { status: 400 }
      );
    }

    if (session) {
      return await handleAuthenticatedUser(session.user.id, itemSlug);
    } else {
      return NextResponse.json({
        success: true,
        message: 'Товар удален из корзины (локально)'
      });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из корзины' },
      { status: 500 }
    );
  }
}

async function handleAuthenticatedUser(userId, productSlug) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Находим резервирование
    const reservation = await ProductReservation.findOne({
      userId,
      productSlug,
      status: 'reserved'
    }).session(session);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Товар не найден в корзине' },
        { status: 404 }
      );
    }

    if (reservation.quantity > 1) {
      // Уменьшаем количество
      reservation.quantity -= 1;
      reservation.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await reservation.save({ session });

      // Освобождаем 1 единицу товара
      await Product.findOneAndUpdate(
        { slug: productSlug },
        { $inc: { reservedQuantity: -1 } },
        { session }
      );
    } else {
      // Удаляем резервирование
      await ProductReservation.findByIdAndUpdate(
        reservation._id,
        { status: 'released' },
        { session }
      );

      // Освобождаем товар
      await Product.findOneAndUpdate(
        { slug: productSlug },
        { $inc: { reservedQuantity: -reservation.quantity } },
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: 'Товар удален из корзины'
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}