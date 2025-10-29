// src/app/news/[id]/page.js
import { notFound } from 'next/navigation';
import NewsDetail from '@/components/NewsDetail/NewsDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateMetadata({ params }) {
  try {
    const id = params?.id;
    
    if (!id || id === 'undefined') {
      return {
        title: 'Новость не найдена - ServiceBox',
        description: 'Запрошенная новость не существует'
      };
    }

    // ✅ ФИКС: Исправлен URL (было "ruapi", теперь "ru/api")
    const response = await fetch(`${API_URL}/api/news/${id}`, {
      next: { revalidate: 60 }
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
    console.error('Error generating metadata:', error);
    return {
      title: 'Ошибка - ServiceBox',
      description: 'Произошла ошибка при загрузке новости'
    };
  }
}

export default function NewsDetailPage({ params }) {
  const id = params?.id;
  
  if (!id || id === 'undefined') {
    notFound();
  }
  
  return <NewsDetail />;
}