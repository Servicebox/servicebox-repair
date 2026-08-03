// src/app/api/admin/optfm/sync/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import { acquireSyncLock, releaseSyncLock } from '@/lib/optfm/config';
import { syncCategories } from '@/lib/optfm/syncCategories';
import { syncProducts } from '@/lib/optfm/syncProducts';

export async function POST(request) {
  await dbConnect();

  const user = verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });

  const acquired = await acquireSyncLock();
  if (!acquired) {
    return NextResponse.json({ error: 'Синхронизация уже выполняется' }, { status: 409 });
  }

  // Не ждём завершения внутри запроса — полная синхронизация может занять
  // больше часа из-за скачивания фото (превышает таймаут nginx 300с и
  // таймаут браузера). Статус смотрится через GET /api/admin/optfm/config.
  (async () => {
    try {
      const categoriesResult = await syncCategories();
      const productsResult = await syncProducts();
      await releaseSyncLock({ ...categoriesResult, ...productsResult });
    } catch (err) {
      console.error('OPTFM manual sync error:', err);
      await releaseSyncLock(null, err);
    }
  })();

  return NextResponse.json({ success: true, message: 'Синхронизация запущена в фоне' });
}
