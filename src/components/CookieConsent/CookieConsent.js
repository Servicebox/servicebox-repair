// components/CookieConsent/CookieConsent.js
'use client';
import { useState, useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const { consent, updateConsent, isLoading } = useCookieConsent();

  useEffect(() => {
    if (!isLoading && !consent?.date) {
      setIsVisible(true);
    }
  }, [isLoading, consent]);

  useEffect(() => {
    setAnalyticsChecked(!!consent?.analytics);
  }, [consent]);

  const acceptAll = () => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: false
    });
    setIsVisible(false);
  };

  const acceptSelected = () => {
    updateConsent({
      necessary: true,
      analytics: analyticsChecked,
      marketing: false,
      preferences: false
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

  if (isLoading) return null;

  return (
    <div
      className={`${styles.cookieOverlay}${isVisible ? ' ' + styles.visible : ''}`}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-modal="true"
    >
      <div className={styles.cookieBanner}>
        <div className={styles.cookieHeader}>
          <h3 id="cookie-title" className={styles.cookieTitle}>
            🍪 Использование файлов cookie
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={acceptNecessary}
            aria-label="Принять только необходимые и закрыть"
          >
            &times;
          </button>
        </div>

        <div className={styles.cookieContent}>
          <p className={styles.cookieText}>
            Мы используем файлы cookie для обеспечения работы сайта, аналитики
            и улучшения пользовательского опыта. Вы можете настроить свои
            предпочтения или принять все.
          </p>

          {showDetails && (
            <div className={styles.cookieDetails}>
              <div className={styles.cookieTypes}>
                {/* Necessary — always on */}
                <div className={styles.cookieType}>
                  <div className={styles.typeHeader}>
                    <div className={styles.typeInfo}>
                      <h5>Необходимые</h5>
                      <span className={styles.typeStatus}>Всегда активны</span>
                    </div>
                    <label className={styles.switch}>
                      <input type="checkbox" checked disabled />
                      <span className={styles.slider} />
                    </label>
                  </div>
                  <p className={styles.typeDescription}>
                    Обязательные для работы сайта. Хранят сессию и состояние авторизации
                    (token, yandex_oauth_state).
                  </p>
                </div>

                {/* Analytics — toggleable */}
                <div className={styles.cookieType}>
                  <div className={styles.typeHeader}>
                    <div className={styles.typeInfo}>
                      <h5>Аналитические</h5>
                      <span className={styles.typeStatus}>
                        {analyticsChecked ? 'Включены' : 'Отключены'}
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={analyticsChecked}
                        onChange={(e) => setAnalyticsChecked(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                  <p className={styles.typeDescription}>
                    Помогают анализировать анонимный трафик и улучшать сайт.
                    Не передают личные данные.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.cookieActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowDetails(v => !v)}
              aria-expanded={showDetails}
            >
              {showDetails ? 'Скрыть настройки' : 'Настроить'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={showDetails ? acceptSelected : acceptNecessary}
            >
              Только необходимые
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={acceptAll}
            >
              Принять все
            </button>
          </div>
        </div>

        <div className={styles.cookieFooter}>
          <div className={styles.cookieLinks}>
            <a href="/privacy-policy" className={styles.policyLink}>
              Политика конфиденциальности
            </a>
            <a href="/cookie-policy" className={styles.policyLink}>
              Политика cookie
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
