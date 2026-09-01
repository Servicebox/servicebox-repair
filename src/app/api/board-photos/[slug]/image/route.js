// src/app/api/board-photos/[slug]/image/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR } from '@/lib/boardPhotos';

export async function GET(request, { params }) {
  const { slug } = await params;
  await dbConnect();
  const doc = await BoardPhoto.findOne({ slug, isActive: true }, 'imageName').lean();
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  let bytes;
  try {
    bytes = await readFile(path.join(BOARD_PHOTOS_DIR, doc.imageName));
  } catch {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
  }

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(bytes.length),
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
