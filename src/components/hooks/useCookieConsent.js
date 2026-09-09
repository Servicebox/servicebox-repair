// hooks/useCookieConsent.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем согласие из localStorage
  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem('cookieConsent');
      if (savedConsent) {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
      } else {
        // По умолчанию - только необходимые
        setConsent({
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
          date: null
        });
      }
    } catch (error) {
      console.error('Error loading cookie consent:', error);
      setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        date: null
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для обновления согласия
  const updateConsent = useCallback((newConsent) => {
    try {
      const consentWithDate = {
        ...newConsent,
        date: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('cookieConsent', JSON.stringify(consentWithDate));
      setConsent(consentWithDate);
      
      // Отправляем событие об обновлении
      window.dispatchEvent(new CustomEvent('cookieConsentChange', {
        detail: consentWithDate
      }));
      
      // Если аналитика отключена, очищаем куки Google Analytics и Яндекс.Метрики
      if (!newConsent.analytics) {
        const expired = 'expires=Thu, 01 Jan 1970 00:00:01 GMT';
        for (const name of [
          '_ga', '_gid', '_gat',
          '_ym_uid', '_ym_d', '_ym_isad', '_ym_visorc', '_ym_hostIndex',
        ]) {
          document.cookie = `${name}=; path=/; ${expired};`;
          // Метрика ставит часть кук на корневой домен — чистим и его.
          document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; ${expired};`;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      return false;
    }
  }, []);

  // Проверка наличия согласия для категории
  const hasConsent = useCallback((category) => {
    if (!consent) return false;
    if (category === 'necessary') return true; // Необходимые всегда разрешены
    
    return consent[category] === true;
  }, [consent]);

  // Получение текущего согласия
  const getConsent = useCallback(() => consent, [consent]);

  return {
    consent,
    isLoading,
    hasConsent,
    updateConsent,
    getConsent
  };
}