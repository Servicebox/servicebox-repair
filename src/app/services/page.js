// app/services/page.js
import ServicePricePage from '@/components/ServicePricePage/ServicePricePage';
import { BUSINESS, BASE_URL } from '@/lib/constants';

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

export default function ServicesPage() {
  // Рендерим клиентский компонент калькулятора внутри серверной страницы
  return <ServicePricePage />;
}