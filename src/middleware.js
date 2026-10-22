// middleware.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getTokenCookie } from '@/lib/cookies';
import { BASE_URL } from '@/lib/constants';

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
    // 301 редирект (постоянный) - поисковик запомнит чистый URL.
    // Строим абсолютный URL от BASE_URL, а не от url.origin (который на
    // этом кастомном Node-сервере резолвится в localhost:3000, см. коммент
    // ниже про canonicalUrl) — раньше это молча "чинилось" директивой
    // proxy_redirect в nginx, переписывающей Location; если её когда-нибудь
    // уберут/поменяют, реальные посетители по рекламным ссылкам улетят на
    // localhost.
    return NextResponse.redirect(new URL(`${url.pathname}${url.search}`, BASE_URL), 301);
  }

  // ==========================================================
  // 1. ПРОВЕРКА АУТЕНТИФИКАЦИИ ДЛЯ АДМИНКИ (ваша существующая логика)
  // ==========================================================
  if (pathname.startsWith('/api/admin/')) {
    const token = getTokenCookie(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Первый слой: подпись + роль из claim. Авторитетная проверка роли —
    // в самих роутах через getServerSession (роль из БД). Здесь — быстрый
    // отсев: неадмин не должен даже доходить до обработчика /api/admin/*.
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
  // /api/news исключён: до 40 секунд (s-maxage + stale-while-revalidate)
  // старые данные из списка новостей отдавались публичным страницам сразу
  // после правки в редакторе (например, замены фото) — см. баг 2026-08-02.
  // /api/board-photos/*/image сам ставит immutable-кэш на год — не перетираем
  if (
    pathname.startsWith('/api/') &&
    !pathname.includes('/api/auth/') &&
    !pathname.startsWith('/api/admin/') &&
    !pathname.startsWith('/api/news') &&
    !pathname.startsWith('/api/board-photos')
  ) {
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
  }

  // ==========================================================
  // 3. SEO: КАНОНИЧЕСКИЕ ЗАГОЛОВКИ (новое!)
  // ==========================================================
  // Говорим поисковикам, что текущий URL - канонический
  // Это страхует от дублей, даже если что-то пройдёт через middleware.
  // ВАЖНО: используем фиксированный BASE_URL, а не request.nextUrl.origin —
  // на кастомном Node-сервере (src/server.js, http.createServer + Next
  // request handler, не next start) origin в middleware резолвится в
  // http://localhost:3000 на каждом запросе, а не только для кэша — nginx
  // это скрывал только для 3xx-редиректов через свою автоматическую
  // директиву proxy_redirect (переписывает Location), но не трогает
  // произвольные заголовки вроде Link. Точный механизм в самом Next.js
  // не выяснен до конца — фиксированный BASE_URL просто убирает
  // зависимость от него. См. баг 2026-08-24: canonical отдавался как
  // https://localhost:3000/.
  const canonicalUrl = `${BASE_URL}${pathname}`;
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
  // X-XSS-Protection НЕ ставим: заголовок устарел, в старых браузерах его
  // «фильтр» сам был источником XSS/утечек. Современная защита — CSP.
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // HSTS: 2 года + поддомены. helmet на Express-слое ставит короче (180 дней)
  // — здесь перекрываем более строгим значением. Без `preload`: включение в
  // preload-список браузеров необратимо на месяцы и требует аудита всех
  // поддоменов (webmail, панели и т.п.) на предмет HTTPS — отдельное
  // операционное решение.
  // CSP report-only (ТОЛЬКО здесь — не дублировать в next.config.mjs: раньше
  // два независимых источника одного и того же заголовка CSP уже
  // расходились и браузер применял пересечение худших вариантов, см.
  // комментарий в next.config.mjs). Пока только Trusted Types
  // (require-trusted-types-for) — default-политика зарегистрирована в
  // layout.js, пропускающая, не санитайзер.
  //
  // script-src на nonce + 'strict-dynamic' НЕ делаем: пробовали 2026-10-23 —
  // единственный способ прокинуть nonce серверным компонентам в App Router
  // это headers() в RootLayout, а это снимает ЛЮБУЮ страницу, использующую
  // этот layout (то есть почти весь сайт), со статической генерации —
  // независимый аудит подтвердил сборкой: 62 маршрута (включая главную,
  // /services/*, /price) ушли из ○ (static)/ISR в ƒ (полностью динамические).
  // Плюс на уже статических/ISR-страницах (product/[slug], news/[slug] и
  // т.п.) nonce из headers() просто не читается на билде — там он всегда
  // undefined, и реальный nonce в заголовке ответа не совпадает ни с чем,
  // то есть включать enforce с таким nonce нельзя, пока не найден способ
  // не ломать статику (например Partial Prerendering, когда стабилизируется).
  response.headers.set(
    'Content-Security-Policy-Report-Only',
    [
      "require-trusted-types-for 'script'",
      'trusted-types default',
    ].join('; ')
  );

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains'
  );

  // Защита от индексации приватных страниц
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*).*)',
  ],
};