// scripts/sync-optfm.mjs
//
// Ежедневная синхронизация каталога поставщика OPTFM (Fashion Mobile).
// Запускается системным cron на проде — см.
// docs/superpowers/specs/2026-08-03-optfm-supplier-integration-design.md
//
// Использование (в том числе для ручной проверки):
//   node scripts/sync-optfm.mjs
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env.production', import.meta.url).pathname });

import dbConnect from '../src/lib/db.js';
import { syncCategories } from '../src/lib/optfm/syncCategories.js';
import { syncProducts } from '../src/lib/optfm/syncProducts.js';
import { acquireSyncLock, releaseSyncLock } from '../src/lib/optfm/config.js';

async function main() {
  await dbConnect();

  const acquired = await acquireSyncLock();
  if (!acquired) {
    console.log('⏭️  Синхронизация OPTFM уже выполняется — пропускаю этот запуск');
    return;
  }

  try {
    console.log('▶️  Синхронизация категорий OPTFM...');
    const categoriesResult = await syncCategories();
    console.log(`✅ Категории: ${categoriesResult.categoriesUpserted} обработано`);

    console.log('▶️  Синхронизация товаров OPTFM...');
    const productsResult = await syncProducts();
    console.log(
      `✅ Товары: ${productsResult.productsUpserted} обработано, ` +
        `${productsResult.productsDeactivated} деактивировано (пропали у поставщика), ` +
        `${productsResult.imagesDownloaded} новых фото скачано`
    );

    await releaseSyncLock({ ...categoriesResult, ...productsResult });
    console.log('🎉 Синхронизация OPTFM завершена успешно');

    // Скрипт — отдельный от Next.js процесс, revalidatePath отсюда не
    // вызвать напрямую, поэтому дёргаем внутренний роут по HTTP (см.
    // src/app/api/internal/revalidate-products/route.js).
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
      const res = await fetch(`${baseUrl}/api/internal/revalidate-products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPTFM_REVALIDATE_SECRET || ''}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log('🔄 Кэш карточек товаров инвалидирован');
    } catch (err) {
      console.warn('⚠️  Не удалось инвалидировать кэш карточек товаров:', err.message);
    }
  } catch (error) {
    console.error('❌ Синхронизация OPTFM упала:', error);
    await releaseSyncLock(null, error);
    process.exitCode = 1;
  }
}

main();
