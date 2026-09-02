// lib/authTokens.js
// Одноразовые токены подтверждения email и сброса пароля.
//
// В БД хранится ТОЛЬКО SHA-256 хеш токена. Пользователю (в письме/ссылке)
// уходит сырой токен. При проверке входящий токен хешируется и ищется по
// хешу. Утечка/бэкап базы не даёт рабочих токенов.
import crypto from 'crypto';

/** Криптостойкий сырой токен (64 hex-символа). */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 хеш токена (то, что кладём в БД и по чему ищем). */
export function hashToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}
