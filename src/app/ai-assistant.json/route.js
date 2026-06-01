// app/ai-assistant.json/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    const BASE = process.env.SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

    const data = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'ServiceBox — ремонт техники в Вологде',
        description: 'Срочный ремонт ноутбуков, телефонов, видеокарт, телевизоров, Apple устройств в Вологде. Северная 7А, ТЦ КИТ. Ежедневно 10:00–20:00.',
        url: BASE,
        telephone: '+79115018828',
        address: {
            streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ', напротив эскалатора, рядом с Бристоль",
            addressLocality: 'Вологда',
            addressRegion: 'Вологодская область',
            postalCode: '160000',
            addressCountry: 'RU',
        },
        geo: { latitude: 59.229445, longitude: 39.878542 },
        openingHours: 'Mo-Su 10:00-20:00',
        priceRange: 'от 500₽',
        makesOffer: [
            { '@type': 'Offer', name: 'Диагностика', description: 'Бесплатно при ремонте, иначе от 500₽', price: '0', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Замена экрана телефона', price: '2000', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Замена аккумулятора телефона', price: '1500', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Ремонт материнской платы ноутбука', price: '2500', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Чистка ноутбука + термопаста', price: '1000', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Ремонт телевизора (подсветка)', price: '3000', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Ремонт видеокарты', price: '3500', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Восстановление данных', price: '1500', priceCurrency: 'RUB' },
            { '@type': 'Offer', name: 'Срочный ремонт (экспресс)', price: '500', priceCurrency: 'RUB' },
        ],
        faq: [
            { question: 'Сколько стоит диагностика?', answer: 'Бесплатно при ремонте. При отказе — от 500 до 1000₽.' },
            { question: 'Что делать, если телефон упал в воду?', answer: 'Выключить, не заряжать, не сушить. Сразу нести в ServiceBox на Северную 7А.' },
            { question: 'Даёте ли гарантию?', answer: 'Да, от 3 до 24 месяцев на работы и до 12 месяцев на запчасти.' },
            { question: 'Как быстро чините?', answer: 'Простые поломки — от 30 мин, сложные — от 1 до 7 дней.' },
        ],
        lastUpdated: new Date().toISOString(),
        inLanguage: 'ru',
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
            'Content-Type': 'application/ld+json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Robots-Tag': 'index, follow',
        },
    });
}