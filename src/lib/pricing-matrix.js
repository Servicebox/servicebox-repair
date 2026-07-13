// lib/pricing-matrix.js
// Общая логика чтения унифицированных данных цен (Brand/Model/Service.priceVariants)
// для admin bulk-матрицы и публичного калькулятора. См.
// docs/superpowers/specs/2026-07-14-unified-pricing-design.md.
import Service from '@/models/Service';
import Brand from '@/models/Brand';
import ModelDoc from '@/models/Model';

// Дублирует CATEGORY_MAP из src/components/ServicePricePage/ServicePricePage.js и
// DEVICE_TYPE_ROOT_CANDIDATES из scripts/migrate-pricing-data.mjs — общего модуля
// под это нет, так что список кандидатов имён корневой категории держим локально.
export const DEVICE_TYPE_ROOT_CANDIDATES = {
  phone: ['Ремонт телефонов', 'Техника Apple'],
  laptop: ['Ремонт ноутбуков'],
  tablet: ['Ремонт планшетов'],
  tv: ['Ремонт телевизоров'],
  videocard: ['Ремонт видеокарт'],
  console: ['Игровые консоли'],
};

async function findRootCategory(deviceType) {
  const candidates = DEVICE_TYPE_ROOT_CANDIDATES[deviceType] || [];
  for (const name of candidates) {
    const root = await Service.findOne({ name, isCategory: true, parent: null }).lean();
    if (root) return root;
  }
  return null;
}

async function collectLeafDescendants(rootId) {
  const leaves = [];
  let frontier = [rootId];
  while (frontier.length) {
    const children = await Service.find({ parent: { $in: frontier } })
      .select('name slug price basePrice priceVariants minTime maxTime compatFlags isCategory')
      .lean();
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

/**
 * @param {string} deviceType
 * @returns {Promise<{category: {id: any, name: string}|null, services: any[], brands: any[], candidateRootNames: string[]}>}
 */
export async function getPricingMatrixData(deviceType) {
  const root = await findRootCategory(deviceType);
  if (!root) {
    return {
      category: null,
      services: [],
      brands: [],
      candidateRootNames: DEVICE_TYPE_ROOT_CANDIDATES[deviceType] || []
    };
  }

  const services = await collectLeafDescendants(root._id);

  const brands = await Brand.find({ deviceType }).sort({ name: 1 }).lean();
  const models = await ModelDoc.find({ brandId: { $in: brands.map(b => b._id) } })
    .sort({ name: 1 })
    .lean();
  const modelsByBrand = new Map();
  for (const model of models) {
    const key = model.brandId.toString();
    if (!modelsByBrand.has(key)) modelsByBrand.set(key, []);
    modelsByBrand.get(key).push(model);
  }

  return {
    category: { id: root._id, name: root.name },
    services,
    brands: brands.map(brand => ({ ...brand, models: modelsByBrand.get(brand._id.toString()) || [] }))
  };
}
