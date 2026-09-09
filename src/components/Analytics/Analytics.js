// components/Analytics/Analytics.js
'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import YandexMetrika from '../YandexMetrika/YandexMetrika';
import VisitBeacon from '../VisitBeacon/VisitBeacon';

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

const GTM_ID = 'GTM-WNT2RHZJ';

export default function Analytics() {
  const { hasConsent } = useCookieConsent();
  const analyticsAllowed = hasConsent('analytics');

  // dataLayer нужен всегда (наши reachGoal/ecommerce-события кладут в него
  // данные независимо от того, загрузился ли контейнер GTM).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];

    const userAgent = navigator.userAgent || '';
    if (AI_BOTS.some((bot) => userAgent.includes(bot))) {
      window.dataLayer.push({
        event: 'ai_bot_visit',
        bot: userAgent,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || null,
      });
    }

    if (analyticsAllowed) {
      window.dataLayer.push({
        event: 'cookie_consent_given',
        consent: true,
        timestamp: new Date().toISOString(),
      });
    }
  }, [analyticsAllowed]);

  return (
    <>
      {analyticsAllowed && (
        <>
          {/* Google Tag Manager — грузим только после согласия на
              аналитические cookie (контейнер может ставить cookie
              аналитических тегов). */}
          <Script
            id="gtm-loader"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
          {/* Яндекс.Метрика — сторонний обработчик, ставит cookie _ym_*. */}
          <YandexMetrika />
        </>
      )}
      {/* Собственный счётчик посещений: без cookie и без третьих лиц —
          случайный id в localStorage, на сервере только обезличенные
          агрегаты, данные никуда не передаются. Работает по умолчанию. */}
      <VisitBeacon />
    </>
  );
}
