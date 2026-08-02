// src/app/api/news/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

// Без этого Next.js помечает GET-хендлер статическим (searchParams читаются
// через new URL(request.url), а не request.nextUrl, что не триггерит
// автодетект динамического рендеринга) и отдаёт ответ с
// Cache-Control: s-maxage=10 — список новостей на главной и на /news
// после редактирования в админке до 40 секунд показывал старые данные
// (например, старое фото). См. баг 2026-08-02.
export const dynamic = 'force-dynamic';

// GET /api/news — список новостей
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const fields = searchParams.get('fields')?.split(',') || null;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    
    // Базовый запрос: только опубликованные (если не админ)
    const query = all ? {} : { isPublished: true };
    
    // Выбор полей для оптимизации
    const selectFields = fields ? fields.join(' ') : 'title slug excerpt featuredImage isPublished publishedAt createdAt metaTitle metaDescription';
    
    const news = await News.find(query)
      .select(selectFields)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await News.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching news list:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке новостей' },
      { status: 500 }
    );
  }
}

// POST /api/news — создание новости (только админ)
export async function POST(request) {
  try {
    await dbConnect();
    const newsData = await request.json();

    // Валидация
    if (!newsData.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Заголовок обязателен' },
        { status: 400 }
      );
    }
    
    if (!newsData.contentBlocks?.length) {
      return NextResponse.json(
        { success: false, error: 'Контент новости не может быть пустым' },
        { status: 400 }
      );
    }

    // Очистка данных
    const cleanData = {
      ...newsData,
      title: newsData.title.trim(),
      excerpt: newsData.excerpt?.trim(),
      metaTitle: newsData.metaTitle?.trim(),
      metaDescription: newsData.metaDescription?.trim(),
      keywords: Array.isArray(newsData.keywords) 
        ? newsData.keywords.map(k => k.trim()).filter(Boolean) 
        : [],
    };

    // Создание новости (slug сгенерируется автоматически)
    const news = await News.create(cleanData);

    return NextResponse.json({
      success: true,
      message: 'Новость успешно создана',
       news
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating news:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) { // Duplicate key error
      return NextResponse.json(
        { success: false, error: 'Новость с таким слагом уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при создании новости' },
      { status: 500 }
    );
  }
}