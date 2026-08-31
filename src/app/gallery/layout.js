import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Фото работ сервисного центра СЕРВИС БОКС в Вологде',
  description: 'Фотогалерея выполненных ремонтов: ноутбуки, видеокарты, телефоны, приставки. Реальные примеры работ мастеров сервисного центра СЕРВИС БОКС в Вологде.',
  keywords: [
    'фото ремонта техники',
    'примеры работ сервисного центра',
    'галерея ремонта Вологда',
    'BGA пайка фото',
  ],
  alternates: {
    canonical: `${BASE_URL}/gallery`,
  },
  openGraph: {
    title: 'Фото работ — СЕРВИС БОКС',
    description: 'Примеры выполненных ремонтов техники в Вологде.',
    type: 'website',
    url: `${BASE_URL}/gallery`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function GalleryLayout({ children }) {
  return children;
}
