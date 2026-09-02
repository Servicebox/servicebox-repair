// src/app/api/admin/board-photos/[id]/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { requireAdminSession as requireAdmin } from '@/lib/authGuard';
import { isValidObjectId } from '@/lib/slugify';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR, DEVICE_TYPES } from '@/lib/boardPhotos';

export async function PATCH(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const patch = {};
  if (typeof body.title === 'string' && body.title.trim().length >= 3) patch.title = body.title.trim();
  if (typeof body.slug === 'string' && body.slug.trim()) patch.slug = body.slug.trim();
  if (typeof body.chip === 'string') patch.chip = body.chip.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (DEVICE_TYPES.includes(body.deviceType)) patch.deviceType = body.deviceType;
  if (typeof body.isActive === 'boolean') patch.isActive = body.isActive;

  await dbConnect();
  let doc;
  try {
    doc = await BoardPhoto.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось сохранить: ' + e.message }, { status: 400 });
  }
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  revalidatePath('/platy');
  revalidatePath(`/platy/${doc.slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json({
    success: true,
    boardPhoto: {
      _id: doc._id.toString(), slug: doc.slug, title: doc.title, deviceType: doc.deviceType,
      chip: doc.chip, description: doc.description, isActive: doc.isActive,
      imageWidth: doc.imageWidth, imageHeight: doc.imageHeight,
    },
  });
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });

  await dbConnect();
  const doc = await BoardPhoto.findById(id);
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  const slug = doc.slug;
  try {
    await unlink(path.join(BOARD_PHOTOS_DIR, doc.imageName));
  } catch (e) {
    console.warn('[board-photos] unlink:', e.message); // файла нет — не роняем
  }
  await doc.deleteOne();

  revalidatePath('/platy');
  revalidatePath(`/platy/${slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ success: true });
}
