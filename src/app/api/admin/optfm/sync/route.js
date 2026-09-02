// src/app/api/admin/optfm/sync/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { acquireSyncLock, releaseSyncLock } from '@/lib/optfm/config';
import { syncCategories } from '@/lib/optfm/syncCategories';
import { syncProducts } from '@/lib/optfm/syncProducts';

export async function POST(request) {
  await dbConnect();

  const denied = await requireAdmin(request);
  if (denied) return denied;

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
      // Карточки товаров кэшируются статически (ISR, revalidate=3600 в
      // product/[slug]/page.js) — без явной инвалидации цена на карточке
      // могла до часа отставать от только что синхронизированной.
      revalidatePath('/product/[slug]', 'page');
    } catch (err) {
      console.error('OPTFM manual sync error:', err);
      await releaseSyncLock(null, err);
    }
  })();

  return NextResponse.json({ success: true, message: 'Синхронизация запущена в фоне' });
}
