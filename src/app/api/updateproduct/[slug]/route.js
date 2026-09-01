// app/api/updateproduct/[slug]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    const updateData = await request.json();
    
    // Находим товар
    const product = await Product.findOne({ slug, isDeleted: false });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Валидация обязательных полей
    if (!updateData.name || !updateData.new_price) {
      return NextResponse.json(
        { success: false, message: 'Заполните название и цену товара' },
        { status: 400 }
      );
    }
    
    // Обработка категорий
    if (updateData.category && updateData.category === "__new__") {
      if (!updateData.category_typed) {
        return NextResponse.json(
          { success: false, message: 'Введите название новой категории' },
          { status: 400 }
        );
      }
      updateData.category = updateData.category_typed.trim();
      
      // Создаем новую категорию если не существует
      const existingCategory = await Category.findOne({ name: updateData.category });
      if (!existingCategory) {
        await Category.create({ 
          name: updateData.category, 
          subcategories: updateData.subcategory ? [updateData.subcategory] : [] 
        });
      }
    }
    
    // Обработка подкатегории
    if (updateData.subcategory && updateData.subcategory === "__new__") {
      if (!updateData.subcategory_typed) {
        return NextResponse.json(
          { success: false, message: 'Введите название новой подкатегории' },
          { status: 400 }
        );
      }
      updateData.subcategory = updateData.subcategory_typed.trim();
      
      // Добавляем подкатегорию в категорию
      const category = await Category.findOne({ name: updateData.category });
      if (category && !category.subcategories.includes(updateData.subcategory)) {
        category.subcategories.push(updateData.subcategory);
        await category.save();
      }
    }
    
    // Обработка габаритов
    let dimensions = product.dimensions;
    if (updateData.dimensions) {
      dimensions = {
        length: Number(updateData.dimensions?.length) || product.dimensions?.length || 20,
        width: Number(updateData.dimensions?.width) || product.dimensions?.width || 20,
        height: Number(updateData.dimensions?.height) || product.dimensions?.height || 10,
        unit: updateData.dimensions?.unit || product.dimensions?.unit || 'cm'
      };
    }
    
    // Для Яндекс.Маркета quantity должно быть минимум 1
    let quantity = Math.max(1, Number(updateData.quantity) || product.quantity || 1);
    
    // Обновляем товар
    const updatedProduct = await Product.findOneAndUpdate(
      { slug, isDeleted: false },
      {
        name: updateData.name.trim(),
        description: updateData.description || '',
        category: updateData.category || product.category,
        subcategory: updateData.subcategory || product.subcategory,
        // Если поле brand/vendor присутствует в запросе — уважаем его значение,
        // включая пустую строку (админ намеренно стирает ошибочный бренд).
        // Отсутствует в запросе — оставляем как было. Если стёрли brand, но
        // vendor в запрос не положили — vendor тоже чистим (иначе в фиде
        // останется старое собственное название).
        brand: 'brand' in updateData ? (updateData.brand?.trim() || '') : product.brand,
        vendor: 'vendor' in updateData
          ? (updateData.vendor?.trim() || updateData.brand?.trim() || '')
          : ('brand' in updateData ? (updateData.brand?.trim() || '') : product.vendor),
        vendorCode: updateData.vendorCode?.trim() || product.vendorCode,
        sku: updateData.sku?.trim() || updateData.vendorCode?.trim() || product.sku,
        gtin: updateData.gtin?.trim() || product.gtin,
        weight: Number(updateData.weight) || product.weight || 0.5,
        dimensions: dimensions,
        country: updateData.country || product.country || 'Россия',
        old_price: Number(updateData.old_price) || 0,
        new_price: Number(updateData.new_price) || product.new_price,
        quantity: quantity,
        images: updateData.images || product.images || [],
        ymlExport: updateData.ymlExport !== undefined ? updateData.ymlExport : product.ymlExport,
        manufacturer_warranty: updateData.manufacturer_warranty !== undefined ? updateData.manufacturer_warranty : product.manufacturer_warranty,
        delivery: updateData.delivery !== undefined ? updateData.delivery : product.delivery,
        pickup: updateData.pickup !== undefined ? updateData.pickup : product.pickup,
        store: updateData.store !== undefined ? updateData.store : product.store,
        sales_notes: updateData.sales_notes || product.sales_notes
      },
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Товар обновлен: ${updatedProduct.name}, Вес: ${updatedProduct.weight}кг, Габариты: ${updatedProduct.dimensions.length}x${updatedProduct.dimensions.width}x${updatedProduct.dimensions.height}см`);
    
    return NextResponse.json({
      success: true,
      message: 'Товар успешно обновлен',
      product: updatedProduct
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера при обновлении товара' },
      { status: 500 }
    );
  }
}