// scripts/add-missing-service-categories.mjs
//
// Разовый скрипт: добавляет категории услуг, которых не было на сайте —
// iPad, Apple Watch, MacBook (подкатегория ноутбуков), ПК (десктопы),
// планшеты (общие Android) и ремонт телефонов по брендам (Samsung, Xiaomi/
// Poco/Redmi, Huawei/Honor, Realme/Infinix/Tecno/Vivo) — был только iPhone.
//
// Поводом стал конкурентный аудит каталога iService (yandex-карточка),
// у которого есть все эти категории, а у нас — нет. Тексты и названия
// написаны заново (не скопированы), цены ориентированы на рынок Вологды.
//
// Намеренно НЕ добавлено: разблокировка/снятие пароля телефона — это
// отдельное бизнес-решение (похожая ситуация с "ремонтом компьютеров" и
// "выездом мастера" в прошлом), не добавляю его без явного решения Тома.
//
// Запуск:
//   node scripts/add-missing-service-categories.mjs            # dry-run, только посчитать
//   node scripts/add-missing-service-categories.mjs --apply    # применить на .env.local
//   node scripts/add-missing-service-categories.mjs --apply --prod  # применить на .env.production

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.argv.includes('--prod') ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile), quiet: true });

const APPLY = process.argv.includes('--apply');

// Реальные id существующих родительских категорий на проде (сверено
// вручную через прямой запрос к Mongo 2026-10-22).
const PARENT_LAPTOPS = '6937352c9b6f9dd2c1a36976'; // "Ремонт ноутбуков" / laptops
const PARENT_PHONES = '69369054cc08accfe94aef4a'; // "Ремонт телефонов" / remont-telefonov

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const slugify = (name) =>
  name
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? (/[a-z0-9]/.test(ch) ? ch : ' '))
    .join('')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const GEO = 'в Вологде';
const metaTitle = (name, isCategory) =>
  isCategory
    ? `${name} ${GEO} | СЕРВИС БОКС - ремонт, цены, запись онлайн`
    : `${name} ${GEO} - СЕРВИС БОКС: стоимость, запись на ремонт`;
const metaDescription = (name, description, price, isCategory) =>
  isCategory
    ? `Профессиональный ${name.toLowerCase()} ${GEO}. Качественный ремонт, доступные цены, гарантия. Запишитесь онлайн или по телефону.`
    : `${name}: ${description}.${price ? ` Стоимость ${price}.` : ''} Качественный ремонт ${GEO}. Гарантия на работы.`;
const h1 = (name) => `${name} ${GEO}`;

let order = 0;
const docs = [];

function addCategory({ name, slug, description, parent = null }) {
  const _id = new mongoose.Types.ObjectId();
  docs.push({
    _id,
    name,
    description,
    price: '',
    slug,
    metaTitle: metaTitle(name, true),
    metaDescription: metaDescription(name, description, '', true),
    keywords: [],
    geoKeywords: ['Вологда'],
    h1: h1(name),
    content: '',
    features: [],
    parent: parent ? new mongoose.Types.ObjectId(parent) : null,
    isCategory: true,
    level: 0,
    isActive: true,
    order: order++,
    cities: [],
    views: 0,
    popularity: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return _id;
}

function addService({ name, description, price, parent, features = [] }) {
  docs.push({
    _id: new mongoose.Types.ObjectId(),
    name,
    description,
    price: String(price),
    slug: slugify(name),
    metaTitle: metaTitle(name, false),
    metaDescription: metaDescription(name, description, price, false),
    keywords: [],
    geoKeywords: ['Вологда'],
    h1: h1(name),
    content: '',
    features,
    parent: new mongoose.Types.ObjectId(parent),
    isCategory: false,
    level: 0,
    isActive: true,
    order: order++,
    cities: [],
    views: 0,
    popularity: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// iPad
// ─────────────────────────────────────────────────────────────────────────
const ipadId = addCategory({
  name: 'Ремонт iPad',
  slug: 'ipad',
  description: 'Ремонт планшетов Apple iPad любой сложности: экраны, аккумуляторы, разъёмы и плата.',
});
addService({
  parent: ipadId, price: 3000,
  name: 'Замена стекла дисплея iPad',
  description: 'Разбито только защитное стекло, а сенсор и матрица работают? Переклеим стекло отдельно — дешевле полной замены модуля, сроки — 1-2 дня.',
});
addService({
  parent: ipadId, price: 6000,
  name: 'Замена дисплея iPad',
  description: 'Экран не реагирует на касания, идёт пятнами или полосами? Заменим дисплейный модуль целиком на оригинальный или сертифицированный аналог.',
  features: ['Гарантия 6 месяцев'],
});
addService({
  parent: ipadId, price: 3000,
  name: 'Замена аккумулятора iPad',
  description: 'Планшет быстро разряжается, вздулся корпус или не держит заряд дольше часа? Заменим батарею на новую.',
});
addService({
  parent: ipadId, price: 2000,
  name: 'Замена разъёма зарядки iPad',
  description: 'iPad не заряжается или заряжается только при определённом положении кабеля? Заменим разъём зарядки за один визит.',
});
addService({
  parent: ipadId, price: 1500,
  name: 'Замена кнопки Home или громкости iPad',
  description: 'Кнопка Home, включения или громкости залипает либо не реагирует? Заменим неисправную кнопку без потери данных.',
});
addService({
  parent: ipadId, price: 1500,
  name: 'Замена микрофона или динамика iPad',
  description: 'Пропал звук в динамике или вас не слышно на звонках? Заменим динамик или микрофон на оригинальную деталь.',
});
addService({
  parent: ipadId, price: 3500,
  name: 'Перепайка процессора iPad',
  description: 'Планшет не включается, зависает на логотипе или перезагружается по кругу? Возможен отвал процессора — сделаем профессиональный реболл.',
});
addService({
  parent: ipadId, price: 2500,
  name: 'Замена контроллера питания iPad',
  description: 'iPad не включается или не заряжается, хотя сама батарея исправна? Диагностируем и заменим контроллер питания на плате.',
});
addService({
  parent: ipadId, price: 'Бесплатно',
  name: 'Диагностика iPad',
  description: 'Бесплатная диагностика перед ремонтом — определим точную причину неисправности и назовём стоимость без постоплатных сюрпризов.',
});

// ─────────────────────────────────────────────────────────────────────────
// Apple Watch
// ─────────────────────────────────────────────────────────────────────────
const watchId = addCategory({
  name: 'Ремонт Apple Watch',
  slug: 'apple-watch',
  description: 'Ремонт умных часов Apple Watch всех поколений: стекло, дисплей, диагностика платы.',
});
addService({
  parent: watchId, price: 2500,
  name: 'Ремонт Apple Watch',
  description: 'Часы не включаются, не держат заряд или зависают при загрузке? Проведём диагностику и отремонтируем плату.',
});
addService({
  parent: watchId, price: 3500,
  name: 'Замена стекла Apple Watch',
  description: 'Треснуло защитное стекло на корпусе часов? Заменим стекло, сохранив сенсорную чувствительность экрана.',
});
addService({
  parent: watchId, price: 5500,
  name: 'Замена дисплея Apple Watch',
  description: 'Экран погас, идёт полосами или не реагирует на касания? Заменим дисплейный модуль целиком.',
  features: ['Гарантия 3 месяца'],
});

// ─────────────────────────────────────────────────────────────────────────
// MacBook (подкатегория "Ремонт ноутбуков")
// ─────────────────────────────────────────────────────────────────────────
const macbookId = addCategory({
  name: 'Ремонт ноутбуков MacBook',
  slug: 'remont-noutbukov-macbook',
  description: 'Ремонт MacBook, MacBook Air и MacBook Pro: аккумуляторы, матрицы, клавиатуры, SSD, вода.',
  parent: PARENT_LAPTOPS,
});
addService({
  parent: macbookId, price: 4500,
  name: 'Замена аккумулятора MacBook',
  description: 'Батарея MacBook вздулась, разряжается за час или macOS пишет «Срочно требуется обслуживание»? Заменим аккумулятор на новый.',
});
addService({
  parent: macbookId, price: 7000,
  name: 'Замена матрицы MacBook',
  description: 'На экране полосы, пятна или трещина на матрице? Заменим дисплейную матрицу целиком, сохранив родной корпус крышки.',
  features: ['Гарантия 6 месяцев'],
});
addService({
  parent: macbookId, price: 4000,
  name: 'Замена клавиатуры MacBook',
  description: 'Клавиши залипают, не печатают или залиты жидкостью? Заменим клавиатурный блок целиком.',
});
addService({
  parent: macbookId, price: 2500,
  name: 'Замена разъёма MacBook',
  description: 'Разболтался или не контактирует порт зарядки либо USB-C/Thunderbolt? Заменим разъём на плате.',
});
addService({
  parent: macbookId, price: 2500,
  name: 'Замена и расширение SSD MacBook',
  description: 'Не хватает места или диск стал медленным и выдаёт ошибки? Заменим SSD на больший объём с переносом данных.',
});
addService({
  parent: macbookId, price: 3000,
  name: 'Восстановление MacBook после воды',
  description: 'Пролили жидкость на клавиатуру? Чем раньше принесёте — тем выше шанс спасти плату и данные. Проведём чистку и диагностику.',
});
addService({
  parent: macbookId, price: 2000,
  name: 'Установка и настройка macOS на MacBook',
  description: 'Система зависает, не загружается или нужна чистая переустановка? Установим и настроим актуальную macOS с переносом настроек.',
});
addService({
  parent: macbookId, price: 2000,
  name: 'Чистка системы охлаждения MacBook',
  description: 'MacBook шумит вентилятором, греется и троттлит производительность? Почистим систему охлаждения и заменим термопасту.',
});
addService({
  parent: macbookId, price: 'Бесплатно',
  name: 'Диагностика MacBook',
  description: 'Бесплатная диагностика MacBook перед ремонтом — точно назовём причину и стоимость.',
});

// ─────────────────────────────────────────────────────────────────────────
// Компьютеры (десктопы)
// ─────────────────────────────────────────────────────────────────────────
const pcId = addCategory({
  name: 'Ремонт компьютеров',
  slug: 'computers',
  description: 'Ремонт и сборка настольных компьютеров: видеокарты, блоки питания, материнские платы, сборка под задачи.',
});
addService({
  parent: pcId, price: 'от 2000',
  name: 'Сборка ПК на заказ',
  description: 'Подберём и соберём компьютер под ваши задачи и бюджет — игры, работа или монтаж видео. Протестируем перед выдачей.',
});
addService({
  parent: pcId, price: 1500,
  name: 'Замена видеокарты в ПК',
  description: 'Нужна установка новой видеокарты или диагностика артефактов и чёрного экрана? Заменим и настроим драйверы.',
});
addService({
  parent: pcId, price: 1500,
  name: 'Замена блока питания ПК',
  description: 'Компьютер не включается, перезагружается под нагрузкой или блок питания шумит и пахнет гарью? Заменим на подходящий по мощности.',
});
addService({
  parent: pcId, price: 1200,
  name: 'Установка SSD или HDD в ПК',
  description: 'Хотите ускорить загрузку системы или добавить объём хранения? Установим и настроим накопитель с переносом данных.',
});
addService({
  parent: pcId, price: 2500,
  name: 'Замена материнской платы ПК',
  description: 'Материнская плата не стартует, не видит комплектующие или вышла из строя? Подберём аналог и соберём систему заново.',
});
addService({
  parent: pcId, price: 2000,
  name: 'Замена процессора ПК',
  description: 'Нужен апгрейд производительности или замена неисправного процессора? Подберём совместимый вариант и настроим систему.',
});
addService({
  parent: pcId, price: 1500,
  name: 'Чистка и замена термопасты ПК',
  description: 'Компьютер шумит, греется и троттлит под нагрузкой? Почистим от пыли и заменим термопасту на процессоре и видеокарте.',
});
addService({
  parent: pcId, price: 'Бесплатно',
  name: 'Диагностика ПК',
  description: 'Бесплатная диагностика настольного компьютера — определим неисправный узел перед началом ремонта.',
});

// ─────────────────────────────────────────────────────────────────────────
// Планшеты (общие Android)
// ─────────────────────────────────────────────────────────────────────────
const tabletsId = addCategory({
  name: 'Ремонт планшетов',
  slug: 'tablets',
  description: 'Ремонт планшетов Samsung, Xiaomi, Huawei, Honor и других Android-брендов: экраны, батареи, разъёмы.',
});
addService({
  parent: tabletsId, price: 2500,
  name: 'Замена стекла дисплея планшета',
  description: 'Разбито защитное стекло, а матрица и сенсор исправны? Переклеим стекло отдельно от модуля.',
});
addService({
  parent: tabletsId, price: 4000,
  name: 'Замена дисплейного модуля планшета',
  description: 'Экран не реагирует на касания, идёт полосами или подсвечивается неравномерно? Заменим дисплейный модуль целиком.',
});
addService({
  parent: tabletsId, price: 2500,
  name: 'Замена аккумулятора планшета',
  description: 'Планшет быстро разряжается или корпус вздулся от старой батареи? Заменим аккумулятор на новый.',
});
addService({
  parent: tabletsId, price: 1500,
  name: 'Замена разъёма зарядки планшета',
  description: 'Планшет не заряжается или заряжается только в одном положении кабеля? Заменим разъём зарядки.',
});
addService({
  parent: tabletsId, price: 1200,
  name: 'Замена кнопки включения или громкости планшета',
  description: 'Кнопка залипает или не реагирует на нажатия? Заменим неисправную кнопку.',
});
addService({
  parent: tabletsId, price: 1200,
  name: 'Замена SIM или SD-разъёма планшета',
  description: 'Планшет не видит SIM- или SD-карту? Заменим слот разъёма.',
});
addService({
  parent: tabletsId, price: 1500,
  name: 'Восстановление планшета после воды',
  description: 'Попала влага внутрь корпуса? Проведём чистку и диагностику платы, постараемся сохранить данные.',
});
addService({
  parent: tabletsId, price: 2500,
  name: 'Замена микросхемы памяти планшета',
  description: 'Планшет не загружается, завис в режиме восстановления или не определяется компьютером? Проверим и заменим микросхему памяти.',
});
addService({
  parent: tabletsId, price: 1800,
  name: 'Замена Wi-Fi модуля планшета',
  description: 'Слабый или нестабильный Wi-Fi при исправном роутере? Заменим Wi-Fi модуль планшета.',
});
addService({
  parent: tabletsId, price: 'Бесплатно',
  name: 'Диагностика планшета',
  description: 'Бесплатная диагностика планшета — определим причину неисправности перед ремонтом.',
});

// ─────────────────────────────────────────────────────────────────────────
// Телефоны по брендам (Android) — подкатегории "Ремонт телефонов"
// ─────────────────────────────────────────────────────────────────────────
const REPAIR_TYPES = [
  { suffix: 'Замена дисплея', price: 3500, desc: (b) => `Экран ${b} не реагирует на касания, подсвечивается наполовину или покрылся трещинами? Заменим дисплейный модуль на оригинальный или сертифицированный аналог.`, features: ['Гарантия 3 месяца'] },
  { suffix: 'Замена стекла дисплея', price: 2500, desc: (b) => `Разбито только защитное стекло на ${b}, а сенсор и матрица исправны? Переклеим стекло отдельно — это дешевле полной замены модуля.` },
  { suffix: 'Замена аккумулятора', price: 1800, desc: (b) => `${b} быстро садится, греется или выключается при 20-30% заряда? Заменим аккумулятор на новый — вернём реальное время работы.` },
  { suffix: 'Замена разъёма зарядки', price: 1200, desc: (b) => `${b} не заряжается или заряжается только в одном положении кабеля? Заменим разъём зарядки за один визит.` },
  { suffix: 'Замена задней крышки', price: 1500, desc: (b) => `Треснула или отклеилась задняя панель ${b}? Заменим на новую — вернём аккуратный внешний вид и влагозащиту.` },
  { suffix: 'Замена фронтальной камеры', price: 1200, desc: (b) => `Селфи-камера ${b} размыта, не фокусируется или не включается? Заменим фронтальную камеру.` },
  { suffix: 'Замена основной камеры', price: 1800, desc: (b) => `Основная камера ${b} мутнит снимки, на фото появились пятна или модуль не определяется системой? Заменим камеру на оригинальную.` },
  { suffix: 'Замена верхнего динамика', price: 1000, desc: (b) => `Собеседника не слышно во время разговора на ${b}? Заменим верхний (слуховой) динамик.` },
  { suffix: 'Замена нижнего динамика', price: 1000, desc: (b) => `Пропал или хрипит звук мелодий и музыки на ${b}? Заменим нижний (полифонический) динамик.` },
  { suffix: 'Замена верхнего микрофона', price: 1000, desc: (b) => `При разговоре по ${b} вас не слышно или звук глухой? Заменим верхний микрофон.` },
  { suffix: 'Замена нижнего микрофона', price: 1000, desc: (b) => `При записи видео или в громкой связи на ${b} пропадает звук? Заменим нижний микрофон.` },
  { suffix: 'Замена контроллера питания', price: 1800, desc: (b) => `${b} не включается или не заряжается, хотя батарея исправна? Диагностируем и заменим контроллер питания на плате.` },
  { suffix: 'Перепайка процессора', price: 2500, desc: (b) => `${b} завис в цикле перезагрузки, греется и выключается или не реагирует на кнопки? Возможен отвал процессора — сделаем профессиональный реболл.` },
  { suffix: 'Ремонт платы', price: 1500, desc: (b) => `Любые неисправности материнской платы ${b}: короткое замыкание, окисление, не видит сеть или модули. Диагностика и ремонт на компонентном уровне.` },
  { suffix: 'Замена аудиокодека', price: 1800, desc: (b) => `Нет звука ни в одном динамике ${b} или звук искажён на всех режимах? Вероятно, неисправен аудиокодек — заменим чип.` },
  { suffix: 'Замена разъёма наушников', price: 1000, desc: (b) => `Наушники на ${b} работают только в одном положении штекера или не определяются вовсе? Заменим разъём.` },
  { suffix: 'Замена антенны', price: 1200, desc: (b) => `На ${b} пропадает сеть или слабый приём Wi-Fi/GPS? Заменим антенный модуль.` },
  { suffix: 'Восстановление после воды', price: 1500, desc: (b) => `Уронили ${b} в воду? Чем раньше принесёте — тем выше шанс спасти плату и данные. Проведём чистку и диагностику.` },
  { suffix: 'Замена датчика приближения', price: 1000, desc: (b) => `На ${b} экран не гаснет во время разговора или гаснет всегда? Заменим датчик приближения.` },
  { suffix: 'Замена SIM-разъёма', price: 1200, desc: (b) => `${b} не видит SIM-карту или перестал её читать? Заменим слот SIM.` },
  { suffix: 'Замена вибромотора', price: 1000, desc: (b) => `Пропала вибрация при звонках и уведомлениях на ${b}? Заменим вибромотор.` },
  { suffix: 'Замена кнопки включения или громкости', price: 1000, desc: (b) => `Залипла или не реагирует кнопка включения либо громкости на ${b}? Заменим кнопку.` },
  { suffix: 'Замена Wi-Fi модуля', price: 1800, desc: (b) => `Слабый или нестабильный Wi-Fi на ${b}, хотя у других устройств сигнал нормальный? Заменим Wi-Fi модуль.` },
];

const BRANDS = [
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Xiaomi, Poco, Redmi', slug: 'xiaomi-poco-redmi' },
  { name: 'Huawei, Honor', slug: 'huawei-honor' },
  { name: 'Realme, Infinix, Tecno, Vivo', slug: 'realme-infinix-tecno-vivo' },
];

for (const brand of BRANDS) {
  const brandId = addCategory({
    name: `Ремонт ${brand.name}`,
    slug: `remont-${brand.slug}`,
    description: `Ремонт смартфонов ${brand.name}: экраны, батареи, разъёмы, камеры и ремонт платы.`,
    parent: PARENT_PHONES,
  });
  for (const t of REPAIR_TYPES) {
    addService({
      parent: brandId,
      price: t.price,
      name: `${t.suffix} ${brand.name}`,
      description: t.desc(brand.name),
      features: t.features || [],
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────
async function main() {
  const categories = docs.filter((d) => d.isCategory).length;
  const services = docs.filter((d) => !d.isCategory).length;
  console.log(`Подготовлено: ${categories} новых категорий, ${services} новых услуг (всего ${docs.length} документов).`);

  if (!APPLY) {
    console.log('Dry-run — ничего не записано. Запусти с --apply, чтобы применить.');
    const sample = docs.slice(0, 3).map((d) => ({ name: d.name, slug: d.slug, price: d.price, isCategory: d.isCategory }));
    console.log('Пример первых документов:', JSON.stringify(sample, null, 2));
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан — проверь', envFile);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('services');

  // Защита от повторного запуска: проверяем по slug новых категорий.
  const newCategorySlugs = docs.filter((d) => d.isCategory).map((d) => d.slug);
  const existing = await collection.find({ slug: { $in: newCategorySlugs } }).project({ slug: 1 }).toArray();
  if (existing.length > 0) {
    console.error('❌ Уже существуют категории со slug:', existing.map((e) => e.slug).join(', '));
    console.error('Похоже, скрипт уже запускался. Удали вручную перед повтором, если это не так.');
    process.exit(1);
  }

  const result = await collection.insertMany(docs);
  console.log(`✅ Вставлено документов: ${Object.keys(result.insertedIds).length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
