export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.YANDEX_CLIENT_ID,
    redirect_uri: process.env.YANDEX_REDIRECT_URI,
    state,
  });

  const response = NextResponse.redirect(
    `https://oauth.yandex.ru/authorize?${params.toString()}`
  );

  // Храним state в httpOnly cookie для CSRF-проверки в callback
  response.cookies.set('yandex_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 минут
    path: '/',
  });

  return response;
}
