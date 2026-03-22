// app/api/cart/update/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Product from '@/models/Product';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(request);
    const { itemSlug, quantity } = await request.json();

    if (!itemSlug || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Неверные параметры' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const product = await Product.findOne({ slug: itemSlug, isActive: true });
    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }


    
    try {
      session.startTransaction();

      const existingReservation = await ProductReservation.findOne({
        userId: session.user.id,
        productSlug: itemSlug,
        status: 'reserved'
      }).session(session);

      if (!existingReservation) {
        return NextResponse.json(
          { error: 'Товар не найден в корзине' },
          { status: 404 }
        );
      }

      const quantityDifference = quantity - existingReservation.quantity;

      if (quantityDifference > 0) {
        // Увеличиваем количество
        if (!product.isAvailable(quantityDifference)) {
          throw new Error('Недостаточно товара в наличии');
        }

        await Product.findOneAndUpdate(
          { slug: itemSlug },
          { $inc: { reservedQuantity: quantityDifference } },
          { session }
        );
      } else if (quantityDifference < 0) {
        // Уменьшаем количество
        await Product.findOneAndUpdate(
          { slug: itemSlug },
          { $inc: { reservedQuantity: quantityDifference } },
          { session }
        );
      }

      if (quantity === 0) {
        // Удаляем резервирование
        await ProductReservation.findByIdAndUpdate(
          existingReservation._id,
          { status: 'released' },
          { session }
        );
      } else {
        // Обновляем резервирование
        existingReservation.quantity = quantity;
        existingReservation.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await existingReservation.save({ session });
      }

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Количество обновлено'
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении корзины' },
      { status: 500 }
    );
  }
}