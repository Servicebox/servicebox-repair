// src/lib/optfm/config.js
import OptfmSyncState from '../../models/OptfmSyncState.js';

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
 * Простая блокировка от параллельного запуска — на случай, если кнопка
 * "Синхронизировать сейчас" нажата, пока идёт ночной cron. Возвращает
 * false, если синхронизация уже выполняется (вызывающий код должен
 * отказаться от повторного запуска, а не ждать).
 */
export async function acquireSyncLock() {
  const state = await getOrCreateState();
  if (state.syncInProgress) {
    return false;
  }
  state.syncInProgress = true;
  state.lastSyncStartedAt = new Date();
  state.lastSyncError = undefined;
  await state.save();
  return true;
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
