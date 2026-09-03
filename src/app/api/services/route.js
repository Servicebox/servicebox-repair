import { NextResponse } from 'next/server';
import Service from '@/models/Service';
import dbConnect from '@/lib/db';
import { generateSlug } from '@/lib/slugify';
import { requireAdmin } from '@/lib/authGuard';

// ✅ 1. Добавь эту функцию в начало файла (после импортов)
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  // Проверяем, что строка состоит ровно из 24 hex-символов (стандарт MongoDB ObjectId)
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree');

    if (tree === 'true') {
      const treeData = await Service.getTree();
      return NextResponse.json({
        success: true,
        data: treeData
      });
    } else {
      const services = await Service.find({})
        .populate('parent')
        .sort({ order: 1, name: 1 });

      return NextResponse.json({
        success: true,
        data: services
      });
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при загрузке услуг'
    }, { status: 500 });
  }
}

export async function POST(request) {
  // Управлять каталогом услуг может только администратор (+ проверка Origin от CSRF).
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();

    console.log('📝 POST запрос для создания услуги:', body);

    // 1. Транслитерируем slug на латиницу (кириллица в URL ломает YML-фиды и ведёт к 404 у ботов)
    body.slug = generateSlug(body.slug || body.name);

    // 2. Проверяем уникальность slug
    if (body.slug) {
      const existingService = await Service.findOne({ slug: body.slug });
      if (existingService) {
        return NextResponse.json(
          { success: false, error: 'Услуга с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    // 2. ✅ ВАЛИДАЦИЯ PARENT (ВСТАВЛЯЕТСЯ ЗДЕСЬ)
    if (body.parent) {
      if (typeof body.parent === 'string' &&
        (body.parent.startsWith('calc-') || !isValidObjectId(body.parent))) {
        console.warn('⚠️ Некорректный parent ID при создании:', body.parent);
        delete body.parent; // Удаляем поле, чтобы Mongoose не упал с CastError
      }
    }

    // 3. Создаем услугу (теперь body безопасен для Mongoose)
    const service = new Service(body);
    await service.save();

    // Популяция для возврата полных данных
    await service.populate('parent');
    await service.populate('children');

    console.log('✅ Услуга создана:', service.name);

    return NextResponse.json({
      success: true,
      data: service
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка создания услуги:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при создании услуги' },
      { status: 500 }
    );
  }
}