import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Функция для получения абсолютных URL изображений
const getAbsoluteImageUrls = (images, baseUrl) => {
  if (!images || !Array.isArray(images)) return [];
  return images.map(img => {
    if (!img) return `${baseUrl}/images/placeholder.jpg`;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${baseUrl}${img}`;
    return `${baseUrl}/images/${img}`;
  }).filter(Boolean);
};

// Экранирование XML
const escapeXml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
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
      quantity: { $gt: 0 }
    }).lean();

    const baseUrl = 'https://servicebox35.ru';
    const now = new Date();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${now.toISOString().slice(0, 19)}+03:00">
  <shop>
    <name>СЕРВИС БОКС</name>
    <company>СЕРВИС БОКС</company>
    <url>${baseUrl}</url>
    <platform>Next.js</platform>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    
    <categories>
      <category id="91537">Аксессуары</category>
      <category id="91491" parentId="91537">Смартфоны и телефоны</category>
      <category id="91013" parentId="91537">Ноутбуки и компьютеры</category>
      <category id="90639" parentId="91537">Телевизоры и видео</category>
    </categories>
    
    <delivery-options>
      <option cost="0" days="1-3"/>
    </delivery-options>
    
    <offers>\n`;

    for (const product of products) {
      const categoryId = product.yandexCategoryId || 91537;
      const images = getAbsoluteImageUrls(product.images, baseUrl);
      const availableQuantity = Math.max(0, product.quantity - (product.reservedQuantity || 0));

      xml += `      <offer id="${product.sku || product._id}" available="${availableQuantity > 0 ? 'true' : 'false'}">
        <url>${baseUrl}/product/${product.slug}</url>
        <price>${product.new_price}</price>
        <currencyId>RUB</currencyId>
        <categoryId>${categoryId}</categoryId>`;

      // Первое изображение обязательно
      if (images.length > 0) {
        xml += `\n        <picture>${escapeXml(images[0])}</picture>`;
      }

      // Дополнительные изображения
      images.slice(1, 10).forEach(img => {
        xml += `\n        <picture>${escapeXml(img)}</picture>`;
      });

      xml += `
        <name>${escapeXml(product.name)}</name>
        <vendor>${escapeXml(product.vendor || product.brand || 'СЕРВИС БОКС')}</vendor>
        <vendorCode>${escapeXml(product.vendorCode || product.sku || '')}</vendorCode>
        <description>${escapeXml(product.description || product.name)}</description>`;

      if (product.old_price > product.new_price) {
        xml += `\n        <oldprice>${product.old_price}</oldprice>`;
      }

      // Базовые параметры
      xml += `
        <param name="Наличие">${availableQuantity > 0 ? 'В наличии' : 'Под заказ'}</param>
        <param name="Гарантия">90 дней</param>
        <param name="Тип">${escapeXml(product.category)}</param>`;

      // Спецификации
      if (product.specifications && product.specifications instanceof Map) {
        for (const [key, value] of product.specifications.entries()) {
          if (key && value) {
            xml += `\n        <param name="${escapeXml(key)}">${escapeXml(value)}</param>`;
          }
        }
      }

      xml += `\n      </offer>\n`;
    }

    xml += `    </offers>\n  </shop>\n</yml_catalog>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });

  } catch (error) {
    console.error('YML Error:', error);

    // Fallback XML
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19)}+03:00">
  <shop>
    <name>СЕРВИС БОКС</name>
    <company>СЕРВИС БОКС</company>
    <url>https://servicebox35.ru</url>
    <offers/>
  </shop>
</yml_catalog>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}