// lib/constants.js
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

export const BUSINESS = {
    name: 'ServiceBox - Сервисный центр на Северной',
    shortName: 'ServiceBox Вологда',
    legalName: 'ООО "СЕРВИСБОКС"',

    email: '508828@bk.ru', // ✅ ЕДИНЫЙ EMAIL ВЕЗДЕ

    phones: {
        primary: '+7-911-501-88-28',
        secondary: '+7-911-501-06-96',
    },

    phonesFormatted: {
        primary: '+7 (911) 501-88-28',
        secondary: '+7 (911) 501-06-96',
    },

    // Основной адрес (Северная)
    mainAddress: {
        street: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
        streetShort: 'ул. Северная, 7А',
        city: 'Вологда',
        region: 'Вологодская область',
        postalCode: '160000',
        country: 'RU',
        landmark: 'ТЦ "КИТ"',
    },

    // Филиал (Ленина)
    branchAddress: {
        street: 'ул. Ленина д.6, этаж 1',
        streetShort: 'ул. Ленина, 6',
        city: 'Вологда',
    },

    coordinates: {
        latitude: 59.229445,
        longitude: 39.878542,
    },

    hours: {
        open: '10:00',
        close: '20:00',
        text: 'Ежедневно с 10:00 до 20:00',
    },

    socials: {
        vk: 'https://vk.com/servicebox35',
    },

    foundingDate: '2016',

    rating: {
        value: '5.0',
        count: '150',
        bestRating: '5',
        worstRating: '1',
    },

    ogp: '1213500018522',
    inn: '3525475916',
    kpp: '352501001',
};

export const SEO_DEFAULTS = {
    title: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    description: 'Ремонт ноутбуков, видеокарт, телефонов, телевизоров, Apple техники в Вологде. Сервисный центр на Северной, 7А. Ежедневно 10:00-20:00. Гарантия до 24 мес. Бесплатная диагностика.',
    keywords: 'ремонт ноутбуков Вологда, ремонт телефонов, сервисный центр, ремонт видеокарт, ремонт техники, ремонт Apple, чистка ноутбуков, переклейка стекол, ServiceBox, Северная 7А',
};