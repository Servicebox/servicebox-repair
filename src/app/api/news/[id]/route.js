// src/app/api/news/[id]/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { isValidObjectId } from '@/lib/slugify';
import { requireAdmin } from '@/lib/authGuard';
import { pickNewsFields } from '@/lib/newsFields';

// См. src/app/api/news/route.js — тот же баг со статическим кэшированием
// GET-хендлера; здесь особенно заметен в админке при повторном открытии
// только что отредактированной новости.
export const dynamic = 'force-dynamic';

// GET /api/news/[id] — получение новости по ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
        { status: 400 }
      );
    }

    const news = await News.findById(id).lean();

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT /api/news/[id] — обновление новости (только админ)
export async function PUT(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    const { id } = await params;
    // Только поля из белого списка — защита от mass-assignment.
    const updateData = pickNewsFields(await request.json());

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
        { status: 400 }
      );
    }

    // Очистка обновляемых данных
    const cleanUpdate = {
      ...updateData,
      title: updateData.title?.trim(),
      excerpt: updateData.excerpt?.trim(),
      metaTitle: updateData.metaTitle?.trim(),
      metaDescription: updateData.metaDescription?.trim(),
      keywords: Array.isArray(updateData.keywords) 
        ? updateData.keywords.map(k => k.trim()).filter(Boolean) 
        : undefined,
    };

    // Если меняем заголовок и slug не задан явно — перегенерируем
    if (cleanUpdate.title && !cleanUpdate.slug) {
      const { generateUniqueSlug } = await import('@/lib/slugify');
      cleanUpdate.slug = await generateUniqueSlug(News, cleanUpdate.title, id);
    }

    const news = await News.findByIdAndUpdate(
      id,
      { $set: cleanUpdate },
      { new: true, runValidators: true, context: 'query' }
    ).lean();

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error updating news:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Новость с таким слагом уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении новости' },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[id] — удаление новости (только админ)
export async function DELETE(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
        { status: 400 }
      );
    }

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Новость успешно удалена',
      data: { id: news._id, slug: news.slug }
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении новости' },
      { status: 500 }
    );
  }
}