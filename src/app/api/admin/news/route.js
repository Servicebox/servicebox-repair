export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { pickNewsFields } from '@/lib/newsFields';
import News from '@/models/News';

// Namespace-эндпоинт под /api/admin/* (двойной гейт: middleware + requireAdmin).
// Логика создания новости и белый список полей общие с POST /api/news
// (см. src/lib/newsFields.js) — одно определение на оба пути.
export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));

    if (!body.title || !body.contentBlocks) {
      return NextResponse.json(
        { success: false, error: 'Заголовок и контент обязательны' },
        { status: 400 }
      );
    }

    const news = await News.create(pickNewsFields(body));
    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании новости' },
      { status: 500 }
    );
  }
}
