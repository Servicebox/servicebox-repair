// components/Analytics/Analytics.jsx
'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import Script from 'next/script';

export default function Analytics() {
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    if (hasConsent('analytics')) {
      // Инициализация Яндекс.Метрики
      if (window.ym) {
        window.ym(97888825, 'init', {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true
        });
      }

      // Инициализация Google Analytics
      if (window.gtag) {
        window.gtag('config', 'G-MZ24DLXSSM', {
          page_title: document.title,
          page_location: window.location.href
        });
      }
    }
  }, [hasConsent]);

  if (!hasConsent('analytics')) {
    return null;
  }

  return (
    <>
      {/* Яндекс.Метрика */}
      <Script
        strategy="afterInteractive"
        src="https://mc.yandex.ru/metrika/tag.js"
        onLoad={() => {
          if (window.ym) {
            window.ym(97888825, 'init', {
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true
            });
          }
        }}
      />
      
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-MZ24DLXSSM"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MZ24DLXSSM', {
              page_title: document.title,
              page_location: window.location.href
            });
          `,
        }}
      />
    </>
  );
}