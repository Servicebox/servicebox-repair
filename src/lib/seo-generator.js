// lib/seo-generator.js
// Генерация уникальных title и description по формулам для услуг СЕРВИС БОКС

/**
 * Типы ремонта → преимущество/срок для title
 * Подбирается по ключевым словам в названии услуги
 */
const SERVICE_HINTS = [
  { keywords: ['bga', 'ребол', 'реболл'],        advantage: 'горячий ребол',       duration: 'от 1 дня'    },
  { keywords: ['gpu', 'видеокарт'],               advantage: 'профессиональный ремонт', duration: 'гарантия 30 дней' },
  { keywords: ['память', 'gddr', 'оперативн'],    advantage: 'замена под пайку',    duration: 'за 1 день'   },
  { keywords: ['пятак', 'контакт', 'восстановл'], advantage: 'восстановление контактов', duration: 'от 2 часов' },
  { keywords: ['hdmi', 'коннектор', 'разъём', 'разъем', 'шлейф'], advantage: 'замена разъёма', duration: 'за 1 день' },
  { keywords: ['playstation', 'ps4', 'ps5'],      advantage: 'ремонт приставки',    duration: 'за 1-3 дня'  },
  { keywords: ['xbox'],                           advantage: 'ремонт консоли',      duration: 'за 1-3 дня'  },
  { keywords: ['ноутбук', 'laptop'],              advantage: 'диагностика бесплатно', duration: 'от 1 часа' },
  { keywords: ['телефон', 'смартфон', 'iphone', 'samsung'], advantage: 'ремонт при вас', duration: 'от 30 мин' },
  { keywords: ['планшет', 'ipad'],                advantage: 'замена стекла и дисплея', duration: 'за 1 день' },
  { keywords: ['телевизор', 'tv'],                advantage: 'ремонт матриц и плат', duration: 'от 2 дней'  },
  { keywords: ['apple', 'mac', 'macbook'],        advantage: 'сертифицированный ремонт', duration: 'гарантия 90 дней' },
  { keywords: ['зарядк', 'батарей', 'аккумулятор'], advantage: 'оригинальные запчасти', duration: 'от 30 мин' },
  { keywords: ['чистк', 'профилактик'],           advantage: 'чистка и термопаста',  duration: 'за 2 часа'  },
];

const DEFAULT_HINT = { advantage: 'быстрый ремонт', duration: 'гарантия 30 дней' };

function getHint(name) {
  const lower = name.toLowerCase();
  for (const hint of SERVICE_HINTS) {
    if (hint.keywords.some(kw => lower.includes(kw))) {
      return hint;
    }
  }
  return DEFAULT_HINT;
}

/**
 * Генерирует уникальный title для услуги.
 * Формула: "[Название услуги] в Вологде — [преимущество/срок] | СЕРВИС БОКС"
 * Длина: 50–60 символов
 */
export function generateMetaTitle(service) {
  const hint = getHint(service.name);
  const candidate = `${service.name} в Вологде — ${hint.duration} | СЕРВИС БОКС`;
  if (candidate.length <= 60) return candidate;

  // Укорачиваем название если title слишком длинный
  const maxNameLen = 60 - ` в Вологде — ${hint.duration} | СЕРВИС БОКС`.length;
  const shortName = service.name.slice(0, maxNameLen).trim();
  return `${shortName} в Вологде — ${hint.duration} | СЕРВИС БОКС`;
}

/**
 * Генерирует уникальный description для услуги.
 * Формула: "[Что делаем] + [какие устройства] + [сроки/гарантия] + [цена от/призыв] + [адрес]"
 * Длина: 140–160 символов
 */
export function generateMetaDescription(service) {
  const hint = getHint(service.name);
  const price = service.price && service.price !== 'Уточняйте'
    ? ` Цена от ${service.price}.`
    : '';

  const desc =
    `${service.name} в Вологде — ${hint.advantage}.` +
    ` Срок: ${hint.duration}, гарантия на работу 30 дней.` +
    `${price} Запись онлайн. Ул. Северная, 7А | ☎ 8-800.`;

  if (desc.length <= 160) return desc;
  return desc.slice(0, 157) + '...';
}

/**
 * Генерирует SEO-данные для конкретной услуги.
 * Используется в generateMetadata() страниц Next.js.
 */
export function generateServiceSeo(service) {
  return {
    title: service.metaTitle || generateMetaTitle(service),
    description: service.metaDescription || generateMetaDescription(service),
  };
}

/**
 * Примеры готовых уникальных SEO-данных для ключевых услуг.
 * Применяются через POST /api/admin/seo/bulk-update
 */
export const SEO_PRESETS = [
  {
    slug: 'reballing-gpu',
    title: 'Ребол GPU в Вологде — от 1 дня, гарантия | СЕРВИС БОКС',
    description: 'Ребол видеочипа GPU в Вологде — замена шаров BGA под микроскопом. Срок 1-2 дня, гарантия 30 дней. Цена от 2000 руб. Ул. Северная, 7А.',
  },
  {
    slug: 'zamena-pamyati-gddr',
    title: 'Замена памяти GDDR в Вологде — пайка под микроскопом | СЕРВИС БОКС',
    description: 'Замена видеопамяти GDDR5/GDDR6 в Вологде. Пайка BGA-чипов под микроскопом. Срок 1-2 дня, гарантия 30 дней. Запись онлайн. Ул. Северная, 7А.',
  },
  {
    slug: 'vosstanovlenie-pyatakov',
    title: 'Восстановление пятаков в Вологде — за 1 день | СЕРВИС БОКС',
    description: 'Восстановление контактных площадок (пятаков) на платах в Вологде. Микропайка под микроскопом. Срок от 2 часов. Гарантия 30 дней. Северная, 7А.',
  },
  {
    slug: 'zamena-hdmi-konnektor',
    title: 'Замена HDMI-коннектора в Вологде — за 1 день | СЕРВИС БОКС',
    description: 'Замена HDMI-разъёма на ноутбуке, телевизоре, приставке в Вологде. Пайка за 1 день, гарантия 30 дней. Цена от 800 руб. Ул. Северная, 7А.',
  },
  {
    slug: 'remont-playstation-4-pro',
    title: 'Ремонт PlayStation 4 Pro в Вологде — за 1-3 дня | СЕРВИС БОКС',
    description: 'Ремонт PS4 Pro в Вологде: ребол процессора, замена HDMI, чистка от пыли. Срок 1-3 дня, гарантия 30 дней. Диагностика бесплатно. Северная, 7А.',
  },
  {
    slug: 'remont-xbox-one-x',
    title: 'Ремонт Xbox One X в Вологде — гарантия 30 дней | СЕРВИС БОКС',
    description: 'Ремонт Xbox One X в Вологде: не включается, не читает диски, перегрев. Срок 1-3 дня, гарантия 30 дней. Диагностика бесплатно. Северная, 7А.',
  },
];
