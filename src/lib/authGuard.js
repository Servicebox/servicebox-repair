// lib/authGuard.js
// Единый гейт «только для администратора» для мутирующих эндпоинтов
// (депозитарий, категории, галерея, новости, пользователи, optfm).
// Возвращает готовый Response при отказе, либо null если доступ разрешён.
//
// Использование в обработчике:
//   const denied = await requireAdmin(request);
//   if (denied) return denied;
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { BASE_URL } from '@/lib/constants';

const SITE_HOST = (() => {
  try {
    return new URL(BASE_URL).host;
  } catch {
    return 'servicebox35.ru';
  }
})();

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Проверка Origin для изменяющих запросов (защита от CSRF в дополнение
 * к cookie sameSite=lax). Если заголовок Origin присутствует и его хост
 * не совпадает с хостом сайта — отказ. Отсутствие Origin не блокируем:
 * такой запрос не может быть кросс-сайтовым из браузера, а sameSite=lax
 * уже отсекает подделку POST со стороннего сайта.
 */
export function assertSameOrigin(request) {
  if (!MUTATING.has(request.method)) return null;

  const origin = request.headers.get('origin');
  if (!origin) return null;

  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: 'Некорректный Origin' }, { status: 403 });
  }

  const selfHost = request.headers.get('host');
  if (originHost === SITE_HOST || (selfHost && originHost === selfHost)) {
    return null;
  }
  return NextResponse.json({ error: 'Межсайтовый запрос отклонён' }, { status: 403 });
}

export async function requireAdmin(request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const session = await getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Требуется вход в аккаунт' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 403 });
  }
  return null;
}

/**
 * Вариант для роутов, которым нужен сам объект сессии.
 * Возвращает session при доступе администратора, либо null при отказе
 * (нет сессии / не админ / межсайтовый мутирующий запрос).
 * Роль берётся из БД (getServerSession), не из claim'а токена.
 *
 *   const session = await requireAdminSession(request);
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function requireAdminSession(request) {
  if (assertSameOrigin(request)) return null;
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}
