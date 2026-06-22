export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const YANDEX_TOKEN_URL = 'https://oauth.yandex.ru/token';
const YANDEX_INFO_URL = 'https://login.yandex.ru/info?format=json';

async function exchangeCode(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.YANDEX_CLIENT_ID,
    client_secret: process.env.YANDEX_CLIENT_SECRET,
    redirect_uri: process.env.YANDEX_REDIRECT_URI,
  });

  const res = await fetch(YANDEX_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Yandex token exchange failed');
  return res.json();
}

async function fetchYandexProfile(accessToken) {
  const res = await fetch(YANDEX_INFO_URL, {
    headers: { Authorization: `OAuth ${accessToken}` },
  });
  if (!res.ok) throw new Error('Yandex profile fetch failed');
  return res.json();
}

function issueJwt(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function setAuthCookie(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('yandex_oauth_state')?.value;

  // CSRF-проверка
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/auth/login?error=csrf', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
  }

  try {
    const { access_token } = await exchangeCode(code);
    const profile = await fetchYandexProfile(access_token);

    // profile: { id, login, real_name, first_name, last_name, default_email }
    const yandexId = String(profile.id);
    const email = profile.default_email ?? `${profile.login}@yandex.ru`;

    await dbConnect();

    // 1. Поиск по yandexId
    let user = await User.findOne({ yandexId });

    // 2. Привязка к существующему аккаунту по email
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.yandexId = yandexId;
        await user.save();
      }
    }

    // 3. Создание нового пользователя
    if (!user) {
      user = await User.create({
        yandexId,
        email: email.toLowerCase(),
        username: profile.login || profile.real_name || `user_${yandexId.slice(-6)}`,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        emailVerified: true,
        lastLogin: new Date(),
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = issueJwt(user);
    const response = NextResponse.redirect(new URL('/profile', request.url));
    setAuthCookie(response, token);

    // Удаляем CSRF-cookie
    response.cookies.set('yandex_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Yandex OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
  }
}
