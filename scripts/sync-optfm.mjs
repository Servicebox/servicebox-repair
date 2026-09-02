// scripts/sync-optfm.mjs
//
// Ежедневная синхронизация каталога поставщика OPTFM (Fashion Mobile).
// Запускается системным cron на проде — см.
// docs/superpowers/specs/2026-08-03-optfm-supplier-integration-design.md
//
// Использование (в том числе для ручной проверки):
//   node scripts/sync-optfm.mjs
//
// ВАЖНО: скрипт ОБЯЗАН завершаться (mongoose держит соединение и event loop
// открытым — без явного disconnect+exit процесс висел бы вечно; так за
// август накопилось ~44 процесса-зомби). Плюс watchdog на случай, если
// syncProducts зависнет намертво (WAF поставщика / сеть).
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env.production', import.meta.url).pathname, quiet: true });

import dbConnect from '../src/lib/db.js';
import { syncCategories } from '../src/lib/optfm/syncCategories.js';
import { syncProducts } from '../src/lib/optfm/syncProducts.js';
import { acquireSyncLock, releaseSyncLock } from '../src/lib/optfm/config.js';

const HARD_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 часа

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
    console.error('❌ Синхронизация OPTFM упала:', error?.message || error);
    await releaseSyncLock(null, error);
    process.exitCode = 1;
  }
}

// Watchdog: если прогон завис — принудительно выходим. Лок останется
// syncInProgress=true, но acquireSyncLock перехватит его как «зависший»
// через STALE_LOCK_MS (3ч). Best-effort снимаем флаг перед выходом.
const watchdog = setTimeout(async () => {
  console.error('❌ OPTFM sync: превышен таймаут 2ч — принудительный выход');
  try {
    await Promise.race([
      releaseSyncLock(null, new Error('watchdog timeout')),
      new Promise((r) => setTimeout(r, 10_000)),
    ]);
  } catch {}
  process.exit(1);
}, HARD_TIMEOUT_MS);
watchdog.unref();

main()
  .catch((error) => {
    console.error('❌ OPTFM sync fatal:', error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Жёсткий предохранитель: даже если mongoose.disconnect() зависнет
    // (полуоткрытый сокет к БД) — процесс всё равно выйдет.
    const hardExit = setTimeout(() => process.exit(process.exitCode || 0), 15_000);
    hardExit.unref();

    try {
      await Promise.race([
        mongoose.disconnect(),
        new Promise((resolve) => setTimeout(resolve, 10_000)),
      ]);
    } catch {
      /* ignore */
    }

    clearTimeout(watchdog);
    clearTimeout(hardExit);
    process.exit(process.exitCode || 0);
  });
