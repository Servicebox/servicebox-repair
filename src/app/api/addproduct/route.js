// app/api/addproduct/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

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
    if (!productData.name || !productData.new_price) {
      return NextResponse.json(
        { success: false, message: 'Заполните название и цену товара' },
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
      
      // Создаем новую категорию если не существует
      const existingCategory = await Category.findOne({ name: finalCategory });
      if (!existingCategory) {
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
        
        // Добавляем подкатегорию в категорию
        if (!category.subcategories.includes(finalSubcategory)) {
          category.subcategories.push(finalSubcategory);
          await category.save();
        }
      }
    }

    // Если нет изображений, используем заглушку
    const images = productData.images && productData.images.length > 0 
      ? productData.images 
      : ['/images/placeholder-product.jpg'];

    // Для Яндекс.Маркет quantity должно быть минимум 1
    let quantity = Math.max(1, Number(productData.quantity) || 1);

    // Создаем товар
    const product = await Product.create({
      name: productData.name.trim(),
      slug,
      description: productData.description || '',
      category: finalCategory,
      subcategory: finalSubcategory,
      brand: productData.brand?.trim() || '',
      vendor: productData.vendor?.trim() || productData.brand?.trim() || '',
      vendorCode: productData.vendorCode?.trim() || '',
      sku: productData.sku?.trim() || productData.vendorCode?.trim() || '',
      gtin: productData.gtin?.trim() || '',
      weight: Number(productData.weight) || 0.5,
      dimensions: productData.dimensions || {
        length: Number(productData.dimensions?.length) || 20,
        width: Number(productData.dimensions?.width) || 20,
        height: Number(productData.dimensions?.height) || 10,
        unit: 'cm'
      },
      country: productData.country || 'Россия',
      old_price: Number(productData.old_price) || 0,
      new_price: Number(productData.new_price) || 0,
      quantity: quantity,
      images,
      ymlExport: true
    });

    console.log(`✅ Товар создан: ${product.name}, Вес: ${product.weight}кг, Габариты: ${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}см`);

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