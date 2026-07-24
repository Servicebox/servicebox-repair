'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

// Отправляет hit при навигации между страницами (SPA-переходы).
// Хит за самую первую загрузку страницы уже отправляет initScript (onload
// ниже) — пропускаем первый прогон эффекта, иначе первый визит на сайт
// считается дважды и портит статистику по просмотрам/отказам в Метрике.
function MetrikaPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof window === 'undefined' || !window.ym || !METRIKA_ID) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    window.ym(Number(METRIKA_ID), 'hit', url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Компонент Яндекс.Метрики для Next.js App Router.
 * Использует переменную NEXT_PUBLIC_YANDEX_METRIKA_ID.
 * Подключается в app/layout.js внутри тега <body>.
 * Рендерится только на клиенте — SSR-безопасен (next/script + 'afterInteractive').
 */
export default function YandexMetrika() {
  if (!METRIKA_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[YandexMetrika] NEXT_PUBLIC_YANDEX_METRIKA_ID не задан');
    }
    return null;
  }

  const initScript = `
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t);a=e.getElementsByTagName(t)[0];
      k.async=1;k.src=r;
      k.onload=function(){
        ym(${METRIKA_ID},'init',{
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true,
          ecommerce:'dataLayer',
          trackHash:true,
          ut:'noindex'
        });
        ym(${METRIKA_ID},'hit',window.location.pathname+window.location.search,{
          params:{
            title:document.title,
            referrer:document.referrer||null
          }
        });
      };
      a.parentNode.insertBefore(k,a);
    })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
  `;

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: initScript }}
      />
      <MetrikaPageTracker />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
            width="1"
            height="1"
          />
        </div>
      </noscript>
    </>
  );
}
