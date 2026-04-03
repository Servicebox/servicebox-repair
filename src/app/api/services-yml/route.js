// app/api/services-yml/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Кэш
let cache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000
};

// Безопасное экранирование XML
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

// Кодирование URL для XML
const encodeUrlForXml = (url) => {
  // Кодируем кириллицу и специальные символы
  return encodeURI(url).replace(/&/g, '&amp;');
};

// Извлечение цены
const extractPriceValue = (priceText) => {
  if (!priceText) return { value: '0', from: 'false' };

  const priceStr = String(priceText).trim();
  const isFrom = priceStr.toLowerCase().includes('от') ||
    priceStr.startsWith('от') ||
    priceStr.startsWith('От');

  const match = priceStr.match(/[\d\s.,]+/);
  if (!match) return { value: '0', from: isFrom ? 'true' : 'false' };

  const value = match[0]
    .replace(/\s/g, '')
    .replace(',', '.');

  return {
    value: parseFloat(value) > 0 ? value : '0',
    from: isFrom ? 'true' : 'false'
  };
};

// Генерация ID для предложения (только латиница)
const generateOfferId = (service, index) => {
  // Используем slug как основу
  let id = service.slug;

  // Транслитерируем кириллицу в латиницу
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '_': '-', '/': '-', '\\': '-'
  };

  if (/[а-яА-Я]/.test(id)) {
    id = id.toLowerCase().split('').map(char =>
      translitMap[char] || (/[a-z0-9-]/.test(char) ? char : '-')
    ).join('');

    // Удаляем повторяющиеся дефисы
    id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  // Обрезаем до 100 символов
  if (id.length > 100) {
    id = id.substring(0, 100);
  }

  // Если после всего получилась пустая строка, используем индекс
  if (!id || id === '-') {
    id = `service-${index + 1}`;
  }

  return id;
};

// Поиск корневой категории для услуги
const findRootCategory = (service, categories) => {
  if (!service.parent) {
    // Если у услуги нет родителя, используем первую категорию
    return categories[0];
  }

  // Ищем категорию по parent ID
  const category = categories.find(cat => cat._id.toString() === service.parent.toString());
  return category || categories[0];
};

// Генерация YML фида
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

  // Категории
  xml += `    <categories>\n`;
  categories.forEach((category, index) => {
    xml += `      <category id="${index + 1}">${escapeXml(category.name)}</category>\n`;
  });
  xml += `    </categories>\n`;

  // ✅ БЛОК SETS (должен быть ПЕРЕД offers)
  xml += `    <sets>\n`;
  services.forEach((service, index) => {
    const serviceId = generateOfferId(service, index);
    xml += `      <set id="${escapeXml(serviceId)}" name="${escapeXml(service.name)}">\n`;
    xml += `        <url>${encodeUrlForXml(`${baseUrl}/services/${service.slug}`)}</url>\n`;
    xml += `      </set>\n`;
  });
  xml += `    </sets>\n`;

  // Предложения
  xml += `    <offers>\n`;

  services.forEach((service, index) => {
    try {
      const priceData = extractPriceValue(service.price);
      const serviceUrl = `${baseUrl}/services/${service.slug}`;
      const encodedServiceUrl = encodeUrlForXml(serviceUrl);
      const serviceId = generateOfferId(service, index);

      const rootCategory = findRootCategory(service, categories);
      const categoryId = categories.findIndex(cat => cat._id.toString() === rootCategory._id.toString()) + 1;

      const offerName = `ServiceBox35: ${service.name}`;

      xml += `      <offer id="${escapeXml(serviceId)}" type="vendor.model">\n`;
      xml += `        <name>${escapeXml(offerName)}</name>\n`;
      xml += `        <url>${escapeXml(encodedServiceUrl)}</url>\n`;

      if (priceData.from === 'true') {
        xml += `        <price from="true">${priceData.value}</price>\n`;
      } else {
        xml += `        <price>${priceData.value}</price>\n`;
      }

      xml += `        <currencyId>RUB</currencyId>\n`;
      xml += `        <categoryId>${categoryId}</categoryId>\n`;
      xml += `        <picture>${encodeUrlForXml(`${baseUrl}/images/Devices.webp`)}</picture>\n`;
      xml += `        <description>${escapeXml(service.description || service.name)}</description>\n`;
      xml += `        <model>${escapeXml(service.name)}</model>\n`;
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

      // ✅ ОБЯЗАТЕЛЬНЫЕ ПАРАМЕТРЫ ДЛЯ ЯНДЕКС.УСЛУГ
      xml += `        <param name="Рейтинг">5.0</param>\n`;
      xml += `        <param name="Число отзывов">127</param>\n`;
      xml += `        <param name="Регион">Вологодская область, Вологда</param>\n`;
      xml += `        <param name="Конверсия">15%</param>\n`;
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

    // Проверяем кэш
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

    let services = [];
    let categories = [];

    try {
      // Подключаемся к базе
      await dbConnect();

      // Получаем корневые категории
      categories = await Service.find({
        isCategory: true,
        parent: null
      })
        .sort({ order: 1, name: 1 })
        .lean();

      // Получаем все услуги
      services = await Service.find({
        isCategory: false
      })
        .sort({ order: 1, name: 1 })
        .limit(200)
        .lean();

      console.log(`📊 Найдено ${services.length} услуг и ${categories.length} категорий`);

    } catch (dbError) {
      console.error('❌ Ошибка базы данных:', dbError.message);
      return new Response(getErrorXml(), {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Если нет услуг
    if (!services || services.length === 0) {
      return new Response(getEmptyXml(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Генерируем XML
    const xml = generateYmlFeed(services, categories);

    // Сохраняем в кэш
    cache.data = xml;
    cache.timestamp = now;

    console.log(`✅ Сгенерирован фид с ${services.length} услугами`);

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
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

const getEmptyXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35</name>
    <url>https://servicebox35.ru</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Прочие услуги</category>
    </categories>
    <offers/>
  </shop>
</yml_catalog>`;

const getErrorXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
  <shop>
    <name>ServiceBox35 - Ошибка</name>
    <url>https://servicebox35.ru</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Прочие услуги</category>
    </categories>
    <offers/>
  </shop>
</yml_catalog>`;