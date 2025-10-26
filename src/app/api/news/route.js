///app/api/news/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

export async function GET() {
  try {
    await dbConnect();
    
    const news = await News.find({})
      .select('title slug excerpt featuredImage isPublished publishedAt createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке новостей' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const newsData = await request.json();

    // Валидация
    if (!newsData.title || !newsData.contentBlocks) {
      return NextResponse.json(
        { success: false, error: 'Заголовок и контент обязательны' },
        { status: 400 }
      );
    }

    // Создаем новость
    const news = await News.create(newsData);

    return NextResponse.json({
      success: true,
      data: news
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

    return NextResponse.json(
      { success: false, error: 'Ошибка при создании новости' },
      { status: 500 }
    );
  }
}