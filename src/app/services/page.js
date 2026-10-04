// app/services/page.js
import ServicePricePage from '@/components/ServicePricePage/ServicePricePage';
import { BUSINESS, BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

// Страница с наивысшим sitemap-приоритетом (0.95) отдавала пустой список
// категорий в исходном HTML — дерево услуг грузилось только клиентским
// fetch('/api/services?tree=true') внутри useEffect. Поисковик ждёт
// выполнения JS, но первый рендер (и Lighthouse/curl) видел только
// спиннер. Теперь дерево строится на сервере тем же Service.getTree(),
// что и в /api/services, и передаётся как initial-state (SEO-аудит
// 2026-10-03). revalidate — как у /product/[slug] (тоже DB-driven).
export const revalidate = 3600;

// ✅ SEO-метаданные для страницы услуг
export const metadata = {
  title: 'Услуги и цены на ремонт техники в Вологде — Калькулятор | СЕРВИС БОКС',
  description: 'Рассчитайте стоимость ремонта онлайн. Ноутбуки, телефоны, видеокарты, приставки. Честные цены, гарантия до 24 месяцев.',
  keywords: ['ремонт техники Вологда', 'калькулятор ремонта', 'цена замены экрана', 'BGA пайка цена'],
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
  openGraph: {
    title: 'Услуги и цены на ремонт техники в Вологде',
    description: 'Онлайн-калькулятор ремонта. Узнайте точную стоимость до визита в сервис.',
    type: 'website',
    url: `${BASE_URL}/services`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default async function ServicesPage() {
  let initialServices = [];
  try {
    await dbConnect();
    const tree = await Service.getTree();
    // JSON.parse(JSON.stringify(...)) — та же сериализация, что уже
    // делает NextResponse.json() в /api/services (ObjectId/Date → строки),
    // чтобы форма данных совпадала с тем, что клиентский fetch получал и
    // раньше.
    initialServices = JSON.parse(JSON.stringify(tree));
  } catch (error) {
    console.warn('⚠️ [services/page] Не удалось получить дерево услуг на сервере:', error.message);
  }

  // Рендерим клиентский компонент калькулятора внутри серверной страницы
  return <ServicePricePage initialServices={initialServices} />;
}