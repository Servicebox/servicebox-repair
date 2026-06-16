import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

// Вспомогательная функция для проверки валидности ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    // Декодируем и нормализуем slug
    const decodedSlug = decodeURIComponent(slug)
      .trim()
      .toLowerCase()
      .replace(/[^\w\u0400-\u04FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    console.log('🔍 Поиск услуги:', decodedSlug);

    // Ищем услугу по slug
    const service = await Service.findOne({ slug: decodedSlug })
      .populate({
        path: 'children',
        options: { sort: { order: 1, name: 1 } }
      })
      .populate({
        path: 'parent',
        select: 'name slug'
      })
      .lean();

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    // Получаем хлебные крошки
    const breadcrumbs = [];
    let current = service;

    // Собираем цепочку родителей
    while (current) {
      breadcrumbs.unshift({
        name: current.name,
        url: `/services/${current.slug}`,
        isCurrent: false
      });

      if (current.parent && typeof current.parent === 'object') {
        current = current.parent;
      } else if (current.parent) {
        // Если parent это ID, загружаем документ
        const parentDoc = await Service.findById(current.parent)
          .select('name slug parent')
          .lean();
        if (parentDoc) {
          current = parentDoc;
        } else {
          current = null;
        }
      } else {
        current = null;
      }
    }

    // Делаем последний элемент текущим
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
    }

    // Обновляем просмотры
    await Service.findByIdAndUpdate(service._id, {
      $inc: { views: 1 },
      lastViewed: new Date()
    });

    return NextResponse.json({
      success: true,
      data: {
        ...service,
        breadcrumbs
      }
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const body = await request.json();

    console.log('🔄 Обновление услуги:', decodedSlug);

    // Находим услугу
    const existingService = await Service.findOne({ slug: decodedSlug });
    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug если он меняется
    if (body.slug && body.slug !== decodedSlug) {
      const slugExists = await Service.findOne({
        slug: body.slug,
        _id: { $ne: existingService._id }
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug уже используется' },
          { status: 400 }
        );
      }
    }

    // Обновляем данные
    const updateData = { ...body };

    // Если это категория, убираем цену
    if (updateData.isCategory) {
      updateData.price = '';
    }

    // ✅ ИСПРАВЛЕНИЕ: Санитизация поля parent
    // Если frontend отправил ID категории калькулятора (например, "calc-tv"),
    // MongoDB выдаст ошибку CastError. Мы проверяем валидность ID перед записью.
    if (updateData.parent) {
      if (typeof updateData.parent === 'string' && !isValidObjectId(updateData.parent)) {
        console.warn(`⚠️ Игнорирую некорректный ID родителя: "${updateData.parent}". Поле parent не обновлено.`);
        delete updateData.parent; // Удаляем поле из обновления, чтобы сохранить старый родитель или оставить null
      }
    }

    // Обновляем документ
    const updatedService = await Service.findByIdAndUpdate(
      existingService._id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Услуга успешно обновлена'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления:', error);

    // Обработка ошибок валидации
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const service = await Service.findOne({ slug: decodedSlug });
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    // Проверяем дочерние элементы
    const childCount = await Service.countDocuments({ parent: service._id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Сначала удалите или переместите все подуслуги'
        },
        { status: 400 }
      );
    }

    await Service.findByIdAndDelete(service._id);

    return NextResponse.json({
      success: true,
      message: 'Услуга удалена'
    });

  } catch (error) {
    console.error('❌ Ошибка удаления:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении' },
      { status: 500 }
    );
  }
}