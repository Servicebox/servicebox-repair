import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const service = await Service.findById(params.id);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке услуги' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { serviceName, description, price, category } = body;
    
    if (!serviceName || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }
    
    const service = await Service.findByIdAndUpdate(
      params.id,
      { serviceName, description, price, category },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(service);
    
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении услуги' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const service = await Service.findByIdAndDelete(params.id);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Услуга успешно удалена' });
    
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении услуги' },
      { status: 500 }
    );
  }
}