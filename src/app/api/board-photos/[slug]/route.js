export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';

export async function GET(request, { params }) {
  const { slug } = await params;
  await dbConnect();
  const doc = await BoardPhoto.findOne(
    { slug, isActive: true },
    'slug title deviceType chip description imageWidth imageHeight createdAt'
  ).lean();
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json({ boardPhoto: { ...doc, _id: doc._id.toString() } });
}
