// src/app/admin/news/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewsEditor from '@/components/NewsEditor/NewsEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function NewsEditPage() {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        // ✅ ФИКС: Проверка ID
        const id = params?.id;
        if (!id || id === 'undefined') {
          throw new Error('ID новости не указан');
        }

        const response = await fetch(`${API_URL}/api/news/${id}`);
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

    if (params?.id) {
      fetchNewsItem();
    }
  }, [params, router]);

  const handleSave = async (newsData) => {
    try {
      const response = await fetch(`${API_URL}/api/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Новость успешно обновлена');
        router.push('/admin/news');
      } else {
        alert(data.error || 'Ошибка при обновлении новости');
      }
    } catch (error) {
      alert('Ошибка при обновлении новости');
    }
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