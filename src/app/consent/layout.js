import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Согласие на обработку персональных данных | ServiceBox35',
  description: 'Согласие на обработку персональных данных пользователей сайта ServiceBox35, сервисного центра по ремонту техники в Вологде.',
  alternates: {
    canonical: `${BASE_URL}/consent`,
  },
  openGraph: {
    title: 'Согласие на обработку персональных данных — ServiceBox35',
    description: 'Согласие на обработку персональных данных пользователей сайта ServiceBox35.',
    type: 'website',
    url: `${BASE_URL}/consent`,
    siteName: BUSINESS.shortName,
  },
};

export default function ConsentLayout({ children }) {
  return children;
}
