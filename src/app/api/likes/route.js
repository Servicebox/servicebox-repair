// app/api/likes/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Like from '@/models/Like';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType');

    if (!entityId || !entityType) {
      return NextResponse.json({ message: 'Не указаны параметры' }, { status: 400 });
    }

    // Считаем общее количество лайков всегда, независимо от авторизации
    const likesCount = await Like.countDocuments({
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ liked: false, likesCount });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ liked: false, likesCount });
    }

    const userId = decoded.id ?? decoded.userId;

    // Проверяем, есть ли лайк у пользователя
    const userLike = await Like.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    return NextResponse.json({
      liked: !!userLike,
      likesCount
    });
  } catch (error) {
    console.error('Likes GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const userId = decoded.id ?? decoded.userId;

    const body = await request.json();
    const { entityId, entityType } = body;

    if (!entityId || !entityType) {
      return NextResponse.json({ message: 'Не указаны параметры' }, { status: 400 });
    }

    if (!['Product', 'News', 'Service', 'Image', 'Promotion'].includes(entityType)) {
      return NextResponse.json({ message: 'Неверный тип сущности' }, { status: 400 });
    }

    // Проверяем, есть ли уже лайк
    const existingLike = await Like.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    if (existingLike) {
      return NextResponse.json({ message: 'Уже лайкнуто' }, { status: 409 });
    }

    // Создаем новый лайк
    const like = await Like.create({
      userId,
      entityId,
      entityType
    });

    // Обновляем счетчик лайков в сущности
    const Model = (await import(`@/models/${entityType}`)).default;
    await Model.findByIdAndUpdate(
      entityId,
      {
        $inc: { likesCount: 1 },
        $addToSet: { likedBy: userId }
      },
      { new: true }
    );

    // Получаем новое количество лайков
    const likesCount = await Like.countDocuments({
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    // Синхронизируем с избранным (тихо, без блокировки ответа)
    const LIKE_TO_FAV_TYPE = {
      Product: 'product',
      News: 'news',
      Image: 'photo',
      Promotion: 'promotion',
    };
    const favType = LIKE_TO_FAV_TYPE[entityType];
    if (favType) {
      try {
        const Favorite = (await import('@/models/Favorite')).default;
        await Favorite.updateOne(
          { userId, itemId: entityId, itemType: favType },
          { $setOnInsert: { userId, itemId: entityId, itemType: favType } },
          { upsert: true }
        );
      } catch { /* не критично */ }
    }

    return NextResponse.json({
      message: 'Лайк добавлен',
      liked: true,
      likesCount
    });
  } catch (error) {
    console.error('Likes POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const userId = decoded.id ?? decoded.userId;

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType');

    if (!entityId || !entityType) {
      return NextResponse.json({ message: 'Не указаны параметры' }, { status: 400 });
    }

    // Удаляем лайк
    await Like.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    // Обновляем счетчик лайков в сущности
    const Model = (await import(`@/models/${entityType}`)).default;
    await Model.findByIdAndUpdate(
      entityId,
      {
        $inc: { likesCount: -1 },
        $pull: { likedBy: userId }
      },
      { new: true }
    );

    // Получаем новое количество лайков
    const likesCount = await Like.countDocuments({
      entityId: new mongoose.Types.ObjectId(entityId),
      entityType
    });

    return NextResponse.json({
      message: 'Лайк удален',
      liked: false,
      likesCount
    });
  } catch (error) {
    console.error('Likes DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
