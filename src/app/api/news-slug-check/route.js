// src/app/api/news-slug-check/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { generateSlug } from '@/lib/slugify';

// POST /api/news-slug-check — проверка, свободен ли слаг
export async function POST(request) {
  try {
    await dbConnect();
    const { title, currentSlug, excludeId } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Заголовок обязателен' },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(title);
    
    // Если слаг не менялся — он валиден
    if (currentSlug === baseSlug && (!excludeId || currentSlug)) {
      return NextResponse.json({ success: true, slug: baseSlug, available: true });
    }

    // Проверка уникальности
    const query = { slug: baseSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await News.findOne(query);
    
    if (existing) {
      // Предлагаем альтернативу с номером
      let counter = 1;
      let suggestedSlug = `${baseSlug}-${counter}`;
      
      while (await News.findOne({ slug: suggestedSlug })) {
        counter++;
        suggestedSlug = `${baseSlug}-${counter}`;
      }
      
      return NextResponse.json({
        success: true,
        slug: baseSlug,
        available: false,
        suggested: suggestedSlug,
        message: `Слаг "${baseSlug}" уже занят`
      });
    }

    return NextResponse.json({
      success: true,
      slug: baseSlug,
      available: true
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки слага' },
      { status: 500 }
    );
  }
}