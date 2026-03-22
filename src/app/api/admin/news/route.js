import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

export async function POST(request) {
  try {
    await dbConnect();
    const newsData = await request.json();

    // Валидация
    if (!newsData.title || !newsData.contentBlocks) {
      return NextResponse.json({ success: false, error: 'Заголовок и контент обязательны' }, { status: 400 });
    }

    // Создание новости
    const news = await News.create(newsData);
    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ success: false, error: 'Ошибка при создании новости' }, { status: 500 });
  }
}