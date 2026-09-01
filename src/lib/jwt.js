// lib/jwt.js
// Единая точка работы с JWT приложения. Секрет читается один раз, все
// проверки — строго HS256. verifyToken никогда не бросает: при любой
// проблеме (нет секрета, плохая подпись, alg-подмена, истёк) → null
// (fail-closed).
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

/**
 * Подписать токен приложения (HS256).
 * @param {object} payload
 * @param {import('jsonwebtoken').SignOptions} [options]  переопределяет expiresIn и т.п.
 */
export function signToken(payload, options = {}) {
  return jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: '7d', ...options });
}

/**
 * Проверить токен. Возвращает payload или null. Никогда не бросает.
 * @param {string} token
 * @returns {object|null}
 */
export function verifyToken(token) {
  if (!token || !SECRET) return null;
  try {
    return jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
