// app/api/users/avatar/upload/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'Файл не загружен' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Проверка размера (5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Файл слишком большой (макс 5MB)' }, { status: 400 });
    }

    // Оптимизация изображения через Sharp
    const optimized = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Создание пути для сохранения
    const uploadDir = join(process.cwd(), 'public/uploads/avatars');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${decoded.id}-${Date.now()}.jpg`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, optimized);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // Обновление пользователя
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Аватар загружен',
      avatarUrl,
      user
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
