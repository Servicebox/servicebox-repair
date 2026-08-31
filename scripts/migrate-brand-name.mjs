// Переименование собственного бренда товаров ServiceBox / ServiceBox35 → «СЕРВИС БОКС».
// Причина: в РФ нежелательно использовать англоязычное написание названия в
// потребительских материалах и товарных фидах (Яндекс.Маркет, Google Merchant).
// Код (дефолты схемы, фиды, карточка товара) уже отдаёт «СЕРВИС БОКС»; этот
// скрипт приводит в соответствие УЖЕ СОХРАНЁННЫЕ документы в БД.
//
// ПИШЕТ В БД. Запускать один раз, с прямым доступом к продакшн MONGODB_URI.
//
// Использование:
//   MONGODB_URI="<боевая строка>" node scripts/migrate-brand-name.mjs            — dry-run (по умолчанию)
//   MONGODB_URI="<боевая строка>" node scripts/migrate-brand-name.mjs --apply    — реальная запись
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const OLD = ['ServiceBox35', 'ServiceBox'];
const NEW = 'СЕРВИС БОКС';

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан. Укажите боевую строку подключения явно.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Режим: ${APPLY ? 'ЗАПИСЬ В БД' : 'DRY-RUN (без изменений)'}\n`);

  for (const field of ['brand', 'vendor']) {
    const filter = { [field]: { $in: OLD } };
    const count = await Product.countDocuments(filter);
    console.log(`${field}: найдено ${count} товаров со старым названием`);

    if (APPLY && count > 0) {
      const res = await Product.updateMany(filter, { $set: { [field]: NEW } });
      console.log(`   → обновлено: ${res.modifiedCount}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nГотово.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
