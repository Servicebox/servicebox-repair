// app/page.js
import Main from '../components/Main/Main';
import { BUSINESS, BASE_URL } from '@/lib/constants';

export const metadata = {
  title: 'Ремонт телефонов, ноутбуков, телевизоров и видеокарт в Вологде',
  description:
    'Срочный ремонт цифровой техники в Вологде. Бесплатная диагностика. Гарантия до 24 мес. Замена экранов, BGA-пайка. Ул. Северная, 7А. Работаем без выходных.',
  keywords: [
    'ремонт телефонов Вологда',
    'ремонт ноутбуков Вологда',
    'ремонт телевизоров Вологда',
    'ремонт видеокарт Вологда',
    'ремонт консолей вологда',
    'замена экрана Вологда',
    'BGA пайка Вологда',
    'сервисный центр Вологда',
    'СЕРВИС БОКС',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ремонт техники в Вологде | Сервисный центр СЕРВИС БОКС',
    description:
      'Срочный ремонт телефонов, ноутбуков и видеокарт. Бесплатная диагностика и гарантия до 2 лет.',
    url: BASE_URL,
    siteName: BUSINESS.shortName,
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BUSINESS.shortName} - Ремонт техники в Вологде`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ремонт техники в Вологде | Сервисный центр СЕРВИС БОКС',
    description:
      'Срочный ремонт телефонов, ноутбуков и видеокарт. Бесплатная диагностика и гарантия до 2 лет.',
    images: ['/og-image.jpg'],
  },
};

export default function Home() {
  return <Main />;
}