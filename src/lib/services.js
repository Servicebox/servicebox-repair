 // lib/services.js
import Service from '@/models/Service';
import connectDB from './db';

export async function getServicesForSitemap() {
  await connectDB();
  
  return await Service.find(
    { isCategory: false }, // Только услуги, не категории
    'slug fullPath updatedAt isCategory level'
  );
}

export async function getServiceMetadata(slug) {
  await connectDB();
  
  const service = await Service.findOne({ 
    $or: [
      { slug },
      { fullPath: slug }
    ]
  }).lean();
  
  if (!service) {
    return {
      title: 'Услуга не найдена',
      description: 'Страница услуги не найдена',
      keywords: []
    };
  }
  
  return {
    title: service.metaTitle || `${service.name} в Вологде | СЕРВИС БОКС`,
    description: service.metaDescription || service.description,
    keywords: [
      ...(service.keywords || []),
      ...(service.geoKeywords || []),
      service.name,
      'ремонт',
      'Вологда',
      'сервис'
    ]
  };
}