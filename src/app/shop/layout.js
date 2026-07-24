import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Запчасти и аксессуары для техники в Вологде | ServiceBox35',
  description: 'Магазин оригинальных запчастей и аксессуаров для телефонов, ноутбуков, планшетов и консолей. Быстрая доставка по Вологде и области.',
  keywords: [
    'запчасти для телефонов Вологда',
    'запчасти для ноутбуков',
    'аксессуары для техники',
    'купить запчасти Вологда',
    'экраны iPhone Вологда',
    'аккумуляторы Вологда',
  ],
  alternates: {
    canonical: `${BASE_URL}/shop`,
  },
  openGraph: {
    title: 'Магазин запчастей и аксессуаров — ServiceBox35',
    description: 'Оригинальные запчасти и аксессуары с доставкой по Вологде. Гарантия качества.',
    type: 'website',
    url: `${BASE_URL}/shop`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function ShopLayout({ children }) {
  return children;
}
