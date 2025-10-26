'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewsEditor from '@/components/NewsEditor/NewsEditor';
import styles from '../../News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        if (!params.id) {
          setError('ID новости не указан');
          setLoading(false);
          return;
        }

        console.log('Fetching news with ID:', params.id);
        
        const response = await fetch(`${API_URL}/api/news/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('News data loaded:', data.data);
          setNewsItem(data.data);
        } else {
          throw new Error(data.error || 'Новость не найдена');
        }
      } catch (error) {
        console.error('Error fetching news item:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [params.id]);

  const handleSave = async (newsData) => {
    setSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/api/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        router.push('/admin-panel/listnews');
      } else {
        throw new Error(data.error || 'Ошибка при обновлении новости');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert(`Ошибка при обновлении новости: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/admin-panel/listnews');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка новости...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className={styles.backButton}
          >
            ← Вернуться к списку новостей
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Редактирование новости</h1>
        <button 
          onClick={handleBack}
          className={styles.backButton}
        >
          ← Назад к списку
        </button>
      </div>

      {newsItem && (
        <NewsEditor 
          onSave={handleSave}
          saving={saving}
          initialData={newsItem}
        />
      )}
    </div>
  );
}