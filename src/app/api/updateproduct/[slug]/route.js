import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // Асинхронное получение параметров
    const { slug } = await params;
    const updateData = await request.json();

    // Находим товар
    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Обработка категорий (аналогично добавлению товара)
    let finalCategory = updateData.category;
    let finalSubcategory = updateData.subcategory || '';

    if (updateData.category === "__new__") {
      if (!updateData.category_typed) {
        return NextResponse.json(
          { success: false, message: 'Введите название новой категории' },
          { status: 400 }
        );
      }
      finalCategory = updateData.category_typed.trim();
    }

    if (updateData.subcategory === "__new__") {
      if (!updateData.subcategory_typed) {
        return NextResponse.json(
          { success: false, message: 'Введите название новой подкатегории' },
          { status: 400 }
        );
      }
      finalSubcategory = updateData.subcategory_typed.trim();
    }

    // Обновляем товар
    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      {
        ...updateData,
        category: finalCategory,
        subcategory: finalSubcategory,
        old_price: Number(updateData.old_price) || 0,
        new_price: Number(updateData.new_price) || 0,
        quantity: Number(updateData.quantity) || 0
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Товар успешно обновлен',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Ошибка валидации', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}