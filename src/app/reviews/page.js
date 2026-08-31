import { BASE_URL, BUSINESS } from '@/lib/constants';
import ReviewsClient from './ReviewsClient';

export const metadata = {
  title: 'Отзывы клиентов о ремонте техники в Вологде | СЕРВИС БОКС',
  description: `Реальные отзывы клиентов ${BUSINESS.shortName} о ремонте телефонов, ноутбуков и другой техники в Вологде.`,
  alternates: { canonical: `${BASE_URL}/reviews` },
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
