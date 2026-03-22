// utils/check-db.js
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Service from '@/models/Service';
import News from '@/models/News';

async function checkDatabase() {
  try {
    await connectDB();
    
    console.log('🔍 Проверка данных в MongoDB:');
    
    // Проверяем услуги
    const servicesCount = await Service.countDocuments();
    console.log(`📊 Услуг в базе: ${servicesCount}`);
    
    if (servicesCount > 0) {
      const sampleServices = await Service.find().limit(3).select('name slug description');
      console.log('📋 Примеры услуг:');
      sampleServices.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.name} (${s.slug})`);
      });
    }
    
    // Проверяем товары
    const productsCount = await Product.countDocuments({ isActive: true });
    console.log(`📊 Активных товаров: ${productsCount}`);
    
    if (productsCount > 0) {
      const sampleProducts = await Product.find({ isActive: true }).limit(3).select('name slug description');
      console.log('📋 Примеры товаров:');
      sampleProducts.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.name} (${p.slug})`);
      });
    }
    
    // Проверяем новости
    const newsCount = await News.countDocuments({ isPublished: true });
    console.log(`📊 Опубликованных новостей: ${newsCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка проверки базы:', error);
    process.exit(1);
  }
}

checkDatabase();