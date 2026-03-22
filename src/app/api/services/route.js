import { NextResponse } from 'next/server';
import Service from '@/models/Service';
import dbConnect from '@/lib/db';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree');
    
    if (tree === 'true') {
      // Возвращаем древовидную структуру
      const treeData = await Service.getTree();
      return NextResponse.json({
        success: true,
        data: treeData
      });
    } else {
      // Возвращаем плоский список
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
  try {
    await dbConnect();
    const body = await request.json();

    console.log('📝 POST запрос для создания услуги:', body);

    // Проверяем уникальность slug
    if (body.slug) {
      const existingService = await Service.findOne({ slug: body.slug });
      if (existingService) {
        return NextResponse.json(
          { success: false, error: 'Услуга с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    // Создаем услугу
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