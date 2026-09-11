import { NextResponse } from 'next/server';
import { utils, write } from '@e965/xlsx';
import dbConnect from '@/lib/db';
import PriceItem from '@/models/PriceItem';

// Публичное скачивание прайса — раньше отдавало сохранённый файл,
// теперь собирает .xlsx на лету из текущих данных Mongo. Цена закупки
// сюда никогда не попадает.
const EXPORT_COLUMNS = ['Категория', 'Наименование', 'Модель', 'Ревизия', 'Розница', 'Описание'];

export async function GET() {
  try {
    await dbConnect();

    const rows = await PriceItem.find({})
      .select('name model revision category retailPrice description')
      .sort({ category: 1, name: 1 })
      .lean();

    if (rows.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const sheetData = rows.map((r) => ({
      Категория: r.category || '',
      Наименование: r.name || '',
      Модель: r.model || '',
      Ревизия: r.revision || '',
      // 0 = цена ещё не проставлена (см. models/PriceItem.js) — в экспорт
      // отдаём пусто, а не "0", иначе выглядит как бесплатная запчасть.
      Розница: r.retailPrice ? r.retailPrice : '',
      Описание: r.description || '',
    }));

    const worksheet = utils.json_to_sheet(sheetData, { header: EXPORT_COLUMNS });
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Прайс');
    const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="price.xlsx"',
      },
    });
  } catch (error) {
    console.error('Price export error:', error?.message || error);
    return new NextResponse(null, { status: 500 });
  }
}
