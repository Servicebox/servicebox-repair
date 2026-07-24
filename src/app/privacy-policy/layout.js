import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Политика обработки персональных данных | ServiceBox35',
  description: 'Политика обработки персональных данных сервисного центра ServiceBox35 в Вологде: какие данные собираются, для чего используются и как защищаются.',
  alternates: {
    canonical: `${BASE_URL}/privacy-policy`,
  },
  openGraph: {
    title: 'Политика обработки персональных данных — ServiceBox35',
    description: 'Политика обработки персональных данных сервисного центра ServiceBox35.',
    type: 'website',
    url: `${BASE_URL}/privacy-policy`,
    siteName: BUSINESS.shortName,
  },
};

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
