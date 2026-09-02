// src/lib/optfm/config.js
import OptfmSyncState from '../../models/OptfmSyncState.js';

// Лок считается брошенным, если прогон стартовал раньше этого срока.
// ДОЛЖЕН быть больше HARD_TIMEOUT_MS в scripts/sync-optfm.mjs (2ч) + запас —
// иначе реально идущий долгий прогон перехватят как «зависший» → параллельная
// синхронизация.
const STALE_LOCK_MS = 3 * 60 * 60 * 1000; // 3 часа

async function getOrCreateState() {
  let state = await OptfmSyncState.findOne();
  if (!state) {
    state = await OptfmSyncState.create({});
  }
  return state;
}

export async function getSyncState() {
  const state = await getOrCreateState();
  return state.toObject();
}

export async function getMarkupPercent() {
  const state = await getOrCreateState();
  return state.markupPercent;
}

export async function setMarkupPercent(markupPercent) {
  const state = await getOrCreateState();
  state.markupPercent = markupPercent;
  await state.save();
  return state.markupPercent;
}

/**
 * Блокировка от параллельного запуска — на случай, если кнопка
 * "Синхронизировать сейчас" нажата, пока идёт ночной cron. Возвращает
 * false, если синхронизация уже реально выполняется (вызывающий код
 * должен отказаться, а не ждать). Зависший лок (старше STALE_LOCK_MS)
 * перехватывается — иначе один упавший прогон навсегда блокировал бы всю
 * дальнейшую синхронизацию.
 *
 * Захват АТОМАРНЫЙ (findOneAndUpdate с условным фильтром): два почти
 * одновременных инициатора (cron + админская кнопка) на уже зависшем локе
 * не могут захватить его оба и запустить две параллельные синхронизации.
 */
export async function acquireSyncLock() {
  // Гарантируем существование единственного документа состояния.
  await getOrCreateState();

  const staleBefore = new Date(Date.now() - STALE_LOCK_MS);
  // upsert НЕ ставим: если документ есть, но фильтр не совпал (лок реально
  // держится и не просрочен) — вернётся null (не захватили). upsert создал
  // бы второй документ и «захватил» бы его.
  const doc = await OptfmSyncState.findOneAndUpdate(
    {
      $or: [
        { syncInProgress: { $ne: true } },
        { lastSyncStartedAt: { $lt: staleBefore } },
        { lastSyncStartedAt: null },
      ],
    },
    { $set: { syncInProgress: true, lastSyncStartedAt: new Date(), lastSyncError: null } },
    { new: true }
  );
  return Boolean(doc);
}

export async function releaseSyncLock(stats, error) {
  const state = await getOrCreateState();
  state.syncInProgress = false;
  state.lastSyncFinishedAt = new Date();
  if (error) {
    state.lastSyncError = error.message;
  } else {
    state.lastSyncError = undefined;
    state.lastSyncStats = stats;
  }
  await state.save();
}
