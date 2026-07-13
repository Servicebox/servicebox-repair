// Мигрирует калькулятор (src/lib/pricing-data.js + CalculatorConfig.pricingData) в
// унифицированную модель цен: создаёт Brand/Model, заполняет Service.basePrice и
// Service.priceVariants для услуг, найденных по имени под соответствующей корневой
// категорией. См. docs/superpowers/specs/2026-07-14-unified-pricing-design.md.
//
// ПИШЕТ В БД только с флагом --apply. Запускать с прямым доступом к боевой БД.
//
// Использование:
//   MONGODB_URI="<боевая строка подключения>" node scripts/migrate-pricing-data.mjs           — dry-run (по умолчанию)
//   MONGODB_URI="<боевая строка подключения>" node scripts/migrate-pricing-data.mjs --apply    — реальная запись
import mongoose from 'mongoose';
import { PRICING } from '../src/lib/pricing-data.js';
import Brand from '../src/models/Brand.js';
import ModelDoc from '../src/models/Model.js';

const APPLY = process.argv.includes('--apply');

// Тот же loose-схемный подход, что и в migrate-service-slugs.mjs — работаем напрямую
// с коллекцией, не подключая полную схему Service (с её обязательными полями).
const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema, 'services');

const calculatorConfigSchema = new mongoose.Schema({}, { strict: false });
const CalculatorConfig = mongoose.models.CalculatorConfig
  || mongoose.model('CalculatorConfig', calculatorConfigSchema, 'calculatorconfigs');

// Дублирует CATEGORY_MAP из src/components/ServicePricePage/ServicePricePage.js —
// та карта не экспортируется как общий модуль, поэтому кандидаты имён корневых
// категорий перечислены здесь явно. Если категория не найдена в БД, миграция
// просто пропускает device type и печатает предупреждение — ничего не падает.
const DEVICE_TYPE_ROOT_CANDIDATES = {
  phone: ['Ремонт телефонов', 'Техника Apple'],
  laptop: ['Ремонт ноутбуков'],
  tablet: ['Ремонт планшетов'],
  tv: ['Ремонт телевизоров'],
  videocard: ['Ремонт видеокарт'],
  console: ['Игровые консоли'],
};

const normalize = (name) => (name || '').trim().toLowerCase();

async function findRoot(candidateNames) {
  for (const name of candidateNames) {
    const root = await Service.findOne({ name, isCategory: true, parent: null }).lean();
    if (root) return root;
  }
  return null;
}

async function collectLeafDescendants(rootId) {
  const leaves = [];
  let frontier = [rootId];
  while (frontier.length) {
    const children = await Service.find({ parent: { $in: frontier } }).lean();
    frontier = [];
    for (const child of children) {
      if (child.isCategory) {
        frontier.push(child._id);
      } else {
        leaves.push(child);
      }
    }
  }
  return leaves;
}

async function upsertBrand(name, deviceType, multiplier) {
  const existing = await Brand.findOne({ name, deviceType });
  if (existing) return existing;
  if (!APPLY) return { _id: `(new)${deviceType}:${name}`, name, deviceType, multiplier };
  return Brand.create({ name, deviceType, multiplier });
}

async function upsertModel(brandId, modelData) {
  // В dry-run режиме ещё не созданный Brand имеет фейковый строковый _id — искать по
  // нему в БД бессмысленно (и упадёт на касте к ObjectId), сразу возвращаем заглушку.
  const existing = mongoose.isValidObjectId(brandId)
    ? await ModelDoc.findOne({ brandId, name: modelData.name })
    : null;
  if (existing) return existing;
  const doc = {
    brandId,
    name: modelData.name,
    gen: modelData.gen ?? 1,
    portType: modelData.portType,
    hasSeparateGlass: !!modelData.hasSeparateGlass,
    hasBga: !!modelData.hasBga,
    hasThermalPads: !!modelData.hasThermalPads,
    tvType: modelData.tvType,
  };
  if (!APPLY) return { _id: `(new)${brandId}:${modelData.name}`, ...doc };
  return ModelDoc.create(doc);
}

async function migrateDeviceType(deviceType, deviceData) {
  console.log(`\n=== ${deviceType} (${deviceData.label}) ===`);

  const candidates = DEVICE_TYPE_ROOT_CANDIDATES[deviceType] || [];
  const root = await findRoot(candidates);
  if (!root) {
    console.warn(`⚠️  Корневая категория не найдена среди [${candidates.join(', ')}] — пропускаю ${deviceType}`);
    return { matched: 0, unmatched: Object.keys(deviceData.services || {}).length, brands: 0, models: 0 };
  }

  const leaves = await collectLeafDescendants(root._id);
  const leafByName = new Map(leaves.map((leaf) => [normalize(leaf.name), leaf]));

  // Brand/Model сначала, чтобы получить их _id для priceVariants
  const brandIdByKey = new Map();
  const modelIdByKey = new Map(); // `${brandKey}:${modelId}` -> Model._id
  let brandCount = 0;
  let modelCount = 0;

  for (const [brandKey, brandData] of Object.entries(deviceData.brands || {})) {
    const brand = await upsertBrand(brandData.name, deviceType, brandData.multiplier ?? 1);
    brandIdByKey.set(brandKey, brand._id);
    brandCount++;

    for (const modelData of brandData.models || []) {
      const model = await upsertModel(brand._id, modelData);
      modelIdByKey.set(`${brandKey}:${modelData.id}`, model._id);
      modelCount++;
    }
  }

  let matched = 0;
  const unmatchedNames = [];

  for (const [repairKey, repairData] of Object.entries(deviceData.services || {})) {
    const leaf = leafByName.get(normalize(repairData.name));
    if (!leaf) {
      unmatchedNames.push(repairData.name);
      continue;
    }
    matched++;

    const priceVariants = [];
    for (const [brandKey, brandData] of Object.entries(deviceData.brands || {})) {
      for (const modelData of brandData.models || []) {
        const price = modelData.specificPrices?.[repairKey];
        if (typeof price !== 'number') continue;
        const modelId = modelIdByKey.get(`${brandKey}:${modelData.id}`);
        priceVariants.push({ modelId, price });
      }
    }

    const compatFlags = {
      appleOnly: !!repairData.appleOnly,
      portType: repairData.portType,
      requiresSeparateGlass: !!repairData.requiresSeparateGlass,
      requiresThermalPads: !!repairData.requiresThermalPads,
      requiresBga: !!repairData.requiresBga,
      requiresFaceId: !!repairData.requiresFaceId,
      requiresTvType: repairData.requiresTvType || [],
    };

    console.log(`${APPLY ? '✅' : '☐'} "${repairData.name}" → Service ${leaf.slug || leaf._id} (basePrice=${repairData.basePrice}, ${priceVariants.length} вариантов по моделям)`);

    if (APPLY) {
      await Service.updateOne(
        { _id: leaf._id },
        { $set: {
          basePrice: repairData.basePrice,
          priceVariants,
          minTime: repairData.minTime,
          maxTime: repairData.maxTime,
          compatFlags,
        } }
      );
    }
  }

  if (unmatchedNames.length) {
    console.warn(`⚠️  Не найдено соответствий (${unmatchedNames.length}), требуют ручной привязки:`);
    unmatchedNames.forEach((name) => console.warn(`   - ${name}`));
  }

  return { matched, unmatched: unmatchedNames.length, brands: brandCount, models: modelCount };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан. Укажите боевую строку подключения явно:');
    console.error('   MONGODB_URI="mongodb+srv://..." node scripts/migrate-pricing-data.mjs');
    process.exit(1);
  }

  console.log(`Режим: ${APPLY ? 'ЗАПИСЬ В БД' : 'DRY-RUN (без изменений)'}`);

  await mongoose.connect(process.env.MONGODB_URI);

  const liveConfig = await CalculatorConfig.findOne().sort({ updatedAt: -1 }).lean();
  const pricing = liveConfig?.pricingData || PRICING;
  if (liveConfig?.pricingData) {
    console.log('ℹ️  Использую живой CalculatorConfig.pricingData из БД (новее статичного pricing-data.js)');
  } else {
    console.log('ℹ️  CalculatorConfig не найден — использую статичный src/lib/pricing-data.js');
  }

  const totals = { matched: 0, unmatched: 0, brands: 0, models: 0 };
  for (const [deviceType, deviceData] of Object.entries(pricing)) {
    const result = await migrateDeviceType(deviceType, deviceData);
    totals.matched += result.matched;
    totals.unmatched += result.unmatched;
    totals.brands += result.brands;
    totals.models += result.models;
  }

  console.log(`\nИтого: ${totals.matched} услуг ${APPLY ? 'обновлено' : 'готово к обновлению'}, ${totals.unmatched} без соответствия, ${totals.brands} брендов, ${totals.models} моделей`);
  if (!APPLY) {
    console.log('\nЭто был dry-run. Для реальной записи (создание Brand/Model, заполнение Service.priceVariants/basePrice) добавьте флаг --apply.');
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
