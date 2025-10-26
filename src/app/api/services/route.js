import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET() {
  try {
    await dbConnect();
    const services = await Service.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке услуг' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    
    const service = await Service.create({
      serviceName,
      description,
      price,
      category
    });
    
    return NextResponse.json(service, { status: 201 });
    
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании услуги' },
      { status: 500 }
    );
  }
}