// src/app/api/admin/optfm/config/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { getSyncState, setMarkupPercent } from '@/lib/optfm/config';

export async function GET(request) {
  await dbConnect();

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const state = await getSyncState();
  return NextResponse.json({
    markupPercent: state.markupPercent,
    syncInProgress: state.syncInProgress,
    lastSyncStartedAt: state.lastSyncStartedAt,
    lastSyncFinishedAt: state.lastSyncFinishedAt,
    lastSyncError: state.lastSyncError,
    lastSyncStats: state.lastSyncStats,
  });
}

export async function POST(request) {
  await dbConnect();

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json();
  const markupPercent = Number(body.markupPercent);

  if (!Number.isFinite(markupPercent) || markupPercent < 0) {
    return NextResponse.json({ error: 'Наценка должна быть неотрицательным числом' }, { status: 400 });
  }

  const saved = await setMarkupPercent(markupPercent);
  return NextResponse.json({ markupPercent: saved });
}
