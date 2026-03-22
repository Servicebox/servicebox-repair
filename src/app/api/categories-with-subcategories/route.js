import { NextResponse } from 'next/server';
import Product from '../../../models/Product';
import dbConnect from '../../../lib/db';

export async function GET() {
  await dbConnect();
  
  try {
    // Получаем все продукты из базы данных
    const products = await Product.find({}).lean();

    // Собираем уникальные категории и подкатегории из продуктов
    const categoriesMap = new Map();

    products.forEach(product => {
      if (product.category) {
        if (!categoriesMap.has(product.category)) {
          categoriesMap.set(product.category, new Set());
        }
        
        if (product.subcategory) {
          categoriesMap.get(product.category).add(product.subcategory);
        }
      }
    });

    // Преобразуем Map в массив объектов
    const categories = Array.from(categoriesMap.entries()).map(([category, subcategoriesSet]) => ({
      category,
      subcategories: Array.from(subcategoriesSet).filter(Boolean) // Убираем пустые значения
    }));

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка получения категорий' },
      { status: 500 }
    );
  }
}