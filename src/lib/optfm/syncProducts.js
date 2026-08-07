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

// У API поставщика нет отдельного поля бренда — только текст в name.
// Список получен статистически: посчитаны частоты капитализированных
// слов по 4300+ реальным названиям (2026-08-03), отобраны только явные
// бренды аксессуаров/запчастей. Слова вроде Xiaomi/Samsung/Apple туда
// намеренно не включены — это бренд УСТРОЙСТВА, с которым совместима
// запчасть ("совместим с iPhone"), а не бренд самой запчасти — пометить
// стороннюю запчасть как "Apple" было бы неверно и рискованно.
const KNOWN_BRANDS = ['YOLKKI', 'SmartBuy', 'WALKER', 'BOROFONE', 'REMAX', 'DENMEN', 'RELIFE', 'GoPower'];
const FALLBACK_BRAND = 'Совместимый аналог';

/**
 * Ищет известный бренд аксессуаров как отдельное слово в названии
 * товара. Возвращает FALLBACK_BRAND, если ни один не найден — вместо
 * дефолтного 'ServiceBox35' из схемы Product, который вводил бы в
 * заблуждение (мы не производитель этих товаров). См. баг 2026-08-03:
 * товары показывались с брендом "ServiceBox35" вместо реального
 * (например, REMAX), т.к. поле brand никогда не заполнялось при
 * синхронизации.
 */
function detectBrand(name) {
  for (const brand of KNOWN_BRANDS) {
    const re = new RegExp(`\\b${brand}\\b`, 'i');
    if (re.test(name)) return brand;
  }
  return FALLBACK_BRAND;
}

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
  // Становится true, если прогон прервался раньше последней страницы
  // (обычно из-за WAF поставщика — см. client.js). В этом случае ниже
  // отключаем деактивацию: иначе товары с недостигнутых страниц были бы
  // ошибочно помечены как пропавшие у поставщика, хотя они там есть —
  // баг воспроизведён 2026-08-06 (см. спеку, раздел про 503).
  let syncIncomplete = false;

  pageLoop: while (true) {
    let response;
    try {
      ({ response } = await optfmRequest('catalog.getElementList', {
        limit: PAGE_LIMIT,
        page,
        no_image: 1, // изображение получаем отдельно через catalog.getImage
      }));
    } catch (err) {
      console.error(`❌ OPTFM: не удалось получить страницу ${page} каталога — останавливаю прогон:`, err.message);
      syncIncomplete = true;
      break pageLoop;
    }

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

      // Сбой скачивания одной картинки не должен обрывать всю
      // синхронизацию — раньше исключение из ensureProductImage вылетало
      // из цикла и убивало все оставшиеся страницы целиком (баг
      // 2026-08-06: из-за частых 503 у поставщика это происходило почти
      // на каждом прогоне в случайном месте).
      let downloaded = false;
      try {
        downloaded = await ensureProductImage(supplierProductId);
      } catch (err) {
        console.warn(`⚠️  OPTFM: не удалось скачать фото товара ${item.id} — оставляю без нового фото:`, err.message);
      }
      if (downloaded) imagesDownloaded++;

      // Округляем до целого рубля в большую сторону — копейки в ценах
      // выглядят неаккуратно на витрине (по просьбе Тома, 2026-08-03).
      const newPrice = Math.ceil(wholesalePrice * (1 + markupPercent / 100));

      const brand = detectBrand(item.name);

      const update = {
        name: item.name,
        description: item.detail_text || item.preview_text || item.name,
        // vendor задаём явно, а не полагаемся на pre('save') хук схемы
        // Product (копирует vendor из brand только при .create(), но не
        // при updateOne() — для уже существующих товаров это не сработает).
        brand,
        vendor: brand,
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

  // Деактивируем "пропавшие у поставщика" товары только после ПОЛНОГО
  // прохода по каталогу — если прогон прервался раньше последней
  // страницы, seenSupplierIds заведомо неполный, и деактивация ошибочно
  // скрыла бы ещё существующие у поставщика товары с недостигнутых страниц.
  const deactivateResult = syncIncomplete
    ? { modifiedCount: 0 }
    : await Product.updateMany(
        {
          supplierSource: SUPPLIER_SOURCE,
          supplierProductId: { $nin: seenSupplierIds },
          isActive: true,
        },
        { $set: { isActive: false } }
      );

  if (syncIncomplete) {
    console.warn(`⚠️  OPTFM: прогон завершился не полностью (остановлен на странице ${page}) — деактивация пропущена`);
  }

  return {
    productsUpserted,
    productsDeactivated: deactivateResult.modifiedCount,
    imagesDownloaded,
    incomplete: syncIncomplete,
  };
}
