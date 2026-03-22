// components/CookieConsent/CookieConsent.jsx
'use client';
import { useState, useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { consent, updateConsent, isLoading } = useCookieConsent();

  useEffect(() => {
    if (!isLoading && !consent?.date) {
      // Показываем с задержкой для лучшего UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, consent]);

  const acceptAll = () => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: false
    });
    setIsVisible(false);
  };

  const acceptSelected = (categories) => {
    updateConsent({
      necessary: true,
      analytics: categories.includes('analytics'),
      marketing: categories.includes('marketing'),
      preferences: categories.includes('preferences')
    });
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    setIsVisible(false);
  };

  if (isLoading || !isVisible) return null;

  return (
    <div className={styles.cookieConsent} role="dialog" aria-labelledby="cookie-title">
      <div className={styles.cookieContent}>
        <h3 id="cookie-title" className={styles.cookieTitle}>
          🍪 Использование файлов cookie
        </h3>
        
        <p className={styles.cookieDescription}>
          Мы используем файлы cookie для обеспечения работы сайта, аналитики и улучшения пользовательского опыта. 
          Вы можете настроить свои предпочтения или принять все.
        </p>
        
        {showDetails && (
          <div className={styles.cookieCategories}>
            <div className={styles.cookieCategory}>
              <div className={styles.categoryHeader}>
                <input 
                  type="checkbox" 
                  id="necessary" 
                  checked 
                  disabled
                  className={styles.categoryCheckbox}
                />
                <label htmlFor="necessary" className={styles.categoryLabel}>
                  <strong>Необходимые</strong>
                  <span>Обязательные для работы сайта</span>
                </label>
              </div>
            </div>
            
            <div className={styles.cookieCategory}>
              <div className={styles.categoryHeader}>
                <input 
                  type="checkbox" 
                  id="analytics" 
                  defaultChecked={consent?.analytics}
                  className={styles.categoryCheckbox}
                  onChange={(e) => {
                    if (e.target.checked) {
                      acceptSelected(['analytics']);
                    }
                  }}
                />
                <label htmlFor="analytics" className={styles.categoryLabel}>
                  <strong>Аналитические</strong>
                  <span>Помогают анализировать использование сайта</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className={styles.cookieActions}>
          <button 
            type="button"
            className={styles.detailsButton}
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Скрыть настройки' : 'Настроить'}
          </button>
          
          <div className={styles.mainActions}>
            <button 
              type="button"
              className={styles.necessaryButton}
              onClick={acceptNecessary}
            >
              Только необходимые
            </button>
            
            <button 
              type="button"
              className={styles.acceptButton}
              onClick={acceptAll}
            >
              Принять все
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}