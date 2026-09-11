import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { read, utils } from '@e965/xlsx';
import dbConnect from '@/lib/db';
import PriceItem from '@/models/PriceItem';
import { requireAdmin } from '@/lib/authGuard';

// Прайс со всей номенклатурой весит ~1–3 МБ; 10 МБ — щедрый предел,
// отсекающий заведомо мусорные и атакующие загрузки до парсинга.
const MAX_XLSX_BYTES = 10 * 1024 * 1024;

// Сопоставление колонок файла с полями PriceItem: ищем по вхождению
// подстроки в заголовке (регистронезависимо), как и раньше в /api/price/data.
const COLUMN_MAP = [
  { field: 'name', match: ['наименование', 'название'] },
  { field: 'model', match: ['модель'] },
  { field: 'revision', match: ['ревизия'] },
  { field: 'category', match: ['категория', 'группа'] },
  { field: 'retailPrice', match: ['розниц'] },
  { field: 'purchasePrice', match: ['закуп'] },
  { field: 'quantity', match: ['наличие', 'количество', 'остаток'] },
  { field: 'description', match: ['описание'] },
];

function toNumberOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export async function POST(request) {
  // Загружать прайс может только администратор.
  // requireAdmin дополнительно проверяет Origin (CSRF).
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Файл должен быть в формате .xlsx' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_XLSX_BYTES) {
      return NextResponse.json({ error: 'Файл слишком большой (максимум 10 МБ)' }, { status: 413 });
    }

    // .xlsx — это ZIP-контейнер, первые два байта всегда "PK" (0x50 0x4B).
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      return NextResponse.json({ error: 'Файл не является корректным .xlsx' }, { status: 400 });
    }

    // Парсим лист в массив строк, первая строка — заголовки.
    const workbook = read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (rows.length < 2) {
      return NextResponse.json({ error: 'В файле нет данных (только заголовки или пусто)' }, { status: 400 });
    }

    const rawHeaders = rows[0].map((h) => String(h).toLowerCase().trim());
    const columnIndex = {};
    rawHeaders.forEach((header, idx) => {
      COLUMN_MAP.forEach(({ field, match }) => {
        if (columnIndex[field] === undefined && match.some((m) => header.includes(m))) {
          columnIndex[field] = idx;
        }
      });
    });

    if (columnIndex.name === undefined || columnIndex.retailPrice === undefined) {
      return NextResponse.json(
        { error: 'Не найдены обязательные колонки: наименование и розница' },
        { status: 400 }
      );
    }

    const items = [];
    let skipped = 0;
    for (const row of rows.slice(1)) {
      const name = String(row[columnIndex.name] ?? '').trim();
      const retailPrice = toNumberOrNull(row[columnIndex.retailPrice]);
      // Отрицательную розницу считаем такой же битой строкой, как пустое
      // имя/цену — иначе она дойдёт до схемы (min:0), провалит валидацию
      // ВНУТРИ транзакции и откатит загрузку ВСЕГО файла целиком.
      if (!name || retailPrice === null || retailPrice < 0) {
        if (row.some((c) => String(c ?? '').trim() !== '')) skipped += 1; // непустая, но битая строка
        continue;
      }
      const purchasePriceRaw =
        columnIndex.purchasePrice !== undefined ? toNumberOrNull(row[columnIndex.purchasePrice]) : null;
      items.push({
        name: name.slice(0, 300),
        model: columnIndex.model !== undefined ? String(row[columnIndex.model] ?? '').trim().slice(0, 200) : '',
        revision:
          columnIndex.revision !== undefined ? String(row[columnIndex.revision] ?? '').trim().slice(0, 100) : '',
        category:
          columnIndex.category !== undefined ? String(row[columnIndex.category] ?? '').trim().slice(0, 100) : '',
        retailPrice,
        // Отрицательную/битую закупку просто не сохраняем — это необязательное
        // скрытое поле, не повод пропускать всю позицию.
        purchasePrice: purchasePriceRaw !== null && purchasePriceRaw >= 0 ? purchasePriceRaw : null,
        quantity:
          columnIndex.quantity !== undefined ? Math.max(0, toNumberOrNull(row[columnIndex.quantity]) || 0) : 0,
        description:
          columnIndex.description !== undefined
            ? String(row[columnIndex.description] ?? '').trim().slice(0, 2000)
            : '',
      });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Не найдено ни одной корректной позиции в файле' }, { status: 400 });
    }

    await dbConnect();

    // Загрузка Excel заменяет весь прайс-лист целиком (как и раньше, когда
    // это был файл) — транзакционно, чтобы не остаться без данных при сбое
    // посередине операции.
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await PriceItem.deleteMany({}, { session });
      await PriceItem.insertMany(items, { session, ordered: true });
      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: `Загружено позиций: ${items.length}${skipped ? `, пропущено (нет названия/цены): ${skipped}` : ''}`,
      imported: items.length,
      skipped,
    });
  } catch (error) {
    console.error('Price upload error:', error?.message || error);
    const message =
      error?.name === 'ValidationError'
        ? 'Файл не загружен: в одной из строк недопустимое значение. Проверьте цены и повторите загрузку.'
        : 'Ошибка загрузки файла';
    return NextResponse.json({ error: message }, { status: error?.name === 'ValidationError' ? 400 : 500 });
  }
}
