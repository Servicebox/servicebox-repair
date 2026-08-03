// src/lib/optfm/syncProducts.js
import Product from '../../models/Product.js';
import OptfmCategory from '../../models/OptfmCategory.js';
import { generateUniqueSlug } from '../slugify.js';
import { optfmRequest } from './client.js';
import { getMarkupPercent } from './config.js';
import { ensureProductImage, productImagePublicUrl } from './downloadProductImage.js';

const PAGE_LIMIT = 1000;
const SUPPLIER_SOURCE = 'optfm';
// id типа цены "Оптовая" у поставщика — подтверждено живым запросом
// к API 2026-08-03 (см. спеку)
const WHOLESALE_PRICE_ID = 4;

/**
 * Находит закупочную (оптовую) цену в массиве prices от поставщика.
 * Ищет по id/названию, а не по позиции в массиве — порядок элементов
 * документацией API не гарантирован.
 */
function resolveWholesalePrice(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null;
  const byId = prices.find((p) => Number(p.id) === WHOLESALE_PRICE_ID);
  if (byId) return Number(byId.price);
  const byName = prices.find((p) => /опт/i.test(p.name || ''));
  if (byName) return Number(byName.price);
  return Number(prices[0].price);
}

/**
 * Строит отображаемые category/subcategory (плоские строки) из дерева
 * OptfmCategory — для обратной совместимости с /parts и YML-фидами,
 * которые пока читают эти строковые поля, а не дерево напрямую.
 * category — имя корневой категории, subcategory — оставшийся путь до
 * листа.
 */
async function resolveCategoryDisplayNames(category) {
  if (!category) return { category: 'Товары поставщика', subcategory: '' };
  if (!category.parentId) return { category: category.name, subcategory: '' };

  const chain = [category.name];
  let current = category;
  while (current.parentId) {
    current = await OptfmCategory.findById(current.parentId).select('name parentId').lean();
    if (!current) break;
    chain.unshift(current.name);
  }

  return { category: chain[0], subcategory: chain.slice(1).join(' / ') };
}

export async function syncProducts() {
  const markupPercent = await getMarkupPercent();
  const seenSupplierIds = [];
  let productsUpserted = 0;
  let imagesDownloaded = 0;
  let page = 1;

  while (true) {
    const { response } = await optfmRequest('catalog.getElementList', {
      limit: PAGE_LIMIT,
      page,
      no_image: 1, // изображение получаем отдельно через catalog.getImage
    });

    for (const item of response.items) {
      const supplierProductId = String(item.id);
      seenSupplierIds.push(supplierProductId);

      const wholesalePrice = resolveWholesalePrice(item.prices);
      if (wholesalePrice == null || wholesalePrice <= 0) {
        console.warn(`⚠️  OPTFM: у товара ${item.id} (${item.name}) нет цены — пропускаю`);
        continue;
      }

      const category = await OptfmCategory.findOne({ supplierSectionId: String(item.section_id) }).lean();
      const { category: categoryName, subcategory } = await resolveCategoryDisplayNames(category);

      const downloaded = await ensureProductImage(supplierProductId);
      if (downloaded) imagesDownloaded++;

      const newPrice = Math.round(wholesalePrice * (1 + markupPercent / 100) * 100) / 100;

      const update = {
        name: item.name,
        description: item.detail_text || item.preview_text || item.name,
        category: categoryName,
        subcategory,
        categoryId: category?._id,
        supplierSource: SUPPLIER_SOURCE,
        supplierProductId,
        supplierPriceRaw: wholesalePrice,
        new_price: newPrice,
        sku: item.article || '',
        vendorCode: item.article || '',
        gtin: item.barcode || '',
        images: [productImagePublicUrl(supplierProductId)],
        isActive: true,
        isDeleted: false,
      };

      const existing = await Product.findOne({ supplierProductId }).select('_id').lean();

      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: update });
      } else {
        const slug = await generateUniqueSlug(Product, item.name);
        await Product.create({ ...update, slug });
      }

      productsUpserted++;
    }

    if (response.items.length < PAGE_LIMIT) break;
    page++;
  }

  const deactivateResult = await Product.updateMany(
    {
      supplierSource: SUPPLIER_SOURCE,
      supplierProductId: { $nin: seenSupplierIds },
      isActive: true,
    },
    { $set: { isActive: false } }
  );

  return {
    productsUpserted,
    productsDeactivated: deactivateResult.modifiedCount,
    imagesDownloaded,
  };
}
