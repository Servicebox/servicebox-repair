// app/api/cart/sync/route.js
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
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { localCart } = await request.json();

    if (!localCart || typeof localCart !== 'object') {
      return NextResponse.json(
        { error: 'Неверный формат корзины' },
        { status: 400 }
      );
    }


    
    try {
      session.startTransaction();

      // Получаем текущие резервирования пользователя
      const existingReservations = await ProductReservation.find({
        userId: session.user.id,
        status: 'reserved'
      }).session(session);

      const existingCart = {};
      existingReservations.forEach(res => {
        existingCart[res.productSlug] = res.quantity;
      });

      // Обрабатываем каждый товар из локальной корзины
      for (const [productSlug, quantity] of Object.entries(localCart)) {
        if (quantity <= 0) continue;

        const product = await Product.findOne({ 
          slug: productSlug, 
          isActive: true 
        }).session(session);

        if (!product || !product.isAvailable(quantity)) {
          continue;
        }

        const existingQuantity = existingCart[productSlug] || 0;
        const quantityDifference = quantity - existingQuantity;

        if (quantityDifference > 0) {
          // Добавляем резервирование
          await createOrUpdateReservation(
            session.user.id,
            product,
            quantity,
            session
          );
        }
      }

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Корзина синхронизирована'
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при синхронизации корзины' },
      { status: 500 }
    );
  }
}

async function createOrUpdateReservation(userId, product, quantity, session) {
  const existingReservation = await ProductReservation.findOne({
    userId,
    productSlug: product.slug,
    status: 'reserved'
  }).session(session);

  if (existingReservation) {
    const quantityDifference = quantity - existingReservation.quantity;
    
    if (quantityDifference > 0) {
      await Product.findOneAndUpdate(
        { _id: product._id },
        { $inc: { reservedQuantity: quantityDifference } },
        { session }
      );
    }

    existingReservation.quantity = quantity;
    existingReservation.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await existingReservation.save({ session });
  } else {
    const reservation = new ProductReservation({
      productSlug: product.slug,
      userId,
      quantity,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });
    await reservation.save({ session });

    await Product.findOneAndUpdate(
      { _id: product._id },
      { $inc: { reservedQuantity: quantity } },
      { session }
    );
  }
}