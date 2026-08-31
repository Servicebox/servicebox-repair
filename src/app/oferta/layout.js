import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Публичная оферта | СЕРВИС БОКС',
  description: 'Публичная оферта сервисного центра СЕРВИС БОКС в Вологде: условия оказания услуг по ремонту техники и дистанционной продажи запчастей.',
  alternates: {
    canonical: `${BASE_URL}/oferta`,
  },
  openGraph: {
    title: 'Публичная оферта — СЕРВИС БОКС',
    description: 'Публичная оферта сервисного центра СЕРВИС БОКС.',
    type: 'website',
    url: `${BASE_URL}/oferta`,
    siteName: BUSINESS.shortName,
  },
};

export default function OfertaLayout({ children }) {
  return children;
}
