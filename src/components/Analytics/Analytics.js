// components/Analytics/Analytics.jsx
'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import Script from 'next/script';

// Константы для метрик
const YANDEX_ID = 97888825;
const GA_ID = 'G-MZ24DLXSSM';
const GTM_ID = 'GTM-WNT2RHZJ';

export default function Analytics() {
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    if (!hasConsent('analytics')) return;

    // Отправляем событие, что аналитика загружена
    if (window.dataLayer) {
      window.dataLayer.push({ 
        event: 'analytics_loaded',
        consent_given: true,
        timestamp: new Date().toISOString()
      });
    }

    // Дополнительная инициализация после загрузки скриптов
    const handleYandexLoad = () => {
      if (window.ym && !window.ym.initialized) {
        window.ym(YANDEX_ID, 'init', {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
          ecommerce: 'dataLayer',
          trackHash: true
        });
        window.ym.initialized = true;
      }
    };

    // Проверяем, если Яндекс Метрика уже загружена
    if (window.ym && !window.ym.initialized) {
      handleYandexLoad();
    }

    // Добавляем обработчик для последующей загрузки
    window.addEventListener('yandex_metrika_loaded', handleYandexLoad);

    return () => {
      window.removeEventListener('yandex_metrika_loaded', handleYandexLoad);
    };
  }, [hasConsent]);

  if (!hasConsent('analytics')) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - основной */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      
      {/* Google Analytics (резервный канал) */}
      <Script
        id="ga-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              transport_type: 'beacon'
            });
            
            // Резервная отправка данных
            (function() {
              var s = document.createElement('script');
              s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
              s.async = true;
              document.head.appendChild(s);
            })();
          `,
        }}
      />
      
      {/* Яндекс.Метрика */}
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        onLoad={() => {
          // Инициализируем Яндекс Метрику после загрузки
          window.dispatchEvent(new Event('yandex_metrika_loaded'));
        }}
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          `,
        }}
      />
      
      {/* NoScript версии */}
      <noscript>
        {/* Google Tag Manager */}
        <iframe 
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0" 
          width="0" 
          style={{display:'none', visibility:'hidden'}}
        />
        
        {/* Яндекс.Метрика */}
        <div>
          <img 
            src={`https://mc.yandex.ru/watch/${YANDEX_ID}`} 
            style={{position:'absolute', left:'-9999px'}} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
}