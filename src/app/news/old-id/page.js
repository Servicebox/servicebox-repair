// src/app/news/[id]/page.js
import { notFound } from 'next/navigation';
import NewsDetail from '@/components/NewsDetail/NewsDetail';
// src/app/news/[id]/page.js (СТАРАЯ СТРАНИЦА — для редиректа)
import { redirect } from 'next/navigation';

export default async function OldNewsRedirect({ params }) {
  const { id } = await params;
  
  // Если это ObjectId (24 hex-символа), ищем новость и редиректим на слаг
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`);
      const data = await response.json();
      
      if (data.success && data.data?.slug) {
        // Редирект 301 на новую ссылку
        redirect(`/news/${data.data.slug}`);
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  }
  
  // Если не удалось найти — 404
  return <div>Новость не найдена</div>;
}