// app/api/likes/favorites/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import Like from '@/models/Like';
import Product from '@/models/Product';
import News from '@/models/News';
import Service from '@/models/Service';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Получаем лайки пользователя
    let query = {
      userId: new mongoose.Types.ObjectId(decoded.id)
    };

    if (type && ['Product', 'News', 'Service'].includes(type)) {
      query.entityType = type;
    }

    const likes = await Like.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Группируем лайки по типу и получаем полную информацию
    const favorites = {
      products: [],
      news: [],
      services: []
    };

    for (const like of likes) {
      try {
        let item;
        if (like.entityType === 'Product') {
          item = await Product.findById(like.entityId).select('_id name slug description new_price quantity image');
          if (item) favorites.products.push(item);
        } else if (like.entityType === 'News') {
          item = await News.findById(like.entityId).select('_id title slug excerpt featuredImage');
          if (item) favorites.news.push(item);
        } else if (like.entityType === 'Service') {
          item = await Service.findById(like.entityId).select('_id name slug description price icon image');
          if (item) favorites.services.push(item);
        }
      } catch (err) {
        console.error(`Error fetching ${like.entityType}:`, err);
      }
    }

    // Считаем общее количество лайков
    const total = await Like.countDocuments(query);

    return NextResponse.json({
      favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
