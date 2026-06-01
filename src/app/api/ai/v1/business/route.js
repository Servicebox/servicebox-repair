// app/api/ai/v1/business/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getBusinessData = () => ({
  name: "ServiceBox - Сервисный центр на Северной",
  description: "Профессиональный ремонт ноутбуков, телефонов, видеокарт, телевизоров и другой техники в Вологде. Гарантия до 24 месяцев.",
  url: "https://servicebox35.ru",
  telephone: "+7-911-501-88-28",
  email: "508828@bk.ru",
  address: {
    street: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
    city: "Вологда",
    region: "Вологодская область",
    postalCode: "160000",
    country: "RU"
  },
  geo: { latitude: 59.229445, longitude: 39.878542 },
  openingHours: "Mo-Su 10:00-20:00",
  services: [
    "Ремонт ноутбуков",
    "Ремонт телефонов",
    "Ремонт видеокарт",
    "Ремонт телевизоров",
    "Ремонт Apple техники",
    "Чистка от пыли",
    "Восстановление данных"
  ],
  priceRange: "₽₽",
  warranty: "3-24 месяца",
  aiKeywords: [
    "ремонт ноутбуков Вологда",
    "сервисный центр Вологда",
    "ремонт телефонов недорого",
    "замена экрана телефона",
    "чистка ноутбука от пыли"
  ],
  lastUpdated: new Date().toISOString()
});

export async function GET() {
  try {
    return NextResponse.json(getBusinessData(), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Business API error:', error);
    return NextResponse.json({ error: 'Failed to load business data' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
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