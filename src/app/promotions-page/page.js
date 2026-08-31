// app/promotions-page/page.js
import PromotionsPageComponent from '@/components/PromotionsPage/PromotionsPage';
import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Акции и скидки на ремонт техники в Вологде | СЕРВИС БОКС',
  description:
    'Актуальные акции и специальные предложения сервисного центра СЕРВИС БОКС в Вологде: скидки на ремонт, бесплатная диагностика, бонусы за отзыв.',
  keywords: [
    'акции ремонт техники Вологда',
    'скидки на ремонт телефонов',
    'сервисный центр акции Вологда',
    'СЕРВИС БОКС акции',
  ],
  alternates: {
    canonical: `${BASE_URL}/promotions-page`,
  },
  openGraph: {
    title: 'Акции и скидки на ремонт техники в Вологде',
    description:
      'Актуальные акции сервисного центра СЕРВИС БОКС в Вологде: скидки на ремонт, бесплатная диагностика, бонусы.',
    url: `${BASE_URL}/promotions-page`,
    siteName: BUSINESS.shortName,
    locale: 'ru_RU',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Акции СЕРВИС БОКС Вологда' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Акции и скидки на ремонт техники в Вологде',
    description: 'Актуальные акции сервисного центра СЕРВИС БОКС в Вологде.',
    images: ['/og-image.jpg'],
  },
};

export default function PromotionsPage() {
  return (
    <>
      {/* SSR-заголовок: список акций грузится на клиенте (useEffect + /api/promotions),
          до этого в HTML не было ни h1, ни текста. */}
      <header className="promotions-page-header">
        <h1>Акции и скидки на ремонт техники в Вологде</h1>
        <p>Актуальные предложения сервисного центра СЕРВИС БОКС: скидки на ремонт, бесплатная диагностика и бонусы за отзыв.</p>
      </header>
      <PromotionsPageComponent />
    </>
  );
}
