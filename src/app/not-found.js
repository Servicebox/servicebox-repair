// app/not-found.js
import NotFoundContent from '@/components/NotFound/NotFoundContent';

export const metadata = {
  title: 'Страница не найдена (404) | СЕРВИС БОКС Вологда',
  description: 'Запрошенная страница не найдена или была удалена. Перейдите на главную СЕРВИС БОКС, чтобы найти нужный раздел, товар или услугу.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function NotFound() {
  return <NotFoundContent />;
}
