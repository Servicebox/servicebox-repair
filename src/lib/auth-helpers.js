import { verifyToken as verifyJwt } from '@/lib/jwt';

/**
 * Извлекает и верифицирует JWT из cookie 'token'.
 * Подпись проверяется строго HS256 (через @/lib/jwt, fail-closed).
 * Возвращает { id, email, role } или null при отсутствии/невалидности токена.
 *
 * ВНИМАНИЕ: role здесь берётся из claim'а токена, а не из БД. Для
 * админских мутаций используйте requireAdmin из @/lib/authGuard
 * (getServerSession → роль из БД).
 */
export function verifyToken(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const decoded = verifyJwt(token);
  if (!decoded) return null;

  // Совместимость: токен может содержать id или userId
  return {
    id: decoded.id ?? decoded.userId,
    email: decoded.email,
    role: decoded.role ?? 'user',
  };
}
