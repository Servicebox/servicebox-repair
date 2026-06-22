export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import Review from '@/models/Review';

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  text:   z.string().trim().min(10).max(3000).optional(),
}).refine(d => d.status !== undefined || d.text !== undefined, {
  message: 'Укажите хотя бы одно поле',
});

// PATCH /api/admin/reviews/[id]
export async function PATCH(request, { params }) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const updated = await Review.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });

  return NextResponse.json({ review: updated });
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(request, { params }) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const deleted = await Review.findByIdAndDelete(params.id).lean();
  if (!deleted) return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });

  return NextResponse.json({ message: 'Отзыв удалён' });
}
