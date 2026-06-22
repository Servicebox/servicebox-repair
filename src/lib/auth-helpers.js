import jwt from 'jsonwebtoken';

/**
 * Извлекает и верифицирует JWT из cookie 'token'.
 * Возвращает { id, email, role } или null при отсутствии/невалидности токена.
 */
export function verifyToken(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Совместимость: токен может содержать id или userId
    return {
      id: decoded.id ?? decoded.userId,
      email: decoded.email,
      role: decoded.role ?? 'user'
    };
  } catch {
    return null;
  }
}
