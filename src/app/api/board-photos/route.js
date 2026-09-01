export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { DEVICE_TYPES } from '@/lib/boardPhotos';

const PUBLIC_FIELDS = 'slug title deviceType chip description imageWidth imageHeight createdAt';

export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);
  const deviceType = url.searchParams.get('deviceType');
  const q = (url.searchParams.get('q') || '').trim();

  const filter = { isActive: true };
  if (deviceType && DEVICE_TYPES.includes(deviceType)) filter.deviceType = deviceType;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { chip: rx }];
  }

  const docs = await BoardPhoto.find(filter, PUBLIC_FIELDS).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    boardPhotos: docs.map(d => ({ ...d, _id: d._id.toString() })),
  });
}
