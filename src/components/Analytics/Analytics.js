// components/Analytics/Analytics.js
'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import YandexMetrika from '../YandexMetrika/YandexMetrika';
// ⚠️ GTM удалён отсюда — он теперь размещён в layout.js

// Список ИИ-ботов для отслеживания (опционально, для аналитики)
const AI_BOTS = [
  'Google-Extended',
  'GPTBot',
  'CCBot',
  'Omgilibot',
  'FacebookBot',
  'YandexAccessibilityBot',
  'BingPreview',
  'Applebot-Extended',
  'Bytespider',
  'ImagesiftBot'
];

export default function Analytics() {
  const { hasConsent } = useCookieConsent();

  // Инициализация dataLayer для совместимости с тегами в GTM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Гарантируем, что dataLayer существует до любых событий
      window.dataLayer = window.dataLayer || [];

      // Проверка пользовательского агента на ИИ-ботов
      const userAgent = navigator.userAgent || '';
      const isAIBot = AI_BOTS.some(bot => userAgent.includes(bot));

      if (isAIBot) {
        // Логируем визит ИИ-бота для внутренней аналитики
        window.dataLayer.push({
          event: 'ai_bot_visit',
          bot: userAgent,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          referrer: document.referrer || null
        });
      }

      // Событие согласия на аналитику (если пользователь дал согласие)
      if (hasConsent('analytics')) {
        window.dataLayer.push({
          event: 'cookie_consent_given',
          consent: true,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [hasConsent]);

  // Не загружаем Яндекс.Метрику без согласия пользователя
  if (!hasConsent('analytics')) {
    return null;
  }

  return <YandexMetrika />;
}