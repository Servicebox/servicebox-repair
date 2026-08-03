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
  } catch (error) {
    console.error('❌ Синхронизация OPTFM упала:', error);
    await releaseSyncLock(null, error);
    process.exitCode = 1;
  }
}

main();
