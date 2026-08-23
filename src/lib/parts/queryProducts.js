// src/lib/parts/queryProducts.js
import Product from '../../models/Product.js';
import OptfmCategory from '../../models/OptfmCategory.js';

const PAGE_SIZE = 24;

/**
 * Возвращает id категории и всех её потомков любой глубины одним запросом
 * ($graphLookup по дереву parentId) — нужно, чтобы при просмотре широкой
 * категории показывались товары из всех вложенных подкатегорий, а не
 * только напрямую привязанные к ней. Дерево маленькое (259 узлов),
 * запрос дешёвый — материализованный путь не нужен (YAGNI).
 */
export async function resolveCategoryDescendantIds(categoryId) {
  const result = await OptfmCategory.aggregate([
    { $match: { _id: categoryId } },
    {
      $graphLookup: {
        from: 'optfmcategories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
      },
    },
    { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
  ]);

  return result[0]?.ids || [categoryId];
}

/**
 * Возвращает id всех категорий, у которых есть хотя бы один активный товар
 * в самой категории или у любого потомка. Нужно, чтобы не индексировать
 * пустые страницы каталога (обнаружено при SEO-аудите 2026-08-23: 53 из 260
 * категорий не содержат товаров нигде в поддереве — это тонкий контент,
 * который сам по себе не приносит пользы и портит общий сигнал качества
 * сайта в глазах поисковика).
 */
export async function getCategoryIdsWithProducts() {
  const categories = await OptfmCategory.find({}).select('parentId').lean();
  const directCounts = await Product.aggregate([
    { $match: { isActive: true, isDeleted: false, categoryId: { $ne: null } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const directCountMap = new Map(directCounts.map((d) => [String(d._id), d.count]));

  const childrenMap = new Map();
  for (const c of categories) {
    const parentKey = c.parentId ? String(c.parentId) : null;
    if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, []);
    childrenMap.get(parentKey).push(String(c._id));
  }

  const memo = new Map();
  function hasProducts(id) {
    if (memo.has(id)) return memo.get(id);
    memo.set(id, false); // защита от цикла, если данные поставщика вдруг противоречивы
    const direct = directCountMap.get(id) || 0;
    const children = childrenMap.get(id) || [];
    const result = direct > 0 || children.some((childId) => hasProducts(childId));
    memo.set(id, result);
    return result;
  }

  const result = new Set();
  for (const c of categories) {
    const id = String(c._id);
    if (hasProducts(id)) result.add(id);
  }
  return result;
}

export async function queryProducts({ categoryId, search, minPrice, maxPrice, sort, page = 1 } = {}) {
  const query = { isActive: true, isDeleted: false };

  if (categoryId) {
    const categoryIds = await resolveCategoryDescendantIds(categoryId);
    query.categoryId = { $in: categoryIds };
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (minPrice != null || maxPrice != null) {
    query.new_price = {};
    if (minPrice != null) query.new_price.$gte = minPrice;
    if (maxPrice != null) query.new_price.$lte = maxPrice;
  }

  const sortSpec =
    sort === 'price_asc' ? { new_price: 1 } : sort === 'price_desc' ? { new_price: -1 } : { createdAt: -1 };

  const safePage = Math.max(1, Number(page) || 1);
  const total = await Product.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const items = await Product.find(query)
    .select('name slug images new_price old_price category subcategory quantity')
    .sort(sortSpec)
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return { items, total, page: safePage, pages };
}
