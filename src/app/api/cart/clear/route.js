// app/api/cart/clear/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import Product from '@/models/Product';
import ProductReservation from '@/models/ProductReservation';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    await dbConnect();
    

    
    if (!session) {
      return NextResponse.json({
        success: true,
        message: 'Корзина очищена (локально)'
      });
    }

    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Находим все активные резервирования пользователя
      const reservations = await ProductReservation.find({
        userId: session.user.id,
        status: 'reserved'
      }).session(session);

      // Освобождаем все зарезервированные товары
      for (const reservation of reservations) {
        await Product.findOneAndUpdate(
          { slug: reservation.productSlug },
          { $inc: { reservedQuantity: -reservation.quantity } },
          { session }
        );
      }

      // Помечаем резервирования как освобожденные
      await ProductReservation.updateMany(
        { userId: session.user.id, status: 'reserved' },
        { status: 'released' },
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Корзина очищена'
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при очистке корзины' },
      { status: 500 }
    );
  }
}