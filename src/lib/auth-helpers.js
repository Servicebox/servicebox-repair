export const runtime = 'nodejs';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken as verifyJwt } from '@/lib/jwt';

/**
 * Извлекает и проверяет сессию по cookie 'token'.
 * - подпись строго HS256 (через @/lib/jwt, fail-closed);
 * - пользователь берётся из БД: role/email всегда актуальные, не из claim'а;
 * - проверяется tokenVersion (реальная инвалидация ранее выданных токенов);
 * - заблокированный аккаунт (isActive: false) → null.
 *
 * Возвращает { id, email, role } или null.
 *
 * ВНИМАНИЕ: функция АСИНХРОННАЯ — вызывать только с await.
 */
export async function verifyToken(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const decoded = verifyJwt(token);
  if (!decoded) return null;

  const userId = decoded.id ?? decoded.userId;
  if (!userId) return null;

  try {
    await dbConnect();
    const user = await User.findById(userId).select('email role isActive +tokenVersion');
    if (!user || user.isActive === false) return null;
    if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) return null;

    return { id: user._id.toString(), email: user.email, role: user.role ?? 'user' };
  } catch {
    return null;
  }
}
