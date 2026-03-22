// src/app/api/redirect/news/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { isValidObjectId } from '@/lib/slugify';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicebox35.ru';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.redirect(`${BASE_URL}/news`, 302);
    }

    await dbConnect();

    const news = await News.findById(id).select('slug isPublished').lean();

    if (!news || !news.isPublished || !news.slug) {
      return NextResponse.redirect(`${BASE_URL}/news`, 302);
    }

    // Редирект 301 на новую ссылку с слагом
    return NextResponse.redirect(`${BASE_URL}/news/${news.slug}`, 301);

  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(`${BASE_URL}/news`, 302);
  }
}