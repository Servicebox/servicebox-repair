import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Публичная оферта | ServiceBox35',
  description: 'Публичная оферта сервисного центра ServiceBox35 в Вологде: условия оказания услуг по ремонту техники и дистанционной продажи запчастей.',
  alternates: {
    canonical: `${BASE_URL}/oferta`,
  },
  openGraph: {
    title: 'Публичная оферта — ServiceBox35',
    description: 'Публичная оферта сервисного центра ServiceBox35.',
    type: 'website',
    url: `${BASE_URL}/oferta`,
    siteName: BUSINESS.shortName,
  },
};

export default function OfertaLayout({ children }) {
  return children;
}
