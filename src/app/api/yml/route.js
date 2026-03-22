// app/api/yml/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

const escapeXml = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Функция для расчета доступного количества
const getAvailableQuantity = (product) => {
  const quantity = product.quantity || 0;
  const reserved = product.reservedQuantity || 0;
  const available = Math.max(0, quantity - reserved);

  // Для Яндекс.Маркет: если товар есть, но quantity=0, ставим 1
  if (available <= 0 && product.quantity > 0) {
    return 1;
  }

  return available;
};

export async function GET() {
  try {
    await dbConnect();

    // Получаем товары для YML
    const products = await Product.find({
      isActive: true,
      isDeleted: false,
      ymlExport: true,
      new_price: { $gt: 0 }
    }).lean();

    console.log(`📦 YML: ${products.length} товаров найдено`);

    // Категории
    const categoriesMap = new Map();
    let categoryIdCounter = 1;

    products.forEach(product => {
      if (product.category && !categoriesMap.has(product.category)) {
        categoriesMap.set(product.category, categoryIdCounter++);
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <company>ServiceBox35</company>
    <url>${escapeXml(baseUrl)}</url>
    <platform>Next.js</platform>
    <version>1.0</version>
    <agency>ServiceBox35</agency>
    <email>508828@bk.ru</email>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    
    <categories>`;

    // Категории
    for (const [categoryName, categoryId] of categoriesMap) {
      xml += `
      <category id="${categoryId}">${escapeXml(categoryName)}</category>`;
    }

    xml += `
    </categories>
    
    <offers>`;

    // Товары
    let totalWithCount = 0;

    for (const product of products) {
      try {
        // Рассчитываем доступное количество
        const availableQuantity = getAvailableQuantity(product);
        const isAvailable = availableQuantity > 0;

        if (isAvailable) totalWithCount++;

        // ID товара
        const productId = product.sku || product.vendorCode || product._id.toString();

        // Категория
        const categoryId = categoriesMap.get(product.category) || 1;

        // Цена
        const price = Number(product.new_price) || 0;
        const priceFormatted = price % 1 === 0 ? price.toString() : price.toFixed(2);

        // Габариты
        const dims = product.dimensions || {};
        const lengthCm = dims.length || 20;
        const widthCm = dims.width || 20;
        const heightCm = dims.height || 10;

        // Форматируем как 22.1/40.425/22.1 (Длина/Ширина/Высота)
        const dimensionsStr = `${lengthCm.toFixed(3)}/${widthCm.toFixed(3)}/${heightCm.toFixed(3)}`;

        // Вес
        const weightKg = product.weight || 0.5;
        const weightFormatted = weightKg.toFixed(1);

        xml += `
      <offer id="${escapeXml(productId)}" available="${isAvailable ? 'true' : 'false'}">
        <url>${escapeXml(`${baseUrl}/product/${product.slug}`)}</url>
        <price>${priceFormatted}</price>`;

        // Старая цена
        const oldPrice = Number(product.old_price) || 0;
        if (oldPrice > price && oldPrice > 0) {
          const oldPriceFormatted = oldPrice % 1 === 0 ? oldPrice.toString() : oldPrice.toFixed(2);
          xml += `
        <oldprice>${oldPriceFormatted}</oldprice>`;
        }

        xml += `
        <currencyId>RUR</currencyId>
        <categoryId>${categoryId}</categoryId>`;

        // Количество
        if (isAvailable && availableQuantity > 0) {
          xml += `
        <count>${availableQuantity}</count>`;
        }

        // Изображения
        if (product.images && product.images.length > 0) {
          product.images.slice(0, 10).forEach(img => {
            if (img) {
              const imageUrl = img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
              xml += `
        <picture>${escapeXml(imageUrl)}</picture>`;
            }
          });
        }

        xml += `
        <name>${escapeXml(product.name)}</name>
        <vendor>${escapeXml(product.vendor || product.brand || 'ServiceBox35')}</vendor>
        <vendorCode>${escapeXml(product.vendorCode || product.sku || product.slug)}</vendorCode>
        <description>${escapeXml(product.description || product.name)}</description>
        <sales_notes>${escapeXml(product.sales_notes || 'Минимальный заказ 1 шт.')}</sales_notes>
        <country_of_origin>${escapeXml(product.country || 'Россия')}</country_of_origin>
        <manufacturer_warranty>${product.manufacturer_warranty ? 'true' : 'false'}</manufacturer_warranty>
        <delivery>${product.delivery ? 'true' : 'false'}</delivery>
        <pickup>${product.pickup ? 'true' : 'false'}</pickup>
        <store>${product.store ? 'true' : 'false'}</store>
        <dimensions>${dimensionsStr}</dimensions>
        <weight>${weightFormatted}</weight>
        <param name="Вес">${weightKg.toFixed(2)} кг</param>
        <param name="Длина">${lengthCm.toFixed(1)} см</param>
        <param name="Ширина">${widthCm.toFixed(1)} см</param>
        <param name="Высота">${heightCm.toFixed(1)} см</param>
        <param name="Габариты (ДхШхВ)">${lengthCm.toFixed(1)}x${widthCm.toFixed(1)}x${heightCm.toFixed(1)} см</param>
        <param name="Производитель">${escapeXml(product.brand || 'ServiceBox35')}</param>
        <param name="Артикул">${escapeXml(product.vendorCode || product.sku || product.slug)}</param>
        <param name="Гарантия">12 месяцев</param>`;

        // Дополнительные параметры из params
        if (product.params && typeof product.params === 'object') {
          const params = product.params instanceof Map ?
            Object.fromEntries(product.params) : product.params;

          Object.entries(params).forEach(([key, value]) => {
            if (key && value && !['Вес', 'Длина', 'Ширина', 'Высота', 'Габариты (ДхШхВ)', 'Производитель', 'Артикул', 'Гарантия'].includes(key)) {
              xml += `
        <param name="${escapeXml(key)}">${escapeXml(value)}</param>`;
            }
          });
        }

        xml += `
      </offer>`;

      } catch (error) {
        console.error(`Ошибка товара ${product?._id}:`, error);
      }
    }

    xml += `
    </offers>
  </shop>
</yml_catalog>`;

    console.log(`✅ YML сформирован: ${products.length} товаров, ${totalWithCount} с количеством`);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-YML-Count': totalWithCount.toString()
      },
    });

  } catch (error) {
    console.error('Ошибка YML:', error);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <url>https://servicebox35.ru</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <offers/>
  </shop>
</yml_catalog>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}