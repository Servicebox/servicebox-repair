import { NextResponse } from 'next/server';
import Promotion from '@/models/Promotion';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params; // Добавлен await
    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Акция не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Get promotion error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении акции' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params; // Добавлен await
    const body = await request.json();

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Акция не найдена' },
        { status: 404 }
      );
    }

    const { title, description, endDate, image } = body;
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      id,
      { title, description, endDate, image },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedPromotion
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка при обновлении акции' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params; // Добавлен await
    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Акция не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Акция успешно удалена',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении акции' },
      { status: 500 }
    );
  }
}