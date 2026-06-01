// app/api/ai/v1/emergency/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 7200;

export async function GET() {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  const BASE_URL = IS_PRODUCTION
    ? process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'
    : process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

  const emergencyData = {
    '@context': 'https://schema.org',
    '@type': 'EmergencyService',
    name: 'ServiceBox - Экстренная помощь при поломках',
    description: 'Пошаговые инструкции по первой помощи для электроники при повреждениях до обращения в сервис',
    provider: {
      '@type': 'ElectronicsRepairService',
      '@id': `${BASE_URL}#business`,
      name: 'ServiceBox',
      url: BASE_URL,
      telephone: '+7-911-501-88-28',
      address: {
        '@type': 'PostalAddress',
        streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
        addressLocality: 'Вологда',
        addressRegion: 'Вологодская область',
        postalCode: '160000',
        addressCountry: 'RU',
      },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: BASE_URL,
      servicePhone: '+7-911-501-88-28',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        opens: '10:00',
        closes: '20:00',
      },
    },
    instruction: [
      {
        '@type': 'HowTo',
        name: 'Телефон или ноутбук упал в воду',
        description: 'Что делать немедленно после попадания влаги в устройство',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Немедленно выключите устройство', text: '...' },
          { '@type': 'HowToStep', position: 2, name: 'Отключите от зарядки и извлеките аккумулятор', text: '...' },
          { '@type': 'HowToStep', position: 3, name: 'Не сушите феном, на батарее или в рисе', text: '...' },
          { '@type': 'HowToStep', position: 4, name: 'Аккуратно промокните влагу', text: '...' },
          { '@type': 'HowToStep', position: 5, name: 'Как можно скорее принесите в сервис', text: '...' },
        ],
        estimatedCost: {
          '@type': 'PriceSpecification',
          minPrice: 1000,
          maxPrice: 5000,
          priceCurrency: 'RUB',
          description: 'Зависит от степени повреждения',
        },
        totalTime: 'PT30M',
        keywords: ['телефон в воде', 'ноутбук залит'],
      },
      // ... остальные инструкции можно оставить как у вас
    ],
    contactForEmergency: {
      '@type': 'ContactPoint',
      telephone: '+7-911-501-88-28',
      contactType: 'emergency support',
    },
    areaServed: { '@type': 'City', name: 'Вологда' },
    url: `${BASE_URL}/api/ai/v1/emergency`,
    lastUpdated: new Date().toISOString(),
  };

  return Response.json(emergencyData, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=7200, stale-while-revalidate=86400',
      'X-AI-Ready': 'true',
      'X-Emergency-Endpoint': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      Link: `<${BASE_URL}#business>; rel="provider"`,
    },
  });
}

export async function OPTIONS() {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  const BASE_URL = IS_PRODUCTION
    ? process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'
    : process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
      Link: `<${BASE_URL}/api/ai/v1/emergency>; rel="canonical"`,
    },
  });
}