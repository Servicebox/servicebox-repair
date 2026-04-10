// app/api/google-feed/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // кэш на 1 час

const escapeXml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return `${parseFloat(price).toFixed(2)} RUB`;
};

const getAvailability = (quantity) => {
    return quantity > 0 ? 'in stock' : 'out of stock';
};

const getCondition = (product) => {
    // Если есть явное поле condition
    if (product.condition) return product.condition;
    // Проверяем описание на наличие признаков б/у
    const desc = product.description || '';
    if (desc.includes('б/у') || desc.includes('Б/У') || product.isUsed) {
        return 'used';
    }
    return 'new';
};

export async function GET(request) {
    try {
        await dbConnect();

        // Получаем только активные товары, не удалённые, с включённым экспортом
        const products = await Product.find({
            isActive: true,
            isDeleted: { $ne: true },
            ymlExport: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
        const now = new Date().toISOString();

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
        xml += '<channel>\n';
        xml += `<title>ServiceBox35 - Запчасти для ремонта техники</title>\n`;
        xml += `<link>${baseUrl}</link>\n`;
        xml += `<description>Оригинальные запчасти и аксессуары для ноутбуков, телефонов, телевизоров и другой электроники</description>\n`;

        for (const product of products) {
            // ✅ g:id – используем _id (уникальный, стабильный)
            const id = product._id.toString();

            // ✅ g:title – название товара
            const title = product.name;

            // ✅ g:description – чистим от HTML, укорачиваем при необходимости
            let description = product.description || '';
            if (description.length > 5000) description = description.substring(0, 5000);
            description = escapeXml(description);

            // ✅ g:link – ссылка на страницу товара
            const link = `${baseUrl}/product/${product.slug}`;

            // ✅ g:image_link – первое изображение или заглушка
            let imageLink = product.mainImage;
            if (!imageLink || imageLink === '/images/placeholder.jpg') {
                imageLink = product.images?.[0];
            }
            if (!imageLink) {
                imageLink = `${baseUrl}/images/placeholder.jpg`;
            }
            imageLink = escapeXml(imageLink);

            // ✅ g:price – цена с валютой
            const price = formatPrice(product.new_price);

            // ✅ g:availability – наличие на складе
            const availability = getAvailability(product.quantity);

            // ✅ g:condition – состояние товара
            const condition = getCondition(product);

            // ✅ g:brand – бренд (если нет, то название магазина)
            const brand = product.brand || 'ServiceBox35';

            // ✅ g:mpn – артикул производителя (sku или vendorCode)
            const mpn = product.sku || product.vendorCode || product._id;

            // ✅ g:gtin – если есть
            const gtin = product.gtin || '';

            xml += '<item>\n';
            xml += `<g:id>${escapeXml(id)}</g:id>\n`;
            xml += `<g:title>${escapeXml(title)}</g:title>\n`;
            xml += `<g:description>${description}</g:description>\n`;
            xml += `<g:link>${escapeXml(link)}</g:link>\n`;
            xml += `<g:image_link>${imageLink}</g:image_link>\n`;
            xml += `<g:price>${price}</g:price>\n`;
            xml += `<g:availability>${availability}</g:availability>\n`;
            xml += `<g:condition>${condition}</g:condition>\n`;
            xml += `<g:brand>${escapeXml(brand)}</g:brand>\n`;
            xml += `<g:mpn>${escapeXml(mpn)}</g:mpn>\n`;
            if (gtin) {
                xml += `<g:gtin>${escapeXml(gtin)}</g:gtin>\n`;
            }
            if (product.old_price && product.old_price > product.new_price) {
                xml += `<g:sale_price>${formatPrice(product.old_price)}</g:sale_price>\n`;
            }
            xml += '</item>\n';
        }

        xml += '</channel>\n';
        xml += '</rss>';

        return new Response(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                'X-Robots-Tag': 'noindex', // чтобы фид не индексировался поисковиками
            },
        });
    } catch (error) {
        console.error('Ошибка генерации Google фида:', error);
        return new Response(
            '<?xml version="1.0" encoding="UTF-8"?>\n<error>Internal Server Error</error>',
            { status: 500, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
        );
    }
}