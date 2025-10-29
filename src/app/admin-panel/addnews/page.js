// src/app/admin-panel/addnews/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewsEditor from '@/components/NewsEditor/NewsEditor';
import styles from '../News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function AddNewsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (newsData) => {
    setSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin-panel/listnews');
      } else {
        alert(data.error || 'Ошибка при создании новости');
      }
    } catch (error) {
      alert('Ошибка при создании новости');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Создание новости</h1>
        <button 
          onClick={() => router.push('/admin-panel/addnews')} 
          className={styles.backButton}
        >
          ← Назад к списку
        </button>
      </div>

      <NewsEditor 
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}