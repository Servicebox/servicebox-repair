// app/api/admin/debug/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(request) {
  console.log('🐛 === DEBUG ADMIN API CALLED ===');
  
  const session = await getServerSession(request);
  
  return NextResponse.json({
    session: session,
    message: 'Debug endpoint',
    timestamp: new Date().toISOString()
  });
}