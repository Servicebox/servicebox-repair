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
        name: 'ServiceBox - Первая помощь технике',
        provider: { '@id': `${BASE_URL}#business` },
        areaServed: { '@type': 'City', name: 'Вологда' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+7-911-501-88-28',
          contactType: 'customer support'
        },
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
            { '@type': 'HowToStep', position: 5, text: 'Принесите в ServiceBox (Северная 7А) в течение 24 часов для ультразвуковой чистки.' }
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