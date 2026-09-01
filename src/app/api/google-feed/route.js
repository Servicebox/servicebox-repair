// app/api/google-feed/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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
    if (price === null || price === undefined || price <= 0) return '';
    // Формат: целое число, без копеек, валюта RUB (Google допускает и .00)
    const value = parseFloat(price).toFixed(0);
    return `${value} RUB`;
};

const getAvailability = (quantity) => {
    return quantity > 0 ? 'in stock' : 'out of stock';
};

const getCondition = (product) => {
    // Если есть явное поле condition
    if (product.condition) return product.condition;
    const desc = product.description || '';
    if (desc.includes('б/у') || desc.includes('Б/У') || product.isUsed) {
        return 'used';
    }
    return 'new';
};

const toAbsoluteUrl = (img, baseUrl) => {
    if (!img) return null;
    return img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
};

const getImageUrl = (product, baseUrl) => {
    // Приоритет: mainImage (если не заглушка), первый из images, затем null
    if (product.mainImage && product.mainImage !== '/images/placeholder.jpg') {
        return toAbsoluteUrl(product.mainImage, baseUrl);
    }
    if (product.images && product.images.length > 0) {
        return toAbsoluteUrl(product.images[0], baseUrl);
    }
    return null; // нет изображения – товар будет пропущен
};

export async function GET(request) {
    try {
        await dbConnect();

        const products = await Product.find({
            isActive: true,
            isDeleted: { $ne: true },
            ymlExport: true,
            // Дополнительно: исключаем товары без изображений, чтобы избежать ошибок Google
            $or: [
                { mainImage: { $ne: null, $ne: '/images/placeholder.jpg' } },
                { images: { $exists: true, $not: { $size: 0 } } }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
        xml += '<channel>\n';
        xml += `<title>СЕРВИС БОКС - Запчасти для ремонта техники</title>\n`;
        xml += `<link>${baseUrl}</link>\n`;
        xml += `<description>Оригинальные запчасти и аксессуары для ноутбуков, телефонов, телевизоров и другой электроники</description>\n`;

        for (const product of products) {
            // Проверка обязательных полей
            if (!product.name || !product.slug) continue;

            const id = product._id.toString();
            const title = product.name;
            let description = product.description || '';
            if (description.length > 5000) description = description.substring(0, 5000);
            const link = `${baseUrl}/product/${product.slug}`;
            const imageLink = getImageUrl(product, baseUrl);
            // Если нет изображения – пропускаем товар (иначе ошибка Google)
            if (!imageLink) continue;

            const price = formatPrice(product.new_price);
            if (!price) continue; // цена обязательна

            const availability = getAvailability(product.quantity);
            const condition = getCondition(product);
            // Не подставляем собственное название как бренд чужой продукции.
            // Нет реального бренда → тег <g:brand> не выводим (см. ниже).
            const brand = product.brand || '';
            // Наш sku/vendorCode — это внутренний/поставщицкий код, а не
            // manufacturer part number. Он имеет смысл для Google только в паре
            // с брендом; без бренда шлём его как MPN нельзя (риск неверного
            // сопоставления в Merchant). Поэтому <g:mpn> выводим только когда
            // бренд известен.
            const mpn = brand ? (product.sku || product.vendorCode || '') : '';
            const gtin = product.gtin || '';

            xml += '<item>\n';
            xml += `<g:id>${escapeXml(id)}</g:id>\n`;
            xml += `<g:title>${escapeXml(title)}</g:title>\n`;
            xml += `<g:description>${escapeXml(description)}</g:description>\n`;
            xml += `<g:link>${escapeXml(link)}</g:link>\n`;
            xml += `<g:image_link>${escapeXml(imageLink)}</g:image_link>\n`;
            xml += `<g:price>${price}</g:price>\n`;
            xml += `<g:availability>${availability}</g:availability>\n`;
            xml += `<g:condition>${condition}</g:condition>\n`;
            if (brand) {
                xml += `<g:brand>${escapeXml(brand)}</g:brand>\n`;
            }
            if (mpn) {
                xml += `<g:mpn>${escapeXml(mpn)}</g:mpn>\n`;
            }
            if (gtin) {
                xml += `<g:gtin>${escapeXml(gtin)}</g:gtin>\n`;
            }
            // mpn выводится только вместе с брендом (см. выше), поэтому !brand
            // уже покрывает !mpn — проверяем бренд и GTIN.
            if (!brand && !gtin) {
                xml += `<g:identifier_exists>no</g:identifier_exists>\n`;
            }
            // ⚠️ sale_price временно отключён, так как страницы товаров не всегда отображают старую цену корректно
            // Если хотите включить – раскомментируйте и убедитесь, что на сайте есть чёткая скидка
            // if (product.old_price && product.old_price > product.new_price) {
            //   xml += `<g:sale_price>${formatPrice(product.old_price)}</g:sale_price>\n`;
            // }
            xml += '</item>\n';
        }

        xml += '</channel>\n';
        xml += '</rss>';

        return new Response(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                'X-Robots-Tag': 'noindex',
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