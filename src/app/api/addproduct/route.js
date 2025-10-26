import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Product from '../../../models/Product';
import Category from '../../../models/Category';

// Функция для генерации slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export async function POST(request) {
  try {
    await dbConnect();
    const productData = await request.json();
    
    // Валидация обязательных полей
    if (!productData.name || !productData.new_price || !productData.quantity) {
      return NextResponse.json(
        { success: false, message: 'Заполните все обязательные поля: название, цена и количество' },
        { status: 400 }
      );
    }

    if (!productData.category) {
      return NextResponse.json(
        { success: false, message: 'Категория обязательна' },
        { status: 400 }
      );
    }

    // Генерация slug
    let slug = generateSlug(productData.name);
    
    // Проверяем уникальность slug
    let counter = 1;
    let originalSlug = slug;
    while (await Product.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Обработка категорий
    let finalCategory = productData.category;
    let finalSubcategory = productData.subcategory || '';

    // Если создается новая категория
    if (productData.category === "__new__") {
      if (!productData.category_typed) {
        return NextResponse.json(
          { success: false, message: 'Введите название новой категории' },
          { status: 400 }
        );
      }
      finalCategory = productData.category_typed.trim();
      
      // Проверяем, не существует ли уже такая категория
      const existingCategory = await Category.findOne({ name: finalCategory });
      if (!existingCategory) {
        // Создаем новую категорию
        await Category.create({ 
          name: finalCategory, 
          subcategories: finalSubcategory ? [finalSubcategory] : [] 
        });
      }
    } else {
      // Для существующей категории проверяем подкатегорию
      const category = await Category.findOne({ name: finalCategory });
      if (category && productData.subcategory === "__new__") {
        if (!productData.subcategory_typed) {
          return NextResponse.json(
            { success: false, message: 'Введите название новой подкатегории' },
            { status: 400 }
          );
        }
        finalSubcategory = productData.subcategory_typed.trim();
        
        // Добавляем подкатегорию в категорию, если ее еще нет
        if (!category.subcategories.includes(finalSubcategory)) {
          category.subcategories.push(finalSubcategory);
          await category.save();
        }
      }
    }

    // Обработка описания
    if (productData.description) {
      productData.description = productData.description.replace(/\n/g, '<br>');
    }

    // Если нет изображений, используем заглушку
    const images = productData.images && productData.images.length > 0 
      ? productData.images 
      : ['/images/placeholder-product.jpg'];

    // Создаем товар
    const product = await Product.create({
      name: productData.name.trim(),
      slug,
      description: productData.description || '',
      category: finalCategory,
      subcategory: finalSubcategory,
      old_price: Number(productData.old_price) || 0,
      new_price: Number(productData.new_price) || 0,
      quantity: Number(productData.quantity) || 0,
      images
    });

    return NextResponse.json({
      success: true,
      message: 'Товар успешно добавлен',
      productId: product._id,
      product: product
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Ошибка валидации', errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Товар с таким названием или slug уже существует' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Ошибка сервера при добавлении товара' },
      { status: 500 }
    );
  }
}