// app/api/admin/seo/bulk-update/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import Service from '@/models/Service';

const SeoItemSchema = z.object({
  slug: z.string().min(1, 'slug обязателен'),
  title: z
    .string()
    .min(10, 'title минимум 10 символов')
    .max(70, 'title не должен превышать 70 символов')
    .optional(),
  description: z
    .string()
    .min(50, 'description минимум 50 символов')
    .max(170, 'description не должен превышать 170 символов')
    .optional(),
});

const BulkUpdateSchema = z.object({
  items: z
    .array(SeoItemSchema)
    .min(1, 'Список items не может быть пустым')
    .max(500, 'Максимум 500 элементов за один запрос'),
});

// POST /api/admin/seo/bulk-update
export async function POST(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = BulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ошибка валидации', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  await dbConnect();

  const results = { updated: [], skipped: [], errors: [] };

  // Делаем bulkWrite одним запросом — эффективнее N отдельных обновлений
  const ops = [];

  for (const item of parsed.data.items) {
    const $set = {};
    if (item.title !== undefined) $set.metaTitle = item.title;
    if (item.description !== undefined) $set.metaDescription = item.description;

    if (Object.keys($set).length === 0) {
      results.skipped.push({ slug: item.slug, reason: 'нет полей для обновления' });
      continue;
    }

    ops.push({
      updateOne: {
        filter: { slug: item.slug },
        update: { $set },
      },
    });
  }

  if (ops.length === 0) {
    return NextResponse.json({
      success: true,
      report: { updated: 0, skipped: results.skipped.length, errors: 0 },
      details: results,
    });
  }

  let bulkResult;
  try {
    bulkResult = await Service.bulkWrite(ops, { ordered: false });
  } catch (err) {
    console.error('[SEO bulk-update] bulkWrite error:', err);
    return NextResponse.json({ error: 'Ошибка записи в базу данных' }, { status: 500 });
  }

  // Формируем отчёт
  const slugsInOps = ops.map(op => op.updateOne.filter.slug);

  // Узнаём, какие slug не нашли соответствие (matchedCount vs ops.length)
  // bulkWrite не говорит напрямую — делаем быструю проверку существующих slug
  const existingSlugs = await Service.distinct('slug', { slug: { $in: slugsInOps } });
  const existingSet = new Set(existingSlugs);

  for (const slug of slugsInOps) {
    if (existingSet.has(slug)) {
      results.updated.push(slug);
    } else {
      results.skipped.push({ slug, reason: 'услуга не найдена' });
    }
  }

  console.log(
    `[SEO bulk-update] обновлено: ${bulkResult.modifiedCount}, совпало: ${bulkResult.matchedCount}, ` +
    `без изменений: ${bulkResult.matchedCount - bulkResult.modifiedCount}`
  );

  return NextResponse.json({
    success: true,
    report: {
      updated: results.updated.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      modifiedCount: bulkResult.modifiedCount,
      matchedCount: bulkResult.matchedCount,
    },
    details: results,
  });
}
