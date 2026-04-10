// app/api/services-yml/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let cache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000
};

const escapeXml = (text) => {
  if (text === null || text === undefined || text === '') return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const encodeUrlForXml = (url) => {
  return encodeURI(url).replace(/&/g, '&amp;');
};

const extractPriceValue = (priceText) => {
  if (!priceText) return { value: '0', from: 'false' };
  const priceStr = String(priceText).trim();
  const isFrom = priceStr.toLowerCase().includes('от') ||
    priceStr.startsWith('от') ||
    priceStr.startsWith('От');
  const match = priceStr.match(/[\d\s.,]+/);
  if (!match) return { value: '0', from: isFrom ? 'true' : 'false' };
  const value = match[0].replace(/\s/g, '').replace(',', '.');
  return {
    value: parseFloat(value) > 0 ? value : '0',
    from: isFrom ? 'true' : 'false'
  };
};

const generateOfferId = (service, index) => {
  let id = service.slug;
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '-', '_': '-', '/': '-', '\\': '-'
  };
  if (/[а-яА-Я]/.test(id)) {
    id = id.toLowerCase().split('').map(ch => translitMap[ch] || (/[a-z0-9-]/.test(ch) ? ch : '-')).join('');
    id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  if (id.length > 100) id = id.substring(0, 100);
  if (!id || id === '-') id = `service-${index + 1}`;
  return id;
};

const findRootCategory = (service, categories) => {
  if (!service.parent) return categories[0];
  const category = categories.find(cat => cat._id.toString() === service.parent.toString());
  return category || categories[0];
};

const generateYmlFeed = (services, categories) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
  const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<!DOCTYPE yml_catalog SYSTEM "shops.dtd">\n`;
  xml += `<yml_catalog date="${dateStr}">\n`;
  xml += `  <shop>\n`;
  xml += `    <name>ServiceBox35</name>\n`;
  xml += `    <company>ServiceBox35</company>\n`;
  xml += `    <url>${escapeXml(baseUrl)}</url>\n`;
  xml += `    <platform>Next.js</platform>\n`;
  xml += `    <version>1.0</version>\n`;
  xml += `    <email>508828@bk.ru</email>\n`;
  xml += `    <currencies>\n`;
  xml += `      <currency id="RUB" rate="1"/>\n`;
  xml += `    </currencies>\n`;

  xml += `    <categories>\n`;
  categories.forEach((category, idx) => {
    xml += `      <category id="${idx + 1}">${escapeXml(category.name)}</category>\n`;
  });
  xml += `    </categories>\n`;

  xml += `    <sets>\n`;
  services.forEach((service, idx) => {
    const setId = generateOfferId(service, idx);
    xml += `      <set id="${escapeXml(setId)}">\n`;
    xml += `        <name>${escapeXml(service.name)}</name>\n`;
    xml += `        <url>${encodeUrlForXml(`${baseUrl}/services/${service.slug}`)}</url>\n`;
    xml += `      </set>\n`;
  });
  xml += `    </sets>\n`;

  xml += `    <offers>\n`;
  services.forEach((service, idx) => {
    try {
      const priceData = extractPriceValue(service.price);
      const serviceId = generateOfferId(service, idx);
      const rootCategory = findRootCategory(service, categories);
      const categoryId = categories.findIndex(cat => cat._id.toString() === rootCategory._id.toString()) + 1;

      // ✅ Исправлено: в теге name указываем название организации (ServiceBox35)
      // Название услуги передается в теге model и description
      const organizationName = 'ServiceBox35';
      const serviceName = service.name;

      xml += `      <offer id="${escapeXml(serviceId)}" type="vendor.model">\n`;
      xml += `        <name>${escapeXml(organizationName)}</name>\n`;
      xml += `        <url>${encodeUrlForXml(`${baseUrl}/services/${service.slug}`)}</url>\n`;
      if (priceData.from === 'true') {
        xml += `        <price from="true">${priceData.value}</price>\n`;
      } else {
        xml += `        <price>${priceData.value}</price>\n`;
      }
      xml += `        <currencyId>RUB</currencyId>\n`;
      xml += `        <categoryId>${categoryId}</categoryId>\n`;
      xml += `        <picture>${encodeUrlForXml(`${baseUrl}/images/Devices.webp`)}</picture>\n`;
      xml += `        <description>${escapeXml(service.description || service.name)}</description>\n`;
      xml += `        <model>${escapeXml(serviceName)}</model>\n`;
      xml += `        <vendor>ServiceBox35</vendor>\n`;
      xml += `        <sales_notes>Ремонт в сервисном центре</sales_notes>\n`;
      xml += `        <expiry>P30D</expiry>\n`;
      xml += `        <set-ids>${escapeXml(serviceId)}</set-ids>\n`;

      // Контакты
      xml += `        <param name="Ссылка на телефон">${encodeUrlForXml(`${baseUrl}/contacts`)}</param>\n`;
      xml += `        <param name="Ссылка на чат">${encodeUrlForXml(`${baseUrl}/chat`)}</param>\n`;
      xml += `        <param name="Ссылка на создание заказа">${encodeUrlForXml(`${baseUrl}/order?service=${service.slug}`)}</param>\n`;
      xml += `        <param name="Ссылка на профиль исполнителя">${encodeUrlForXml(`${baseUrl}/about`)}</param>\n`;

      // Условия услуги
      xml += `        <param name="Исполнитель проверен">true</param>\n`;
      xml += `        <param name="Организация">true</param>\n`;
      xml += `        <param name="Выполняется удаленно">false</param>\n`;
      xml += `        <param name="Выполняется по адресу исполнителя">true</param>\n`;
      xml += `        <param name="Выполняется по адресу заказчика">false</param>\n`;
      xml += `        <param name="Бригада">false</param>\n`;
      xml += `        <param name="Об исполнителе">${escapeXml(service.description || 'Профессиональный ремонт техники')}</param>\n`;

      // Детали услуги
      xml += `        <param name="Время выполнения">1-3 дня</param>\n`;
      xml += `        <param name="Выезд мастера">нет</param>\n`;
      xml += `        <param name="Гарантия на работу">30 дней</param>\n`;
      xml += `        <param name="Оплата">Картой, наличными, онлайн</param>\n`;
      xml += `        <param name="Время работы">Пн-Пт 10:00-19:00, Сб и Вскр- выходной</param>\n`;
      xml += `        <param name="Адрес сервисного центра">г. Вологда, ул. Северная, д.7а</param>\n`;

      xml += `        <param name="Рейтинг">5.0</param>\n`;
      xml += `        <param name="Число отзывов">127</param>\n`;
      xml += `        <param name="Регион">Вологодская область, Вологда</param>\n`;
      xml += `        <param name="Конверсия">15</param>\n`;
      xml += `        <param name="Годы опыта">9</param>\n`;

      xml += `      </offer>\n`;
    } catch (error) {
      console.error(`Ошибка обработки услуги ${service.name}:`, error);
    }
  });
  xml += `    </offers>\n`;
  xml += `  </shop>\n`;
  xml += `</yml_catalog>`;

  return xml;
};

export async function GET(request) {
  try {
    console.log('🔄 Запрос YML фида...');
    const now = Date.now();
    const forceRefresh = request.url.includes('refresh');

    if (!forceRefresh && cache.data && (now - cache.timestamp) < cache.ttl) {
      console.log('📦 Возвращаем из кэша');
      return new Response(cache.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Services-YML-Cache': 'true'
        }
      });
    }

    await dbConnect();

    const categories = await Service.find({ isCategory: true, parent: null })
      .sort({ order: 1, name: 1 })
      .lean();

    const services = await Service.find({ isCategory: false })
      .sort({ order: 1, name: 1 })
      .limit(200)
      .lean();

    console.log(`📊 Найдено ${services.length} услуг и ${categories.length} категорий`);

    if (!services.length) {
      return new Response(getEmptyXml(), {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
      });
    }

    const xml = generateYmlFeed(services, categories);
    cache.data = xml;
    cache.timestamp = now;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Services-YML-Count': services.length.toString()
      }
    });
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return new Response(getErrorXml(), {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
  }
}

const getEmptyXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <url>https://servicebox35.ru</url>
    <currencies><currency id="RUB" rate="1"/></currencies>
    <categories><category id="1">Прочие услуги</category></categories>
    <sets/><offers/>
  </shop>
</yml_catalog>`;

const getErrorXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <url>https://servicebox35.ru</url>
    <currencies><currency id="RUB" rate="1"/></currencies>
    <categories><category id="1">Прочие услуги</category></categories>
    <sets/><offers/>
  </shop>
</yml_catalog>`;