// scripts/migrate-price-to-mongo.mjs
//
// Одноразовая миграция: /api/price/* переведён с файла public/price-data/
// price.xlsx на коллекцию PriceItem в Mongo. Этот скрипт читает СУЩЕСТВУЮЩИЙ
// файл (если он есть на боксе) и переносит его позиции в новую коллекцию,
// чтобы реальный прайс не потерялся при переезде.
//
// Идемпотентен: если коллекция price_items уже не пуста — ничего не делает
// (без --force), чтобы повторный/случайный запуск не задвоил позиции поверх
// уже введённых вручную через новую админку.
//
// Запуск на сервере (реальная БД и файл доступны только там):
//   node scripts/migrate-price-to-mongo.mjs           # dry-run, только показать
//   node scripts/migrate-price-to-mongo.mjs --apply   # применить
//   node scripts/migrate-price-to-mongo.mjs --apply --force  # даже если коллекция не пуста

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { read, utils } from '@e965/xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.production'), quiet: true });

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const PRICE_FILE_PATH = path.join(__dirname, '..', 'public', 'price-data', 'price.xlsx');

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

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан');
    process.exit(1);
  }

  let buffer;
  try {
    buffer = await fs.readFile(PRICE_FILE_PATH);
  } catch {
    console.log(`ℹ️  Файл ${PRICE_FILE_PATH} не найден — переносить нечего, выхожу.`);
    return;
  }

  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rows.length < 2) {
    console.log('ℹ️  Файл пуст (только заголовки или ничего) — переносить нечего.');
    return;
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

  if (columnIndex.name === undefined) {
    console.error('❌ В файле не найдена обязательная колонка: наименование');
    process.exit(1);
  }

  const items = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    const name = String(row[columnIndex.name] ?? '').trim();
    // Колонки "розница" в реальном прайсе может не быть вовсе (справочник
    // запчастей без проставленных цен — дозаполняется через админку), пустая
    // цена — это 0, а не битая строка. Как и в src/app/api/price/upload/route.js,
    // чтобы миграция и повторные загрузки того же файла вели себя одинаково.
    const retailPriceRaw = columnIndex.retailPrice !== undefined ? toNumberOrNull(row[columnIndex.retailPrice]) : null;
    if (retailPriceRaw !== null && retailPriceRaw < 0) {
      if (row.some((c) => String(c ?? '').trim() !== '')) skipped += 1;
      continue;
    }
    if (!name) {
      if (row.some((c) => String(c ?? '').trim() !== '')) skipped += 1;
      continue;
    }
    const retailPrice = retailPriceRaw ?? 0;
    const purchasePriceRaw =
      columnIndex.purchasePrice !== undefined ? toNumberOrNull(row[columnIndex.purchasePrice]) : null;
    items.push({
      name: name.slice(0, 300),
      model: columnIndex.model !== undefined ? String(row[columnIndex.model] ?? '').trim().slice(0, 200) : '',
      revision: columnIndex.revision !== undefined ? String(row[columnIndex.revision] ?? '').trim().slice(0, 100) : '',
      category: columnIndex.category !== undefined ? String(row[columnIndex.category] ?? '').trim().slice(0, 100) : '',
      retailPrice,
      purchasePrice: purchasePriceRaw !== null && purchasePriceRaw >= 0 ? purchasePriceRaw : null,
      quantity: columnIndex.quantity !== undefined ? Math.max(0, toNumberOrNull(row[columnIndex.quantity]) || 0) : 0,
      description:
        columnIndex.description !== undefined ? String(row[columnIndex.description] ?? '').trim().slice(0, 2000) : '',
    });
  }

  console.log(`Найдено в файле: ${items.length} корректных позиций, пропущено битых строк: ${skipped}`);
  if (items.length === 0) return;

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await mongoose.connection.db.collection('priceitems').countDocuments();

  if (existing > 0 && !FORCE) {
    console.log(
      `⏭️  В коллекции priceitems уже есть ${existing} позиций — миграция не нужна (или используйте --force для добавления поверх).`
    );
    await mongoose.disconnect();
    return;
  }

  if (!APPLY) {
    console.log('Пример первой позиции:', JSON.stringify(items[0], null, 2));
    console.log(`\nDry-run: перенёс бы ${items.length} позиций. Запустите с --apply, чтобы применить.`);
    await mongoose.disconnect();
    return;
  }

  const now = new Date();
  const docs = items.map((it) => ({ ...it, createdAt: now, updatedAt: now }));
  const result = await mongoose.connection.db.collection('priceitems').insertMany(docs);
  console.log(`✅ Перенесено позиций: ${result.insertedCount}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('❌ Ошибка миграции:', error?.message || error);
  process.exitCode = 1;
});
