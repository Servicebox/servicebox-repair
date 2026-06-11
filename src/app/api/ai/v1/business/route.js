import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

  const businessData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}#organization`,
    name: "ServiceBox - Сервисный центр на Северной",
    legalName: "ООО СЕРВИСБОКС",
    description: "Профессиональный ремонт ноутбуков, телефонов, видеокарт, телевизоров. BGA-пайка. Гарантия до 24 месяцев.",
    url: BASE,
    telephone: "+7-911-501-88-28",
    email: "508828@bk.ru",
    foundingDate: "2016",
    address: {
      '@type': 'PostalAddress',
      streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
      addressLocality: "Вологда",
      addressRegion: "Вологодская область",
      postalCode: "160000",
      addressCountry: "RU"
    },
    // ✅ E-E-A-T: Указываем обоих владельцев-мастеров
    founder: [
      {
        '@type': 'Person',
        name: 'Тома',
        jobTitle: 'Совладелец, BGA-инженер, MERN-разработчик'
      },
      {
        '@type': 'Person',
        name: 'Андрей Кознов',
        jobTitle: 'Основатель, мастер-диагност, программист'
      }
    ],
    sameAs: [
      "https://vk.com/servicebox35",
      "https://t.me/Tomkka",
      "https://yandex.ru/maps/org/servis_boks/58578899506/"
    ],
    lastUpdated: new Date().toISOString()
  };

  try {
    return NextResponse.json(businessData, {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8', // Изменено на ld+json для ИИ
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load business data' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}