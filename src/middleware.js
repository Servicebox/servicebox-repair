// middleware.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // ==========================================================
  // 🚨 SEO-КРИТИЧНО: ОЧИСТКА ОТ РЕКЛАМНЫХ ПАРАМЕТРОВ (?erid)
  // ==========================================================
  // Это ДОЛЖНО быть ПЕРЕД всеми остальными проверками!
  // Если в URL есть ?erid=... - делаем 301 редирект на чистый URL
  const unwantedParams = ['erid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'];

  let hasUnwantedParam = false;
  unwantedParams.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasUnwantedParam = true;
    }
  });

  if (hasUnwantedParam) {
    // 301 редирект (постоянный) - поисковик запомнит чистый URL
    return NextResponse.redirect(url, 301);
  }

  // ==========================================================
  // 1. ПРОВЕРКА АУТЕНТИФИКАЦИИ ДЛЯ АДМИНКИ (ваша существующая логика)
  // ==========================================================
  if (pathname.startsWith('/api/admin/')) {
    const cookieHeader = request.headers.get('cookie');
    let token = null;

    if (cookieHeader) {
      const cookies = {};
      cookieHeader.split(';').forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=');
        cookies[name] = decodeURIComponent(valueParts.join('='));
      });
      token = cookies['token'];
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  const response = NextResponse.next();

  // ==========================================================
  // 2. ОПТИМИЗАЦИЯ КЭШИРОВАНИЯ (ваша логика + улучшения)
  // ==========================================================
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);

  // Статические ресурсы
  if (pathname.match(/\.(js|css|woff2|woff|eot|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Изображения
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$/)) {
    response.headers.set(
      'Cache-Control',
      isMobile
        ? 'public, max-age=2592000, stale-while-revalidate=86400'
        : 'public, max-age=604800, stale-while-revalidate=86400'
    );
  }

  // API кэширование
  if (pathname.startsWith('/api/') && !pathname.includes('/api/auth/') && !pathname.startsWith('/api/admin/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
  }

  // ==========================================================
  // 3. SEO: КАНОНИЧЕСКИЕ ЗАГОЛОВКИ (новое!)
  // ==========================================================
  // Говорим поисковикам, что текущий URL - канонический
  // Это страхует от дублей, даже если что-то пройдёт через middleware
  const canonicalUrl = `${request.nextUrl.origin}${pathname}`;
  response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);

  // ==========================================================
  // 4. МОБИЛЬНАЯ ОПТИМИЗАЦИЯ
  // ==========================================================
  if (isMobile) {
    response.headers.set('Vary', 'User-Agent, Accept-Encoding');
  }

  // ==========================================================
  // 5. ЗАГОЛОВКИ БЕЗОПАСНОСТИ
  // ==========================================================
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Защита от индексации приватных страниц
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*).*)',
  ],
};