// lib/authGuard.js
// Единый гейт «только для администратора» для мутирующих эндпоинтов
// (загрузка/изменение/удаление файлов депозитария, категорий, галереи).
// Возвращает готовый Response 401 при отказе, либо null если доступ разрешён.
//
// Использование в обработчике:
//   const denied = await requireAdmin(request);
//   if (denied) return denied;
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Требуются права администратора' },
      { status: 401 }
    );
  }
  return null;
}
