// middleware.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // 1. ПРОВЕРКА АУТЕНТИФИКАЦИИ ДЛЯ АДМИНКИ (ваша существующая логика)
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
  
  // 2. ОПТИМИЗАЦИЯ КЭШИРОВАНИЯ (новые улучшения)
  // Обнаружение мобильных устройств
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);
  
  // Кэширование статических ресурсов
  if (pathname.match(/\.(js|css|woff2|woff|eot|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Кэширование изображений с разными стратегиями для мобильных
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$/)) {
    response.headers.set(
      'Cache-Control',
      isMobile 
        ? 'public, max-age=2592000, stale-while-revalidate=86400' // 30 дней для мобильных
        : 'public, max-age=604800, stale-while-revalidate=86400'  // 7 дней для десктопов
    );
  }
  
  // Кэширование для API (кроме динамических данных и админки)
  if (pathname.startsWith('/api/') && !pathname.includes('/api/auth/') && !pathname.startsWith('/api/admin/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
  }
  
  // 3. ОПТИМИЗАЦИЯ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
  if (isMobile) {
    response.headers.set('Vary', 'User-Agent, Accept-Encoding');
  }
  
  // 4. ЗАГОЛОВКИ БЕЗОПАСНОСТИ (добавляются ко всем ответам)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    // Ваш текущий matcher + расширение для статических файлов и API
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*).*)',
  ],
};