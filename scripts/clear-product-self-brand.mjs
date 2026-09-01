// Убирает у товаров собственное название в поле brand/vendor.
// Причина: раньше при отсутствии реального бренда код подставлял «ServiceBox35»
// (после ребрендинга — «СЕРВИС БОКС»). Мы не производим эту продукцию, поэтому
// приписывать её себе нельзя — при неизвестном бренде поле должно быть пустым.
// Код уже не подставляет fallback; этот скрипт чистит уже сохранённые документы.
//
// ПИШЕТ В БД. Запускать на сервере, с прямым доступом к продакшн MONGODB_URI.
//
//   MONGODB_URI="<боевая строка>" node scripts/clear-product-self-brand.mjs           — dry-run (по умолчанию)
//   MONGODB_URI="<боевая строка>" node scripts/clear-product-self-brand.mjs --apply    — реальная запись
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const SELF = ['ServiceBox35', 'ServiceBox', 'СЕРВИС БОКС', 'СервисБокс', 'Сервис Бокс'];

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Режим: ${APPLY ? 'ЗАПИСЬ В БД' : 'DRY-RUN (без изменений)'}\n`);

  for (const field of ['brand', 'vendor']) {
    const filter = { [field]: { $in: SELF } };
    const count = await Product.countDocuments(filter);
    console.log(`${field}: ${count} товаров с собственным названием вместо бренда`);

    if (APPLY && count > 0) {
      const res = await Product.updateMany(filter, { $unset: { [field]: '' } });
      console.log(`   → очищено: ${res.modifiedCount}`);
    }
  }

  // Старый pre('save') хук писал в params запись «Производитель: СЕРВИС БОКС».
  // Сейчас фиды её фильтруют по builtinKeys, но чистим и здесь, чтобы не
  // оставлять протухшие данные.
  const paramFilter = { 'params.Производитель': { $in: SELF } };
  const paramCount = await Product.countDocuments(paramFilter);
  console.log(`params.Производитель: ${paramCount} товаров со стухшим значением`);
  if (APPLY && paramCount > 0) {
    const res = await Product.updateMany(paramFilter, { $unset: { 'params.Производитель': '' } });
    console.log(`   → очищено: ${res.modifiedCount}`);
  }

  // Контроль: сколько товаров вообще без бренда после чистки
  const noBrand = await Product.countDocuments({
    $or: [{ brand: { $exists: false } }, { brand: null }, { brand: '' }],
  });
  console.log(`\nИтого товаров без бренда: ${noBrand}`);

  await mongoose.disconnect();
  console.log('Готово.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
