///app/api/news/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ ФИКС: Ожидаем params в Next.js 15
    const { id } = await params;

    console.log('Fetching news with ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID новости не указан' },
        { status: 400 }
      );
    }

    const news = await News.findById(id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news item:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке новости' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ ФИКС: Ожидаем params в Next.js 15
    const { id } = await params;
    const updateData = await request.json();

    console.log('Updating news with ID:', id, 'Data:', updateData);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID новости не указан' },
        { status: 400 }
      );
    }

    const news = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении новости' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ ФИКС: Ожидаем params в Next.js 15
    const { id } = await params;

    console.log('Deleting news with ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID новости не указан' },
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
      message: 'Новость успешно удалена'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении новости' },
      { status: 500 }
    );
  }
}