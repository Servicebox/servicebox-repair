export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import User from '@/models/User';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Укажите текущий пароль'),
  newPassword: z.string().min(6, 'Новый пароль — минимум 6 символов')
});

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// PATCH /api/user/profile
// Content-Type: multipart/form-data  → обновление аватара
// Content-Type: application/json     → смена пароля
export async function PATCH(request) {
  await dbConnect();

  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    return handleAvatarUpload(request, user.id);
  }

  return handlePasswordChange(request, user.id);
}

async function handleAvatarUpload(request, userId) {
  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Файл не передан (поле: avatar)' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_SIZE) {
    return NextResponse.json({ error: 'Файл слишком большой (макс 5 МБ)' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Допускаются только JPEG, PNG, WebP' }, { status: 400 });
  }

  const optimized = await sharp(buffer)
    .resize(400, 400, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 82 })
    .toBuffer();

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
  await mkdir(uploadDir, { recursive: true });

  const filename = `${userId}-${Date.now()}.jpg`;
  await writeFile(join(uploadDir, filename), optimized);

  const avatarUrl = `/uploads/avatars/${filename}`;

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { avatar: avatarUrl, avatarUrl } },
    { new: true }
  ).select('-password -verificationToken -resetPasswordToken');

  return NextResponse.json({ message: 'Аватар обновлён', avatarUrl, user: updated });
}

async function handlePasswordChange(request, userId) {
  let body;
  try {
    body = passwordSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const dbUser = await User.findById(userId).select('password');
  if (!dbUser) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(body.currentPassword, dbUser.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
  }

  // Хэширование через pre-save hook модели User
  dbUser.password = body.newPassword;
  await dbUser.save();

  return NextResponse.json({ message: 'Пароль успешно изменён' });
}
