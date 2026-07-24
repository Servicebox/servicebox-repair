import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Отследить статус ремонта онлайн | ServiceBox35 Вологда',
  description: 'Узнайте статус ремонта вашей техники онлайн по номеру заказа. Сервисный центр ServiceBox35 в Вологде — прозрачное отслеживание на каждом этапе.',
  keywords: [
    'статус ремонта онлайн',
    'отследить заказ ремонта',
    'проверить готовность ремонта',
  ],
  alternates: {
    canonical: `${BASE_URL}/tracking`,
  },
  openGraph: {
    title: 'Отследить статус ремонта — ServiceBox35',
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
