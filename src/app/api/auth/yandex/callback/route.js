export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

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
  // tv обязателен: без него getServerSession (сверяет tv с tokenVersion в БД)
  // навсегда отвергнет токен OAuth-пользователя после первого же bump'а
  // (logout / правка админом). У OAuth-юзера нет пароля для восстановления.
  return signToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    tv: user.tokenVersion ?? 0,
  });
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
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('yandex_oauth_state')?.value;

  // CSRF-проверка
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${BASE}/auth/login?error=csrf`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE}/auth/login?error=no_code`);
  }

  try {
    const { access_token } = await exchangeCode(code);
    const profile = await fetchYandexProfile(access_token);

    // profile: { id, login, real_name, first_name, last_name, default_email }
    const yandexId = String(profile.id);
    const email = profile.default_email ?? `${profile.login}@yandex.ru`;

    await dbConnect();

    // 1. Поиск по yandexId (tokenVersion нужен для tv в токене — select: false)
    let user = await User.findOne({ yandexId }).select('+tokenVersion');

    // 2. Привязка к существующему аккаунту по email. Yandex подтвердил
    //    владение адресом → помечаем email как подтверждённый.
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+tokenVersion');
      if (user) {
        user.yandexId = yandexId;
        user.emailVerified = true;
        await user.save({ validateModifiedOnly: true });
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
      await user.save({ validateModifiedOnly: true });
    }

    const token = issueJwt(user);
    const response = NextResponse.redirect(`${BASE}/profile`);
    setAuthCookie(response, token);

    // Удаляем CSRF-cookie
    response.cookies.set('yandex_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Yandex OAuth callback error:', error);
    return NextResponse.redirect(`${BASE}/auth/login?error=oauth_failed`);
  }
}
