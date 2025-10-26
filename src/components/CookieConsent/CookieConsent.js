// components/CookieConsent/CookieConsent.jsx
'use client';
import { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже принято согласие
    const consentGiven = document.cookie.includes('cookieConsent=true');
    
    if (!consentGiven) {
      // Ждем 2 секунды перед показом
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    // Устанавливаем куки на 1 год
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `cookieConsent=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.cookieConsent}>
      <div className={styles.cookieContent}>
        <p>
          Мы используем файлы cookie для улучшения работы сайта. 
          Продолжая использовать сайт, вы соглашаетесь с этим.
        </p>
        <button 
          className={styles.acceptButton}
          onClick={acceptCookies}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}