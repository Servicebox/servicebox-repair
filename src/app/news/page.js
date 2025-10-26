import NewsList from '../../components/NewsList/NewsList';

export const metadata = {
  title: 'Новости - ServiceBox Вологда',
  description: 'Свежие новости и события сервисного центра ServiceBox в Вологде. Акции, обновления и полезная информация.',
};

export default function NewsPage() {
  return <NewsList />;
}