// src/app/api/news/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    // ✅ ФИКС: await params перед деструктуризацией
    const { id } = await params;

    console.log('🔍 Fetching news with ID:', id);

    // ✅ ФИКС: Проверка на undefined
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'ID новости не указан' },
        { status: 400 }
      );
    }

    // ✅ ФИКС: Проверка валидности ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
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

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке новости' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    // ✅ ФИКС: await params перед деструктуризацией
    const { id } = await params;
    const updateData = await request.json();

    if (!id || id === 'undefined') {
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

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
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

    // ✅ ФИКС: await params перед деструктуризацией
    const { id } = await params;

    if (!id || id === 'undefined') {
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

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ID новости' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении новости' },
      { status: 500 }
    );
  }
}