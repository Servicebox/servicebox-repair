// src/app/api/admin/board-photos/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { generateUniqueSlug } from '@/lib/slugify';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR, DEVICE_TYPES } from '@/lib/boardPhotos';

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function POST(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Ожидается multipart/form-data' }, { status: 400 });
  }

  const file = form.get('image');
  const title = (form.get('title') || '').toString().trim();
  const deviceTypeRaw = (form.get('deviceType') || 'other').toString();
  const deviceType = DEVICE_TYPES.includes(deviceTypeRaw) ? deviceTypeRaw : 'other';
  const chip = (form.get('chip') || '').toString().trim();
  const description = (form.get('description') || '').toString().trim();

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Допустимы JPEG, PNG или WebP' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файл больше 15 МБ' }, { status: 400 });
  }
  if (title.length < 3) {
    return NextResponse.json({ error: 'Название платы — минимум 3 символа' }, { status: 400 });
  }

  let webp, info;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const out = await sharp(buf)
      .rotate() // применить EXIF-ориентацию
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    webp = out.data;
    info = out.info; // info.width / info.height — реальные размеры результата
  } catch (e) {
    console.error('[board-photos] sharp:', e.message);
    return NextResponse.json({ error: 'Не удалось обработать изображение' }, { status: 400 });
  }

  await dbConnect();
  const slug = await generateUniqueSlug(BoardPhoto, title);
  const imageName = `${randomUUID()}.webp`;

  await mkdir(BOARD_PHOTOS_DIR, { recursive: true });
  await writeFile(path.join(BOARD_PHOTOS_DIR, imageName), webp);

  const doc = await BoardPhoto.create({
    title, slug, deviceType, chip, description,
    imageName, imageWidth: info.width, imageHeight: info.height,
  });

  revalidatePath('/platy');

  return NextResponse.json({
    success: true,
    boardPhoto: {
      _id: doc._id.toString(), slug: doc.slug, title: doc.title,
      deviceType: doc.deviceType, chip: doc.chip, description: doc.description,
      imageName: doc.imageName, imageWidth: doc.imageWidth, imageHeight: doc.imageHeight,
      isActive: doc.isActive,
    },
  }, { status: 201 });
}
