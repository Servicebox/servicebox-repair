'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewsEditor from '@/components/NewsEditor/NewsEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function NewsEditPage() {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await fetch(`${API_URL}/api/news/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setNewsItem(data.data);
        } else {
          throw new Error('Новость не найдена');
        }
      } catch (error) {
        console.error('Error fetching news item:', error);
        alert('Новость не найдена');
        router.push('/news');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNewsItem();
    }
  }, [params.id, router]);

  const handleSave = async (newsData) => {
    // ... аналогично предыдущему примеру
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Редактирование новости</h1>
      <NewsEditor 
        onSave={handleSave}
        initialData={newsItem}
      />
    </div>
  );
}