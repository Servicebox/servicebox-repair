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
    return NextResponse.redirect(`${BASE}/loginsignup?error=csrf`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE}/loginsignup?error=no_code`);
  }

  try {
    const { access_token } = await exchangeCode(code);
    const profile = await fetchYandexProfile(access_token);

    // profile: { id, login, real_name, first_name, last_name, default_email }
    const yandexId = String(profile.id);
    // НЕ синтезируем `${login}@yandex.ru`: это непроверённое предположение об
    // адресе (может пересечься с чужим аккаунтом / «занять» чужой email).
    // Если Яндекс не отдал default_email — значит в OAuth-приложении не
    // выдан scope login:email; логиниться в таком виде нельзя.
    const email = typeof profile.default_email === 'string'
      ? profile.default_email.toLowerCase().trim()
      : '';
    if (!email) {
      return NextResponse.redirect(`${BASE}/loginsignup?error=no_email`);
    }

    await dbConnect();

    // 1. Поиск по yandexId (tokenVersion нужен для tv в токене — select: false)
    // tokenVersion — select:false, запрашиваем явно; isActive в выборке по
    // умолчанию (не select:false).
    let user =
      (await User.findOne({ yandexId }).select('+tokenVersion')) ||
      (await User.findOne({ email }).select('+tokenVersion'));

    // Заблокированный аккаунт не должен ни получить сессию, ни быть
    // тронутым (линковка/lastLogin) через OAuth. Проверяем ДО мутаций.
    if (user && user.isActive === false) {
      return NextResponse.redirect(`${BASE}/loginsignup?error=account_disabled`);
    }

    if (user) {
      // 2. Привязка к существующему аккаунту. Yandex подтвердил владение
      //    адресом → помечаем email как подтверждённый.
      if (user.yandexId !== yandexId || !user.emailVerified) {
        user.yandexId = yandexId;
        user.emailVerified = true;
      }
      user.lastLogin = new Date();
      await user.save({ validateModifiedOnly: true });
    } else {
      // 3. Создание нового пользователя (новый — всегда isActive: true).
      user = await User.create({
        yandexId,
        email,
        username: profile.login || profile.real_name || `user_${yandexId.slice(-6)}`,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        emailVerified: true,
        lastLogin: new Date(),
      });
    }

    const token = issueJwt(user);
    const response = NextResponse.redirect(`${BASE}/profile`);
    setAuthCookie(response, token);

    // Удаляем CSRF-cookie
    response.cookies.set('yandex_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Yandex OAuth callback error:', error);
    return NextResponse.redirect(`${BASE}/loginsignup?error=oauth_failed`);
  }
}
