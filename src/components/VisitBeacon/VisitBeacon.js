'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Отправляет один beacon на /api/analytics/visits при каждой смене
// маршрута. Кук не ставит; анонимный id посетителя держит в localStorage
// (не PII). Любая ошибка молча игнорируется — на UX не влияет.

function detectDevice() {
  const ua = navigator.userAgent || '';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser() {
  const ua = navigator.userAgent || '';
  if (/YaBrowser/i.test(ua)) return 'Yandex';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua)) return 'Safari';
  return 'unknown';
}

function getVisitorId() {
  try {
    let id = localStorage.getItem('sb_vid');
    if (!id) {
      id = 'v' + Math.random().toString(36).slice(2, 14);
      localStorage.setItem('sb_vid', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export default function VisitBeacon() {
  const pathname = usePathname();
  const lastSent = useRef(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    let payload;
    try {
      payload = JSON.stringify({
        page: pathname,
        referrer: document.referrer || undefined,
        device: detectDevice(),
        browser: detectBrowser(),
        visitorId: getVisitorId(),
      });
    } catch {
      return;
    }

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/visits',
          new Blob([payload], { type: 'application/json' })
        );
      } else {
        fetch('/api/analytics/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* beacon не критичен */
    }
  }, [pathname]);

  return null;
}
