// app/api/services/all/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET() {
  try {
    await dbConnect();

    const services = await Service.find({})
      .select('slug updatedAt isCategory level isActive name order')
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('❌ Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}