import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import dbConnect from '@/lib/db';

export async function DELETE(request, { params }) {
  await dbConnect();
  const { slug } = params;

  try {
    const deletedProduct = await Product.findOneAndDelete({ slug });
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Товар успешно удален' 
    });
  } catch (error) {
    console.error('Remove product error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка удаления товара' },
      { status: 500 }
    );
  }
}