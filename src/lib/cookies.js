// lib/cookies.js
// Единственное место разбора cookie-заголовка вручную. Раньше одинаковый
// парсинг был скопирован в middleware.js и session.js и мог разъехаться.

/**
 * Значение cookie по имени.
 * Работает и с NextRequest (есть .cookies.get), и с обычным Request
 * (парсим заголовок Cookie вручную).
 * @param {Request} request
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(request, name) {
  // NextRequest / любой объект с .cookies.get
  const viaApi = request?.cookies?.get?.(name);
  if (viaApi && typeof viaApi.value === 'string') return viaApi.value;
  if (typeof viaApi === 'string') return viaApi;

  const header = request?.headers?.get?.('cookie');
  if (!header) return null;

  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    const raw = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

/** Токен сессии из cookie `token`. */
export function getTokenCookie(request) {
  return getCookie(request, 'token');
}
