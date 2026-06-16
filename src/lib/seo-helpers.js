import { BUSINESS, BASE_URL, SEO_DEFAULTS } from './constants';

// ✅ Переиспользуемая схема LocalBusiness (для layout.js)
export const LOCAL_BUSINESS_SCHEMA = {
    '@type': ['LocalBusiness', 'ElectronicsStore'],
    '@id': `${BASE_URL}#business`,
    name: BUSINESS.name,
    alternateName: ['Сервис Бокс', 'СервисБокс Вологда', 'ServiceBox35'],
    url: BASE_URL,
    telephone: [BUSINESS.phones.primary, BUSINESS.phones.secondary],
    email: BUSINESS.email,
    priceRange: '₽₽',
    address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.mainAddress.street,
        addressLocality: BUSINESS.mainAddress.city,
        addressRegion: BUSINESS.mainAddress.region,
        postalCode: BUSINESS.mainAddress.postalCode,
        addressCountry: BUSINESS.mainAddress.country,
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: BUSINESS.coordinates.latitude,
        longitude: BUSINESS.coordinates.longitude,
    },
    openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: BUSINESS.hours.open,
        closes: BUSINESS.hours.close,
    }],
    // ✅ aggregateRating только ОДИН раз внутри LocalBusiness
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: BUSINESS.rating.value,
        reviewCount: BUSINESS.rating.count,
        bestRating: BUSINESS.rating.bestRating,
        worstRating: BUSINESS.rating.worstRating,
    },
    // ✅ Добавляем массив review прямо в LocalBusiness (вместо отдельных Review)
    review: [
        {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Даня Г.' },
            datePublished: '2025-08-10',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: 5,
                bestRating: 5,
            },
            reviewBody: 'Сдал компьютер в сервис. Пришёл в 17:00, думал придётся ехать дважды, но мастер задержался и выполнил чистку за один визит. Температура CPU упала на 20°C! Работают до 19:00 — очень удобно.',
        },
        {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Артур П.' },
            datePublished: '2025-11-20',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: 5,
                bestRating: 5,
            },
            reviewBody: 'Обращался несколько раз по ремонту iPhone. Всё делают быстро, без навязывания лишних услуг. Андрею отдельное спасибо — всегда идёт навстречу!',
        },
        {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Егор' },
            datePublished: '2025-05-18',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: 5,
                bestRating: 5,
            },
            reviewBody: 'Починили смартфон в тот же день! Объяснили всё по шагам, дали рекомендации. Доброжелательное общение и профессиональный подход. Рекомендую!',
        },
    ],
    areaServed: { '@type': 'City', name: BUSINESS.mainAddress.city },
    foundingDate: BUSINESS.foundingDate,
    sameAs: [BUSINESS.socials.vk, BUSINESS.socials.telegram],
};

// ✅ Хлебные крошки
export function createBreadcrumbList(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// ✅ Универсальная функция для парсинга duration в ISO 8601
export function parseDurationToISO(durationStr) {
    if (!durationStr) return 'PT30M';

    const numbers = durationStr.match(/\d+/g);
    if (!numbers) return 'PT30M';

    // Если есть диапазон (например "30-60 минут") — берём среднее
    if (numbers.length >= 2) {
        const avg = Math.round((parseInt(numbers[0]) + parseInt(numbers[1])) / 2);
        return avg >= 60 ? `PT${Math.round(avg / 60)}H${avg % 60}M` : `PT${avg}M`;
    }

    const minutes = parseInt(numbers[0]);
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `PT${hours}H${mins}M` : `PT${hours}H`;
    }
    return `PT${minutes}M`;
}

// ✅ Очистка HTML-тегов из текста (для Schema.org text fields)
export function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ✅ Генерация метаданных страницы
export function generatePageMetadata(pathname, customMeta = {}) {
    const cleanPath = pathname.split('?')[0];

    return {
        title: customMeta.title || SEO_DEFAULTS.title,
        description: customMeta.description || SEO_DEFAULTS.description,
        keywords: customMeta.keywords || SEO_DEFAULTS.keywords,
        alternates: {
            canonical: `${BASE_URL}${cleanPath}`,
        },
        openGraph: {
            title: customMeta.title || SEO_DEFAULTS.title,
            description: customMeta.description || SEO_DEFAULTS.description,
            url: `${BASE_URL}${cleanPath}`,
            siteName: BUSINESS.shortName,
            type: 'website',
            locale: 'ru_RU',
            images: [{
                url: `${BASE_URL}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: customMeta.title || BUSINESS.shortName,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: customMeta.title || SEO_DEFAULTS.title,
            description: customMeta.description || SEO_DEFAULTS.description,
            images: [`${BASE_URL}/og-image.jpg`],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}