import { BUSINESS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 7200;

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

  const emergencyData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        serviceType: 'Экстренная помощь и инструкции при поломках электроники',
        name: 'СЕРВИС БОКС - Первая помощь технике',
        // Самодостаточный provider (не только @id) — этот @graph состоит
        // из одного узла, в нём нет LocalBusiness-ноды с этим @id вообще,
        // так что ссылка была заведомо пустой для любого потребителя
        // (Яндекс.Вебмастер, 2026-10-23: telephone/address не определены
        // для Service). contactPoint перенесён на provider — на самом
        // Service его не было в спецификации (это свойство Organization/
        // LocalBusiness/Person), а contactType: 'customer support' нёс
        // смысл, который жалко терять — независимый аудит, 2026-10-23.
        provider: {
          '@type': ['LocalBusiness', 'ElectronicsStore'],
          '@id': `${BASE_URL}#business`,
          name: BUSINESS.name,
          telephone: BUSINESS.phones.primary,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: BUSINESS.phones.primary,
            contactType: 'customer support',
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: BUSINESS.mainAddress.street,
            addressLocality: BUSINESS.mainAddress.city,
            addressRegion: BUSINESS.mainAddress.region,
            postalCode: BUSINESS.mainAddress.postalCode,
            addressCountry: BUSINESS.mainAddress.country,
          },
        },
        areaServed: { '@type': 'City', name: 'Вологда' },
        subjectOf: {
          '@type': 'HowTo',
          name: 'Телефон или ноутбук упал в воду',
          description: 'Что делать немедленно после попадания влаги',
          totalTime: 'PT15M',
          step: [
            { '@type': 'HowToStep', position: 1, text: 'Немедленно выключите устройство (зажмите кнопку питания).' },
            { '@type': 'HowToStep', position: 2, text: 'Отключите от зарядки и извлеките SIM-карту.' },
            { '@type': 'HowToStep', position: 3, text: 'НЕ сушите феном, на батарее и не кладите в рис (это миф).' },
            { '@type': 'HowToStep', position: 4, text: 'Аккуратно промокните влагу салфеткой.' },
            { '@type': 'HowToStep', position: 5, text: 'Принесите в СЕРВИС БОКС (Северная 7А) в течение 24 часов для ультразвуковой чистки.' }
          ]
        }
      }
    ],
    lastUpdated: new Date().toISOString(),
  };

  return Response.json(emergencyData, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=7200',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}