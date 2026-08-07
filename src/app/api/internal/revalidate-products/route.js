export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { revalidatePath } from 'next/cache';

function validateApiKey(request) {
  const envKey = process.env.OPTFM_REVALIDATE_SECRET;
  if (!envKey) return false;

  const auth = request.headers.get('authorization') ?? '';
  const key = auth.replace('Bearer ', '').trim();
  if (!key) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(envKey));
  } catch {
    return false;
  }
}

// Дёргается после синхронизации OPTFM (из админ-роута и из cron-скрипта
// scripts/sync-optfm.mjs, который не может импортировать next/cache
// напрямую — он вне процесса Next.js). Без этого карточки товаров
// (ISR, revalidate=3600 в product/[slug]/page.js) до часа показывали
// цену на момент последней сборки/предыдущего визита, а листинг /parts
// (читает БД напрямую) — уже новую. См. баг 2026-08-07.
export async function POST(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/product/[slug]', 'page');

  return NextResponse.json({ revalidated: true });
}
