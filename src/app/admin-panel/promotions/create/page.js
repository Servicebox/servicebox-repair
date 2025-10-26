'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PromotionForm from '@/components/PromotionForm/PromotionForm';
import styles from '../../../admin-panel/News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function CreatePromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (promotionData) => {
    setSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/api/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin-panel/promotions');
      } else {
        alert(data.error || 'Ошибка при создании акции');
      }
    } catch (error) {
      alert('Ошибка при создании акции');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Создание акции</h1>
        <button 
          onClick={() => router.push('/admin-panel/promotions')} 
          className={styles.backButton}
        >
          ← Назад к списку
        </button>
      </div>

      <PromotionForm 
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}