// src/app/api/admin/optfm/config/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import { getSyncState, setMarkupPercent } from '@/lib/optfm/config';

function requireAdmin(request) {
  const user = verifyToken(request);
  if (!user) return { error: NextResponse.json({ error: 'Не авторизован' }, { status: 401 }) };
  if (user.role !== 'admin') return { error: NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 }) };
  return { user };
}

export async function GET(request) {
  await dbConnect();

  const { error } = requireAdmin(request);
  if (error) return error;

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

  const { error } = requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  const markupPercent = Number(body.markupPercent);

  if (!Number.isFinite(markupPercent) || markupPercent < 0) {
    return NextResponse.json({ error: 'Наценка должна быть неотрицательным числом' }, { status: 400 });
  }

  const saved = await setMarkupPercent(markupPercent);
  return NextResponse.json({ markupPercent: saved });
}
