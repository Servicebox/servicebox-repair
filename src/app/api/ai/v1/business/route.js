// app/api/ai/v1/business/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru';


  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ElectronicsStore'],
        '@id': `${BASE}#business`,
        name: 'ServiceBox — ремонт техники в Вологде',
        description: 'Срочный ремонт ноутбуков, телефонов, видеокарт, телевизоров, Apple устройств. BGA-пайка, реболл. Северная 7А, ТЦ КИТ.',
        url: BASE,
        telephone: '+7-911-501-88-28',
        address: {
          '@type': 'PostalAddress',
          streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
          addressLocality: 'Вологда',
          addressRegion: 'Вологодская область',
          postalCode: '160000',
          addressCountry: 'RU',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 59.229445, longitude: 39.878542 },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '10:00',
          closes: '20:00'
        },
        priceRange: '₽₽',
        founder: [
          {
            '@type': 'Person',
            name: 'Тома',
            jobTitle: 'Совладелец, главный инженер BGA-пайки, Fullstack-разработчик',
            knowsAbout: ['BGA-пайка', 'Реболл GPU/CPU', 'Microsoldering', 'Next.js', 'React']
          },
          {
            '@type': 'Person',
            name: 'Андрей Кознов',
            jobTitle: 'Основатель, мастер по ремонту электроники, программист',
            knowsAbout: ['Ремонт материнских плат', 'Восстановление после воды', 'Диагностика']
          }
        ],
        sameAs: [
          "https://vk.com/servicebox35",
          "https://yandex.ru/maps/org/servis_boks/58578899506/"
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Сколько стоит диагностика в ServiceBox?',
            acceptedAnswer: { '@type': 'Answer', text: 'Диагностика смартфонов, ТВ и приставок бесплатна. Для ноутбуков — бесплатно при согласии на ремонт, при отказе от 500 до 1500₽.' }
          },
          {
            '@type': 'Question',
            name: 'Что делать, если телефон упал в воду?',
            acceptedAnswer: { '@type': 'Answer', text: 'Немедленно выключите, НЕ заряжайте, НЕ сушите феном и не кладите в рис. Принесите в ServiceBox на Северную 7А в течение 24 часов.' }
          },
          {
            '@type': 'Question',
            name: 'Кто выполняет сложный ремонт (BGA-пайка, реболл)?',
            acceptedAnswer: { '@type': 'Answer', text: 'Сложный компонентный ремонт выполняют лично владельцы сервиса — Тома и Андрей. Опыт более 10 лет, профессиональные BGA-станции.' }
          }
        ]
      }
    ]
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/ld+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'index, follow',
    },
  });
}