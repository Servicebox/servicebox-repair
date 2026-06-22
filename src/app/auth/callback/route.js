export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// Yandex registers the callback at /auth/callback.
// Forward to the actual OAuth handler preserving all query params.
export async function GET(request) {
  const { search } = new URL(request.url);
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';
  return NextResponse.redirect(`${BASE}/api/auth/yandex/callback${search}`);
}
