import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Согласие на обработку персональных данных | СЕРВИС БОКС',
  description: 'Согласие на обработку персональных данных пользователей сайта СЕРВИС БОКС, сервисного центра по ремонту техники в Вологде.',
  alternates: {
    canonical: `${BASE_URL}/consent`,
  },
  openGraph: {
    title: 'Согласие на обработку персональных данных — СЕРВИС БОКС',
    description: 'Согласие на обработку персональных данных пользователей сайта СЕРВИС БОКС.',
    type: 'website',
    url: `${BASE_URL}/consent`,
    siteName: BUSINESS.shortName,
  },
};

export default function ConsentLayout({ children }) {
  return children;
}
