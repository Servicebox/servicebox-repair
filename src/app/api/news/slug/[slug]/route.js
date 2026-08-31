// src/app/api/news/slug/[slug]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

// GET /api/news/slug/[slug] — публичный доступ по слагам
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Slug не указан' },
        { status: 400 }
      );
    }

    // Ищем только опубликованные новости
    const news = await News.findOne({
      slug: slug.toLowerCase(),
      isPublished: true
    }).lean();

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    // Увеличиваем счётчик просмотров (асинхронно, не блокируя ответ)
    News.findByIdAndUpdate(news._id, { $inc: { views: 1 } })
      .catch(err => console.error('Error incrementing views:', err));

    return NextResponse.json({
      success: true,
      data: {
        ...news,
        // Добавляем SEO-данные для удобства
        seo: news.getSeoData?.() || {
          title: news.metaTitle || `${news.title} | СЕРВИС БОКС Вологда`,
          description: news.metaDescription || news.excerpt,
          url: `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/news/${news.slug}`,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}