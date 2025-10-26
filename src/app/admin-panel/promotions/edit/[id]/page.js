'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PromotionForm from '@/components/PromotionForm/PromotionForm';
import styles from '../../../../admin-panel/News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function EditPromotionPage() {
  const params = useParams();
  const router = useRouter();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        if (!params.id) {
          setError('ID акции не указан');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/promotions/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setPromotion(data.data);
        } else {
          throw new Error(data.error || 'Акция не найдена');
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [params.id]);

  const handleSave = async (promotionData) => {
    setSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/api/promotions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        router.push('/admin-panel/promotions');
      } else {
        throw new Error(data.error || 'Ошибка при обновлении акции');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert(`Ошибка при обновлении акции: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка акции...</div>
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
            onClick={() => router.push('/admin-panel/promotions')}
            className={styles.backButton}
          >
            ← Вернуться к списку акций
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Редактирование акции</h1>
        <button 
          onClick={() => router.push('/admin-panel/promotions')}
          className={styles.backButton}
        >
          ← Назад к списку
        </button>
      </div>

      {promotion && (
        <PromotionForm 
          onSave={handleSave}
          saving={saving}
          initialData={promotion}
        />
      )}
    </div>
  );
}