import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PriceItem from '@/models/PriceItem';

// Тот же формат ответа, что был у старого файлового /api/price/data —
// публичная страница /price читает его без изменений.
const PUBLIC_COLUMNS = ['наименование', 'модель', 'ревизия', 'розница', 'описание'];
const FIELD_BY_COLUMN = {
  наименование: 'name',
  модель: 'model',
  ревизия: 'revision',
  розница: 'retailPrice',
  описание: 'description',
};

export async function GET() {
  try {
    await dbConnect();

    const rows = await PriceItem.find({})
      .select('name model revision retailPrice description')
      .sort({ createdAt: -1 })
      .lean();

    if (rows.length === 0) {
      return NextResponse.json({ headers: [], data: [] });
    }

    const data = rows.map((row) => {
      const item = {};
      PUBLIC_COLUMNS.forEach((col) => {
        const field = FIELD_BY_COLUMN[col];
        const value = row[field];
        // retailPrice: 0 — это "цена ещё не проставлена" (см. models/PriceItem.js),
        // а не реальная нулевая цена — отдаём "—", а не "0", чтобы /price не
        // показывал ремонт запчасти как бесплатный.
        if (field === 'retailPrice' && (!value || value === 0)) {
          item[col] = '';
          return;
        }
        item[col] = value !== undefined && value !== null && value !== '' ? value : '';
      });
      return item;
    });

    return NextResponse.json({ headers: PUBLIC_COLUMNS, data });
  } catch (error) {
    console.error('Error reading price:', error?.message || error);
    // Возвращаем пустой массив, а не ошибку 500 — страница не должна падать.
    return NextResponse.json({ headers: [], data: [] });
  }
}
