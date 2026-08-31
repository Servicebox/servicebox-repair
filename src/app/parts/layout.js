import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Каталог запчастей для техники в Вологде | СЕРВИС БОКС',
  description: 'Каталог оригинальных и совместимых запчастей для ноутбуков, телефонов, планшетов, видеокарт и приставок. Наличие и цены в сервисном центре СЕРВИС БОКС, Вологда.',
  keywords: [
    'каталог запчастей Вологда',
    'запчасти для ремонта техники',
    'экраны и матрицы Вологда',
    'аккумуляторы для телефонов и ноутбуков',
    'купить запчасти для ремонта',
  ],
  alternates: {
    canonical: `${BASE_URL}/parts`,
  },
  openGraph: {
    title: 'Каталог запчастей — СЕРВИС БОКС',
    description: 'Оригинальные и совместимые запчасти для ремонта техники в наличии в Вологде.',
    type: 'website',
    url: `${BASE_URL}/parts`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function PartsLayout({ children }) {
  return children;
}
