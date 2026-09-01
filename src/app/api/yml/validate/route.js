// app/api/yml/validate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({ 
      isActive: true, 
      isDeleted: false,
      ymlExport: true
    }).lean();
    
    const validationResults = {
      total: products.length,
      valid: 0,
      withErrors: 0,
      withWarnings: 0,
      products: [],
      summary: {
        missingWeight: 0,
        missingDimensions: 0,
        missingImages: 0,
        missingBrand: 0,
        lowPrice: 0
      }
    };
    
    products.forEach(product => {
      const validation = {
        id: product._id.toString(),
        name: product.name,
        errors: [],
        warnings: [],
        score: 100
      };
      
      // Проверка обязательных полей
      if (!product.name || product.name.trim().length < 3) {
        validation.errors.push('Название слишком короткое');
        validation.score -= 20;
      }
      
      // Пустой бренд — норма: свою продукцию мы не выпускаем, чужой бренд
      // без данных не подставляем. Это предупреждение, а не ошибка.
      if (!product.brand || product.brand.trim().length === 0) {
        validation.warnings.push('Бренд не указан (товар без бренда)');
        validation.summary.missingBrand++;
        validation.score -= 3;
      }
      
      if (!product.new_price || product.new_price < 10) {
        validation.warnings.push('Цена ниже 10 рублей');
        validation.summary.lowPrice++;
        validation.score -= 5;
      }
      
      // Проверка веса
      if (!product.weight || product.weight < 0.001) {
        validation.warnings.push('Вес не указан или слишком мал');
        validation.summary.missingWeight++;
        validation.score -= 10;
      }
      
      // Проверка габаритов
      if (!product.dimensions || 
          !product.dimensions.length || 
          !product.dimensions.width || 
          !product.dimensions.height) {
        validation.warnings.push('Габариты не указаны');
        validation.summary.missingDimensions++;
        validation.score -= 10;
      }
      
      // Проверка изображений
      if (!product.images || product.images.length === 0) {
        validation.warnings.push('Нет изображений');
        validation.summary.missingImages++;
        validation.score -= 15;
      }
      
      // Определяем статус
      validation.isValid = validation.errors.length === 0;
      validation.hasWarnings = validation.warnings.length > 0;
      
      if (validation.isValid) validationResults.valid++;
      if (validation.errors.length > 0) validationResults.withErrors++;
      if (validation.warnings.length > 0) validationResults.withWarnings++;
      
      validationResults.products.push(validation);
    });
    
    return NextResponse.json({
      success: true,
      data: validationResults,
      generated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error validating YML:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}