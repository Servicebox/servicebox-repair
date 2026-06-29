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

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({
      isActive: true,
      isDeleted: false,
      ymlExport: true,
      new_price: { $gt: 0 },
    }).lean();

    console.log(`📦 YML: ${products.length} товаров найдено`);

    const categoriesMap = new Map();
    let categoryIdCounter = 1;

    products.forEach(product => {
      if (product.category && !categoriesMap.has(product.category)) {
        categoriesMap.set(product.category, categoryIdCounter++);
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru';

    // Удалены запрещённые элементы: <platform>, <version>, <agency>
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <company>ServiceBox35</company>
    <url>${escapeXml(baseUrl)}</url>
    <email>508828@bk.ru</email>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>`;

    for (const [categoryName, categoryId] of categoriesMap) {
      xml += `
      <category id="${categoryId}">${escapeXml(categoryName)}</category>`;
    }

    xml += `
    </categories>
    <offers>`;

    let exportedCount = 0;

    for (const product of products) {
      try {
        // Только товары с реальным наличием — всегда available="true"
        const available = Math.max(0, (product.quantity || 0) - (product.reservedQuantity || 0));
        if (available <= 0) continue;

        const productId = product.sku || product.vendorCode || product._id.toString();
        const categoryId = categoriesMap.get(product.category) || 1;

        // <price> — только число, без вложенных тегов
        const price = Number(product.new_price) || 0;
        const priceFormatted = price % 1 === 0 ? price.toString() : price.toFixed(2);

        // Габариты в сантиметрах: Длина/Ширина/Высота
        const dims = product.dimensions || {};
        const lengthCm = Number(dims.length) || 20;
        const widthCm  = Number(dims.width)  || 20;
        const heightCm = Number(dims.height) || 10;
        const dimensionsStr = `${lengthCm.toFixed(3)}/${widthCm.toFixed(3)}/${heightCm.toFixed(3)}`;

        const weightKg = Number(product.weight) || 0.5;

        // available="true" обязателен, недоступные товары пропущены выше
        xml += `
      <offer id="${escapeXml(productId)}" available="true">
        <url>${escapeXml(`${baseUrl}/product/${product.slug}`)}</url>
        <price>${priceFormatted}</price>`;

        const oldPrice = Number(product.old_price) || 0;
        if (oldPrice > price && oldPrice > 0) {
          const oldPriceFormatted = oldPrice % 1 === 0 ? oldPrice.toString() : oldPrice.toFixed(2);
          xml += `
        <oldprice>${oldPriceFormatted}</oldprice>`;
        }

        xml += `
        <currencyId>RUR</currencyId>
        <categoryId>${categoryId}</categoryId>`;

        if (product.images && product.images.length > 0) {
          product.images.slice(0, 10).forEach(img => {
            if (img) {
              const imageUrl = img.startsWith('http')
                ? img
                : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
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
        <manufacturer_warranty>${product.manufacturer_warranty ? 'true' : 'false'}</manufacturer_warranty>
        <country_of_origin>${escapeXml(product.country || 'Россия')}</country_of_origin>
        <delivery>${product.delivery ? 'true' : 'false'}</delivery>
        <pickup>${product.pickup !== false ? 'true' : 'false'}</pickup>
        <store>${product.store ? 'true' : 'false'}</store>
        <weight>${weightKg.toFixed(3)}</weight>
        <dimensions>${dimensionsStr}</dimensions>
        <param name="Производитель">${escapeXml(product.brand || product.vendor || 'ServiceBox35')}</param>
        <param name="Артикул">${escapeXml(product.vendorCode || product.sku || product.slug)}</param>
        <param name="Гарантия">12 месяцев</param>`;

        // Дополнительные параметры из product.params
        if (product.params && typeof product.params === 'object') {
          const params = product.params instanceof Map
            ? Object.fromEntries(product.params)
            : product.params;

          const builtinKeys = new Set(['Производитель', 'Артикул', 'Гарантия']);
          Object.entries(params).forEach(([key, value]) => {
            if (key && value != null && !builtinKeys.has(key)) {
              xml += `
        <param name="${escapeXml(key)}">${escapeXml(String(value))}</param>`;
            }
          });
        }

        xml += `
      </offer>`;

        exportedCount++;

      } catch (err) {
        console.error(`Ошибка товара ${product?._id}:`, err);
      }
    }

    xml += `
    </offers>
  </shop>
</yml_catalog>`;

    console.log(`✅ YML: экспортировано ${exportedCount} из ${products.length} товаров`);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-YML-Count': exportedCount.toString(),
      },
    });

  } catch (error) {
    console.error('Ошибка генерации YML:', error);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <url>https://servicebox35.ru</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories/>
    <offers/>
  </shop>
</yml_catalog>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
