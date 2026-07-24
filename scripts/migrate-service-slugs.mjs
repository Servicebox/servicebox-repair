// Выполняет миграцию slug'ов услуг из src/data/slug-migration-plan.json.
// ПИШЕТ В БД. Запускать один раз, с прямым доступом к продакшн MONGODB_URI.
//
// Использование:
//   MONGODB_URI="<боевая строка подключения>" node scripts/migrate-service-slugs.mjs           — dry-run (по умолчанию)
//   MONGODB_URI="<боевая строка подключения>" node scripts/migrate-service-slugs.mjs --apply    — реальная запись
import mongoose from 'mongoose';
import fs from 'fs';

const APPLY = process.argv.includes('--apply');

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema, 'services');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан. Укажите боевую строку подключения явно:');
    console.error('   MONGODB_URI="mongodb+srv://..." node scripts/migrate-service-slugs.mjs');
    process.exit(1);
  }

  const plan = JSON.parse(fs.readFileSync(new URL('../src/data/slug-migration-plan.json', import.meta.url), 'utf-8'));
  console.log(`План миграции: ${plan.length} записей. Режим: ${APPLY ? 'ЗАПИСЬ В БД' : 'DRY-RUN (без изменений)'}\n`);

  await mongoose.connect(process.env.MONGODB_URI);

  let ok = 0, mismatched = 0, missing = 0;

  for (const item of plan) {
    const doc = await Service.findById(item.id).lean();
    if (!doc) {
      console.warn(`⚠️  Не найден документ _id=${item.id} (${item.name}) — пропускаю`);
      missing++;
      continue;
    }
    if (doc.slug !== item.oldSlug) {
      console.warn(`⚠️  slug изменился с момента планирования: _id=${item.id} ожидался "${item.oldSlug}", сейчас "${doc.slug}" — пропускаю, перепланируйте`);
      mismatched++;
      continue;
    }

    if (APPLY) {
      await Service.updateOne({ _id: item.id }, { $set: { slug: item.newSlug } });
    }
    console.log(`${APPLY ? '✅' : '☐'} ${item.oldSlug}  →  ${item.newSlug}`);
    ok++;
  }

  console.log(`\nИтого: ${ok} ${APPLY ? 'обновлено' : 'готово к обновлению'}, ${mismatched} расхождений, ${missing} не найдено`);
  if (!APPLY) {
    console.log('\nЭто был dry-run. Для реальной записи добавьте флаг --apply.');
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
