export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// Yandex registers the callback at /auth/callback.
// Forward to the actual OAuth handler preserving all query params.
export async function GET(request) {
  const { search } = new URL(request.url);
  const target = new URL(`/api/auth/yandex/callback${search}`, request.url);
  return NextResponse.redirect(target);
}
