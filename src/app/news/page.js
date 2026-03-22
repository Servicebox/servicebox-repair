import NewsList from '../../components/NewsList/NewsList';

export const metadata = {
  title: 'Новости - Сервис Бокс Вологда',
  description: 'Свежие новости и события сервисного центра Сервис Бокс в Вологде. Акции, обновления и полезная информация.',
};

export default function NewsPage() {
  return <NewsList />;
}