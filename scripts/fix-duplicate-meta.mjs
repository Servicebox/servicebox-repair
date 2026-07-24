// Исправляет дубли metaTitle/metaDescription у услуг из src/data/meta-fixes-plan.json.
// ПИШЕТ В БД. Запускать один раз, с прямым доступом к продакшн MONGODB_URI.
//
// "clear" — очищает поле, чтобы сработал уже верный fallback-шаблон в
//   src/app/services/[...slug]/layout.js (`${service.name} в Вологде | ServiceBox`).
// "set"   — задаёт явное значение (для услуг с одинаковым name, где fallback
//   по имени сам по себе не даст уникальности — например, два разных "Диагностика").
//
// Использование:
//   MONGODB_URI="<боевая строка подключения>" node scripts/fix-duplicate-meta.mjs           — dry-run
//   MONGODB_URI="<боевая строка подключения>" node scripts/fix-duplicate-meta.mjs --apply    — реальная запись
import mongoose from 'mongoose';
import fs from 'fs';

const APPLY = process.argv.includes('--apply');

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema, 'services');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан. Укажите боевую строку подключения явно:');
    console.error('   MONGODB_URI="mongodb+srv://..." node scripts/fix-duplicate-meta.mjs');
    process.exit(1);
  }

  const plan = JSON.parse(fs.readFileSync(new URL('../src/data/meta-fixes-plan.json', import.meta.url), 'utf-8'));
  console.log(`План: ${plan.length} записей. Режим: ${APPLY ? 'ЗАПИСЬ В БД' : 'DRY-RUN (без изменений)'}\n`);

  await mongoose.connect(process.env.MONGODB_URI);

  let ok = 0, missing = 0;

  for (const item of plan) {
    const doc = await Service.findById(item.id).lean();
    if (!doc) {
      console.warn(`⚠️  Не найден документ _id=${item.id} (${item.name}) — пропускаю`);
      missing++;
      continue;
    }

    const update = {};
    let unset = {};
    if (item.action === 'set') {
      if (item.metaTitle) update.metaTitle = item.metaTitle;
      if (item.metaDescription) update.metaDescription = item.metaDescription;
    } else if (item.action === 'clear') {
      if (item.clearMetaTitle) unset.metaTitle = '';
      if (item.clearMetaDescription) unset.metaDescription = '';
    }

    const desc = item.action === 'set'
      ? `metaTitle="${item.metaTitle || doc.metaTitle}"`
      : `очистка полей: ${Object.keys(unset).join(', ')}`;

    if (APPLY) {
      const ops = {};
      if (Object.keys(update).length) ops.$set = update;
      if (Object.keys(unset).length) ops.$unset = unset;
      await Service.updateOne({ _id: item.id }, ops);
    }
    console.log(`${APPLY ? '✅' : '☐'} ${item.name} — ${desc}`);
    ok++;
  }

  console.log(`\nИтого: ${ok} ${APPLY ? 'обновлено' : 'готово к обновлению'}, ${missing} не найдено`);
  if (!APPLY) {
    console.log('\nЭто был dry-run. Для реальной записи добавьте флаг --apply.');
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
