// src/app/admin-panel/promotions/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../admin-panel/News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function PromotionsAdmin() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/promotions`);
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data);
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при загрузке акций', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту акцию?')) return;

    try {
      const response = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setPromotions(promotions.filter(item => item._id !== id));
        showAlert('Акция успешно удалена', 'success');
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при удалении акции', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });
      const data = await response.json();

      if (data.success) {
        setPromotions(promotions.map(item => 
          item._id === id ? data.data : item
        ));
        showAlert(
          currentStatus ? 'Акция деактивирована' : 'Акция активирована',
          'success'
        );
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при обновлении акции', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const isPromotionActive = (promotion) => {
    return promotion.isActive && new Date(promotion.endDate) > new Date();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка акций...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление акциями</h1>
        <Link href="/admin-panel/promotions/create" className={styles.createButton}>
          + Создать акцию
        </Link>
      </div>

      {alert && (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      )}

      <div className={styles.newsList}>
        {promotions.length > 0 ? (
          promotions.map(promo => (
            <div key={promo._id} className={styles.newsItem}>
              <div className={styles.newsContent}>
                <div className={styles.itemHeader}>
                  <h3>{promo.title}</h3>
                  <div className={styles.statusBadges}>
                    <span className={`${styles.status} ${isPromotionActive(promo) ? styles.published : styles.draft}`}>
                      {isPromotionActive(promo) ? 'Активна' : 'Неактивна'}
                    </span>
                    {new Date(promo.endDate) < new Date() && (
                      <span className={`${styles.status} ${styles.expired}`}>
                        Истекла
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={styles.meta}>
                  <span className={styles.date}>
                    Создана: {new Date(promo.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span className={styles.date}>
                    Действует до: {new Date(promo.endDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {promo.shortDescription && (
                  <p className={styles.excerpt}>{promo.shortDescription}</p>
                )}

                {promo.image && (
                  <div className={styles.imagePreview}>
                    <img src={promo.image} alt={promo.title} />
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => toggleActive(promo._id, promo.isActive)}
                  className={`${styles.button} ${promo.isActive ? styles.unpublish : styles.publish}`}
                >
                  {promo.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                
                <Link
                  href={`/admin-panel/promotions/edit/${promo._id}`}
                  className={`${styles.button} ${styles.edit}`}
                >
                  Редактировать
                </Link>
                
                <button
                  onClick={() => handleDelete(promo._id)}
                  className={`${styles.button} ${styles.delete}`}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p>Акций пока нет</p>
            <Link href="/admin-panel/promotions/create" className={styles.createButton}>
              Создать первую акцию
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}