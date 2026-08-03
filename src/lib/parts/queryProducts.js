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
