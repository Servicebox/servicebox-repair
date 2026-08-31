import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'О компании СЕРВИС БОКС | Ремонт техники в Вологде',
  description: 'СЕРВИС БОКС — сервисный центр в Вологде с опытом 10+ лет. Ремонт ноутбуков, видеокарт, телефонов, приставок. Сертифицированные мастера, гарантия на все виды работ.',
  keywords: [
    'о компании СЕРВИС БОКС',
    'сервисный центр Вологда',
    'ремонт техники Вологда',
    'мастерская по ремонту',
    'BGA пайка Вологда',
    'ремонт видеокарт Вологда',
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: 'О сервисном центре СЕРВИС БОКС в Вологде',
    description: 'Более 10 лет ремонтируем электронику в Вологде. Сложный ремонт, BGA-пайка, гарантия.',
    type: 'website',
    url: `${BASE_URL}/about`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
