import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Отследить статус ремонта онлайн | СЕРВИС БОКС Вологда',
  description: 'Узнайте статус ремонта вашей техники онлайн по номеру заказа. Сервисный центр СЕРВИС БОКС в Вологде — прозрачное отслеживание на каждом этапе.',
  keywords: [
    'статус ремонта онлайн',
    'отследить заказ ремонта',
    'проверить готовность ремонта',
  ],
  alternates: {
    canonical: `${BASE_URL}/tracking`,
  },
  openGraph: {
    title: 'Отследить статус ремонта — СЕРВИС БОКС',
    description: 'Онлайн-отслеживание статуса ремонта техники в Вологде.',
    type: 'website',
    url: `${BASE_URL}/tracking`,
    siteName: BUSINESS.shortName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function TrackingLayout({ children }) {
  return children;
}
