// app/api/services/all/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET() {
  try {
    await dbConnect();
    
    const services = await Service.find({})
      .select('slug updatedAt isCategory level')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: services
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}