// src/app/news/[id]/page.js
import { notFound } from 'next/navigation';
import NewsDetail from '@/components/NewsDetail/NewsDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru'; // Убраны лишние пробелы

export async function generateMetadata({ params }) {
  // Деструктурируем id, дожидаясь значения params
  const { id } = await params;

  // Проверка id после await
  if (!id || id === 'undefined') {
    return {
      title: 'Новость не найдена - ServiceBox',
      description: 'Запрошенная новость не существует'
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/news/${id}`, {
      next: { revalidate: 60 } // Убедитесь, что API может обрабатывать этот revalidate
    });

    if (!response.ok) {
      return {
        title: 'Новость не найдена - ServiceBox',
        description: 'Запрошенная новость не существует'
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        title: 'Новость не найдена - ServiceBox',
        description: 'Запрошенная новость не существует'
      };
    }

    const news = data.data;

    return {
      title: news.metaTitle || `${news.title} - ServiceBox Вологда`,
      description: news.metaDescription || news.excerpt || 'Новость сервисного центра ServiceBox',
    };
  } catch (error) {
    console.error('Error generating meta', error);
    return {
      title: 'Ошибка - ServiceBox',
      description: 'Произошла ошибка при загрузке новости'
    };
  }
}

// Компонент страницы теперь асинхронный, получает params
export default async function NewsDetailPage({ params }) {
  // Деструктурируем id, дожидаясь значения params
  const { id } = await params;

  // Проверка id после await
  if (!id || id === 'undefined') {
    notFound();
  }

  // Передаем id как пропс в клиентский компонент
  return <NewsDetail newsId={id} />;
}