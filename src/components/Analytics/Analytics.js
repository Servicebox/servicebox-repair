// components/Analytics/Analytics.js
'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import YandexMetrika from '../YandexMetrika/YandexMetrika';
import VisitBeacon from '../VisitBeacon/VisitBeacon';
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
  const { consent, hasConsent } = useCookieConsent();

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

  // Явный отказ пользователя («Только необходимые» или выключенный тумблер
  // аналитики) — не грузим ничего. Признак явного выбора — проставленная
  // consent.date (по умолчанию, до выбора, она null).
  const explicitlyDeclined = Boolean(consent && consent.date && consent.analytics === false);
  if (explicitlyDeclined) {
    return null;
  }

  // По умолчанию (посетитель ещё ничего не выбрал) и при согласии — грузим
  // обезличенную аналитику первой стороны: счётчик Метрики, цели и наш
  // beacon посещений. Вебвизор (запись действий пользователя) включаем
  // только при явном согласии на аналитику.
  return (
    <>
      <YandexMetrika webvisor={hasConsent('analytics')} />
      <VisitBeacon />
    </>
  );
}