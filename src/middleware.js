// middleware.js
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request) {
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

  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};