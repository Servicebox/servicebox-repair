// app/api/allproducts/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({ 
      isActive: true, 
      isDeleted: false 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    // Преобразуем каждый продукт
    const processedProducts = products.map(product => {
      const plainProduct = JSON.parse(JSON.stringify(product));
      plainProduct._id = plainProduct._id.toString();
      
      // Вычисляем доступное количество
      const quantity = plainProduct.quantity || 0;
      const reservedQuantity = plainProduct.reservedQuantity || 0;
      const availableQuantity = Math.max(0, quantity - reservedQuantity);
      
      return {
        ...plainProduct,
        availableQuantity,
        hasStock: availableQuantity > 0,
        mainImage: plainProduct.images?.[0] || '/images/placeholder.jpg'
      };
    });
    
    return NextResponse.json({
      success: true,
      products: processedProducts,
      count: processedProducts.length
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке товаров'
      },
      { status: 500 }
    );
  }
}