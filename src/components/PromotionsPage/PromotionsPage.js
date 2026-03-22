// components/PromotionsPage/PromotionsPage.js

'use client';
import { useState, useEffect } from 'react';
import styles from './PromotionsPage.module.css';
import FormWithoutOverlay from '../FormWithoutOverlay/FormWithoutOverlay';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      console.log('Fetching promotions...');
      const response = await fetch('/api/promotions');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
        
      if (result.success) {
        setPromotions(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch promotions');
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Функция для открытия формы записи
  const openForm = (promotion = null) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
    setSubmitSuccess(false);
    // Блокируем скролл body при открытии формы
    document.body.style.overflow = 'hidden';
  };

  // Функция для закрытия формы записи
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedPromotion(null);
    setSubmitSuccess(false);
    // Восстанавливаем скролл body
    document.body.style.overflow = 'unset';
  };

  // Обработка нажатия ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.keyCode === 27 && isFormOpen) {
        closeForm();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFormOpen]);

  // Функция обработки сохранения формы
  const handleSave = async (formData) => {
    setSaving(true);
    console.log('Данные формы для сохранения:', formData);
    console.log('Выбранная акция:', selectedPromotion);
    
    try {
      // Здесь может быть ваша логика сохранения
      // Например, отправка данных на сервер
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Показываем сообщение об успехе
      setSubmitSuccess(true);
      
      // Закрываем форму через 1 секунду
      setTimeout(() => {
        closeForm();
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Произошла ошибка при отправке данных');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isPromotionActive = (endDate) => {
    return new Date(endDate) >= new Date();
  };

  if (loading) {
    return (
      <div className={styles.promotionsPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Загрузка акций...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.promotionsPage}>
        <div className={styles.errorContainer}>
          <h2>Произошла ошибка</h2>
          <p>{error}</p>
          <button onClick={fetchPromotions} className={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.promotionsPage}>
      <header className={styles.promotionsHeader}>
        <h1 className={styles.animatedTitle}>Актуальные акции</h1>
        <p className={styles.promotionsSubtitle}>
          Специальные предложения и скидки для наших клиентов
        </p>
      </header>

      {promotions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎁</div>
          <h2>Акций пока нет</h2>
          <p>Следите за обновлениями, скоро здесь появятся специальные предложения!</p>
        </div>
      ) : (
        <div className={styles.promoList}>
          {promotions.map((promo) => (
            <div 
              className={`${styles.promotionCard} ${!isPromotionActive(promo.endDate) ? styles.expired : ''}`} 
              key={promo._id}
            >
              {promo.image && (
                <div className={styles.promotionImageContainer}>
                  <img 
                    className={styles.promoImage} 
                    src={promo.image.startsWith('/') ? promo.image : `/uploads/promotions/${promo.image}`}
                    alt={promo.title}
                    loading="lazy"
                  />
                  {!isPromotionActive(promo.endDate) && (
                    <div className={styles.expiredBadge}>Завершена</div>
                  )}
                </div>
              )}
              
              <div className={styles.promotionContent}>
                <h2 className={styles.promotionTitle}>{promo.title}</h2>
                <p className={styles.promotionDescription}>{promo.description}</p>
                
                <div className={styles.promotionMeta}>
                  <div className={styles.promotionDate}>
                    {isPromotionActive(promo.endDate) ? (
                      <span>Действует до: <strong>{formatDate(promo.endDate)}</strong></span>
                    ) : (
                      <span>Завершилась: <strong>{formatDate(promo.endDate)}</strong></span>
                    )}
                  </div>
                  
                  {isPromotionActive(promo.endDate) && (
                    <button 
                      className={styles.ctaButton}
                      onClick={() => openForm(promo)}
                    >
                      Записаться
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно формы */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeForm}>
              ×
            </button>
            <FormWithoutOverlay 
              close={closeForm}
              onSave={handleSave}
              saving={saving}
              promotion={selectedPromotion}
              submitSuccess={submitSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}