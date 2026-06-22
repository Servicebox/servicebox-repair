// app/brands/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESS, BASE_URL } from '@/lib/constants';
import { LOCAL_BUSINESS_SCHEMA, createBreadcrumbList } from '@/lib/seo-helpers';
// === БАЗА БРЕНДОВ ===
const BRANDS = {
  apple: {
    name: 'Apple',
    fullName: 'Apple (iPhone, iPad, MacBook, Apple Watch)',
    logo: '/images/apple.png.webp',
    shortDescription: 'Профессиональный ремонт техники Apple в Вологде. Оригинальные запчасти, гарантия до 12 месяцев, ремонт от 30 минут.',
    description: `
      <p><strong>ServiceBox — специализированный сервис по ремонту техники Apple в Вологде.</strong> Ремонтируем все устройства: iPhone (все модели от 6 до 15 Pro Max), iPad (все поколения), MacBook (Air, Pro на Intel и Apple Silicon M1/M2/M3), iMac, Apple Watch, AirPods.</p>
      
      <h2>💻 Что ремонтируем</h2>
      <table>
        <thead>
          <tr>
            <th>Устройство</th>
            <th>Популярные услуги</th>
            <th>Цена от</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>iPhone 11–15</strong></td>
            <td>Замена экрана, батареи, камеры</td>
            <td><span class="price-tag">1 900₽</span></td>
          </tr>
          <tr>
            <td><strong>MacBook Air/Pro</strong></td>
            <td>Замена матрицы, клавиатуры, чистка</td>
            <td><span class="price-tag">2 500₽</span></td>
          </tr>
          <tr>
            <td><strong>iPad</strong></td>
            <td>Замена стекла, дисплея, батареи</td>
            <td><span class="price-tag">2 000₽</span></td>
          </tr>
          <tr>
            <td><strong>Apple Watch</strong></td>
            <td>Замена экрана, батареи</td>
            <td><span class="price-tag">2 500₽</span></td>
          </tr>
          <tr>
            <td><strong>iMac</strong></td>
            <td>Апгрейд SSD, RAM, чистка</td>
            <td><span class="price-tag">3 000₽</span></td>
          </tr>
          <tr>
            <td><strong>AirPods</strong></td>
            <td>Замена батареи, ремонт кейса</td>
            <td><span class="price-tag">1 500₽</span></td>
          </tr>
        </tbody>
      </table>
      
      <h2>⭐ Почему выбирают нас для ремонта Apple</h2>
      <ul>
        <li><strong>Оригинальные запчасти</strong> — используем детали от официальных поставщиков Apple</li>
        <li><strong>Специализированное оборудование</strong> — iFixit, Pentalobe, программаторы</li>
        <li><strong>Сохраняем True Tone</strong> — после замены экрана цветопередача остаётся идеальной</li>
        <li><strong>Гарантия до 12 месяцев</strong> — на все работы и запчасти</li>
        <li><strong>Ремонт при вас</strong> — замена экрана iPhone за 30–40 минут</li>
      </ul>
      
      <h2>⚠️ Частые проблемы техники Apple</h2>
      <ul>
        <li><strong>iPhone не заряжается</strong> — замена разъёма Lightning/USB-C, от 1 500₽</li>
        <li><strong>Вздулся аккумулятор MacBook</strong> — срочная замена, опасно эксплуатировать!</li>
        <li><strong>Не работает Face ID/Touch ID</strong> — ремонт/замена модуля</li>
        <li><strong>Залил MacBook</strong> — ультразвуковая чистка, спасаем 85% устройств</li>
        <li><strong>Полосы на экране MacBook</strong> — замена шлейфа или матрицы</li>
      </ul>
    `,
    services: ['Замена экрана iPhone', 'Замена батареи MacBook', 'Чистка MacBook', 'Ремонт iPad', 'Замена клавиатуры MacBook', 'Ремонт Apple Watch'],
    popularModels: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'MacBook Air M1', 'MacBook Pro M2', 'iPad Pro', 'Apple Watch Series 8'],
    prices: [
      { service: 'Замена экрана iPhone 11', price: '3 500₽', time: '40 мин' },
      { service: 'Замена экрана iPhone 13', price: '6 900₽', time: '45 мин' },
      { service: 'Замена батареи iPhone', price: '1 900–3 200₽', time: '30 мин' },
      { service: 'Чистка MacBook + термопаста', price: '2 500₽', time: '1–2 часа' },
      { service: 'Замена клавиатуры MacBook', price: '6 000₽', time: '1–3 дня' },
    ],
    keywords: ['ремонт apple вологда', 'ремонт iphone вологда', 'ремонт macbook', 'сервис apple'],
  },

  samsung: {
    name: 'Samsung',
    fullName: 'Samsung (Galaxy S, A, Note, Tab)',
    logo: '/images/samsung.png.webp',
    shortDescription: 'Ремонт смартфонов и планшетов Samsung в Вологде. Galaxy S, A, Note, Tab. Замена экранов AMOLED, батарей. Гарантия до 12 месяцев.',
    description: `
      <p><strong>Ремонт техники Samsung в ServiceBox — это быстро, качественно и с гарантией.</strong> Работаем со всеми линейками: Galaxy S (S10–S24), Galaxy A, Galaxy Note, Galaxy Tab, Galaxy Watch, Galaxy Buds.</p>
      
      <h2>📱 Услуги по ремонту Samsung</h2>
      <table>
        <thead>
          <tr>
            <th>Модель</th>
            <th>Замена экрана</th>
            <th>Замена батареи</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Galaxy S21 / S22 / S23</strong></td><td><span class="price-tag">от 5 500₽</span></td><td>1 900₽</td><td>40–60 мин</td></tr>
          <tr><td><strong>Galaxy S24 / S24 Ultra</strong></td><td><span class="price-tag">от 8 900₽</span></td><td>2 200₽</td><td>1 час</td></tr>
          <tr><td><strong>Galaxy A52 / A53 / A54</strong></td><td><span class="price-tag">от 3 500₽</span></td><td>1 700₽</td><td>40 мин</td></tr>
          <tr><td><strong>Galaxy Note 20 / Note 21</strong></td><td><span class="price-tag">от 7 500₽</span></td><td>2 000₽</td><td>1 час</td></tr>
          <tr><td><strong>Galaxy Tab S7 / S8 / S9</strong></td><td><span class="price-tag">от 6 000₽</span></td><td>2 500₽</td><td>1–2 часа</td></tr>
          <tr><td><strong>Galaxy Z Fold / Flip</strong></td><td><span class="price-tag">от 15 000₽</span></td><td>3 500₽</td><td>2–3 часа</td></tr>
        </tbody>
      </table>
      
      <h2>⭐ Преимущества ремонта Samsung в ServiceBox</h2>
      <ul>
        <li><strong>AMOLED-дисплеи</strong> — устанавливаем оригинальные матрицы с идеальной цветопередачей</li>
        <li><strong>Сохраняем влагозащиту IP68</strong> — после ремонта телефон не боится воды</li>
        <li><strong>Быстрый ремонт</strong> — замена экрана за 40–60 минут при вас</li>
        <li><strong>Опыт со складными моделями</strong> — Z Fold, Z Flip ремонтируем регулярно</li>
      </ul>
    `,
    services: ['Замена экрана Samsung', 'Замена батареи Galaxy', 'Ремонт после воды', 'Замена разъёма Type-C', 'Ремонт S-Pen'],
    popularModels: ['Galaxy S23', 'Galaxy S24', 'Galaxy A54', 'Galaxy Note 20', 'Galaxy Z Flip 5', 'Galaxy Tab S9'],
    prices: [
      { service: 'Замена экрана Galaxy S23', price: '7 500₽', time: '1 час' },
      { service: 'Замена экрана Galaxy A54', price: '3 500₽', time: '40 мин' },
      { service: 'Замена батареи Galaxy', price: '1 700–2 200₽', time: '30 мин' },
    ],
    keywords: ['ремонт samsung вологда', 'замена экрана galaxy', 'сервис самсунг'],
  },

  xiaomi: {
    name: 'Xiaomi',
    fullName: 'Xiaomi (Redmi, Poco, Mi)',
    logo: '/images/xiaomi.png.webp',
    shortDescription: 'Ремонт Xiaomi, Redmi, Poco в Вологде. Замена экранов, батарей, разъёмов. Доступные цены от 1 500₽, гарантия 6 месяцев.',
    description: `
      <p><strong>Ремонт Xiaomi в ServiceBox — доступные цены без потери качества.</strong> Ремонтируем все линейки: Redmi Note, Redmi, Poco, Mi, Black Shark.</p>
      
      <h2>📱 Цены на ремонт Xiaomi</h2>
      <table>
        <thead>
          <tr><th>Модель</th><th>Замена экрана</th><th>Замена батареи</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Redmi Note 10 / 11 / 12</strong></td><td><span class="price-tag">от 2 000₽</span></td><td>1 500₽</td></tr>
          <tr><td><strong>Redmi Note 13 / 13 Pro</strong></td><td><span class="price-tag">от 2 500₽</span></td><td>1 700₽</td></tr>
          <tr><td><strong>Poco X5 / X6 / F5</strong></td><td><span class="price-tag">от 2 800₽</span></td><td>1 800₽</td></tr>
          <tr><td><strong>Mi 11 / 12 / 13</strong></td><td><span class="price-tag">от 4 500₽</span></td><td>2 000₽</td></tr>
          <tr><td><strong>Black Shark</strong></td><td><span class="price-tag">от 5 000₽</span></td><td>2 500₽</td></tr>
        </tbody>
      </table>
      
      <h2>⚠️ Популярные неисправности Xiaomi</h2>
      <ul>
        <li><strong>Разбит экран</strong> — меняем дисплейный модуль за 40 минут</li>
        <li><strong>Быстро разряжается</strong> — замена батареи за 30 минут</li>
        <li><strong>Не работает разъём зарядки</strong> — ремонт/замена Type-C</li>
        <li><strong>Нет звука в динамике</strong> — чистка или замена</li>
        <li><strong>Не ловит сеть</strong> — диагностика антенн, ремонт модема</li>
      </ul>
    `,
    services: ['Замена экрана Xiaomi', 'Замена батареи Redmi', 'Ремонт Poco', 'Замена разъёма Type-C'],
    popularModels: ['Redmi Note 12', 'Redmi Note 13 Pro', 'Poco X6 Pro', 'Mi 13', 'Black Shark 5'],
    prices: [
      { service: 'Замена экрана Redmi Note 12', price: '2 200₽', time: '40 мин' },
      { service: 'Замена батареи Xiaomi', price: '1 500–2 000₽', time: '30 мин' },
    ],
    keywords: ['ремонт xiaomi вологда', 'ремонт redmi', 'сервис xiaomi'],
  },

  huawei: {
    name: 'Huawei',
    fullName: 'Huawei и Honor',
    logo: '/images/huaw.png.webp',
    shortDescription: 'Ремонт Huawei и Honor в Вологде. P-серия, Mate, Nova, Honor. Замена экранов, батарей, разъёмов. Гарантия до 12 месяцев.',
    description: `
      <p><strong>Ремонт техники Huawei и Honor</strong> всех моделей: P30–P60, Mate 30–50, Nova, Honor 50–90. Оригинальные запчасти, опытные мастера.</p>
      
      <h2>📱 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Замена экрана Huawei P40</td><td><span class="price-tag">4 500₽</span></td><td>1 час</td></tr>
          <tr><td>Замена экрана Honor 70</td><td><span class="price-tag">3 800₽</span></td><td>1 час</td></tr>
          <tr><td>Замена батареи</td><td><span class="price-tag">1 800₽</span></td><td>30 мин</td></tr>
          <tr><td>Ремонт после воды</td><td><span class="price-tag">от 2 000₽</span></td><td>1–3 дня</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена экрана Huawei', 'Замена батареи Honor', 'Ремонт после воды', 'Восстановление данных'],
    popularModels: ['Huawei P40', 'Huawei P50', 'Honor 70', 'Honor 90', 'Huawei Mate 50'],
    prices: [{ service: 'Замена экрана Huawei P40', price: '4 500₽', time: '1 час' }],
    keywords: ['ремонт huawei вологда', 'ремонт honor'],
  },

  asus: {
    name: 'ASUS',
    fullName: 'ASUS (ноутбуки, ROG, ZenBook)',
    logo: '/images/asus.png.webp',
    shortDescription: 'Ремонт ноутбуков ASUS в Вологде. ROG, ZenBook, VivoBook, TUF. Замена матриц, BGA-пайка, чистка. Гарантия до 24 месяцев.',
    description: `
      <p><strong>Ремонт ноутбуков ASUS любой сложности.</strong> Специализируемся на игровых сериях ROG и TUF, ультрабуках ZenBook, офисных VivoBook.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Чистка ASUS ROG от пыли</td><td><span class="price-tag">2 000₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Замена матрицы 15.6"</td><td><span class="price-tag">3 500₽</span></td><td>1 час</td></tr>
          <tr><td>BGA-пайка видеочипа</td><td><span class="price-tag">от 5 000₽</span></td><td>3–5 дней</td></tr>
          <tr><td>Замена клавиатуры</td><td><span class="price-tag">2 500₽</span></td><td>1 час</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена матрицы ASUS', 'Чистка ROG от пыли', 'BGA-пайка', 'Ремонт материнской платы'],
    popularModels: ['ROG Strix G15', 'ROG Zephyrus', 'ZenBook 14', 'TUF Gaming', 'VivoBook'],
    prices: [{ service: 'Чистка ASUS ROG', price: '2 000₽', time: '1–2 часа' }],
    keywords: ['ремонт asus вологда', 'ремонт rog', 'сервис asus'],
  },

  lenovo: {
    name: 'Lenovo',
    fullName: 'Lenovo (IdeaPad, ThinkPad, Legion)',
    logo: '/images/lenovo.png.webp',
    shortDescription: 'Ремонт ноутбуков Lenovo в Вологде. ThinkPad, IdeaPad, Legion, Yoga. Замена матриц, клавиатур, ремонт плат.',
    description: `
      <p><strong>Ремонт ноутбуков Lenovo</strong> — от офисных IdeaPad до игровых Legion и бизнес-класса ThinkPad. Выполняем сложный компонентный ремонт.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Замена матрицы Lenovo 15.6"</td><td><span class="price-tag">3 500₽</span></td><td>1 час</td></tr>
          <tr><td>Замена клавиатуры ThinkPad</td><td><span class="price-tag">3 000₽</span></td><td>1 час</td></tr>
          <tr><td>Чистка Legion от пыли</td><td><span class="price-tag">2 000₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Ремонт после залития</td><td><span class="price-tag">от 3 500₽</span></td><td>2–5 дней</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена матрицы Lenovo', 'Замена клавиатуры', 'Ремонт после залития', 'Апгрейд SSD/RAM'],
    popularModels: ['ThinkPad X1', 'IdeaPad 3', 'Legion 5', 'Yoga Slim'],
    prices: [{ service: 'Замена матрицы Lenovo 15.6"', price: '3 500₽', time: '1 час' }],
    keywords: ['ремонт lenovo вологда', 'ремонт thinkpad', 'сервис lenovo'],
  },

  hp: {
    name: 'HP',
    fullName: 'HP (Pavilion, Envy, Omen, EliteBook)',
    logo: '/images/hp.png.webp',
    shortDescription: 'Ремонт ноутбуков HP в Вологде. Omen, Pavilion, Envy, EliteBook. Замена матриц, чистка, ремонт после залития.',
    description: `
      <p><strong>Ремонт ноутбуков HP всех серий.</strong> Игровые Omen, ультрабуки Envy, офисные Pavilion, бизнес EliteBook.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Чистка HP Omen</td><td><span class="price-tag">2 000₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Замена матрицы</td><td><span class="price-tag">3 500₽</span></td><td>1 час</td></tr>
          <tr><td>Ремонт петель</td><td><span class="price-tag">2 500₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Ремонт цепи питания</td><td><span class="price-tag">от 3 000₽</span></td><td>2–4 дня</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена матрицы HP', 'Чистка Omen', 'Ремонт петель', 'Ремонт цепи питания'],
    popularModels: ['HP Omen 16', 'HP Pavilion 15', 'HP Envy x360', 'HP EliteBook'],
    prices: [{ service: 'Чистка HP Omen', price: '2 000₽', time: '1–2 часа' }],
    keywords: ['ремонт hp вологда', 'ремонт omen', 'сервис hp'],
  },

  acer: {
    name: 'Acer',
    fullName: 'Acer (Aspire, Predator, Swift, Nitro)',
    logo: '/images/acer.png.webp',
    shortDescription: 'Ремонт ноутбуков Acer в Вологде. Predator, Nitro, Swift, Aspire. Замена матриц, BGA-пайка, чистка.',
    description: `
      <p><strong>Ремонт ноутбуков Acer</strong> — от бюджетных Aspire до игровых Predator и Nitro.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Чистка Acer Predator</td><td><span class="price-tag">2 000₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Замена матрицы</td><td><span class="price-tag">3 500₽</span></td><td>1 час</td></tr>
          <tr><td>Ремонт после залития</td><td><span class="price-tag">от 3 000₽</span></td><td>2–5 дней</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена матрицы Acer', 'Чистка Predator', 'Ремонт после залития'],
    popularModels: ['Acer Predator Helios', 'Acer Nitro 5', 'Acer Swift 3', 'Acer Aspire 5'],
    prices: [{ service: 'Чистка Acer Predator', price: '2 000₽', time: '1–2 часа' }],
    keywords: ['ремонт acer вологда', 'ремонт predator'],
  },

  msi: {
    name: 'MSI',
    fullName: 'MSI (игровые ноутбуки)',
    logo: '/images/msi.png.webp',
    shortDescription: 'Ремонт игровых ноутбуков MSI в Вологде. GE, GS, GP, GL, Raider, Stealth. Чистка, замена термопасты, BGA-пайка.',
    description: `
      <p><strong>Специализированный ремонт игровых ноутбуков MSI.</strong> Знаем особенности всех серий — от бюджетных GL до топовых Raider.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Чистка MSI + термопаста</td><td><span class="price-tag">2 500₽</span></td><td>2 часа</td></tr>
          <tr><td>BGA-пайка GPU</td><td><span class="price-tag">от 6 000₽</span></td><td>3–5 дней</td></tr>
          <tr><td>Ремонт цепи питания</td><td><span class="price-tag">от 4 000₽</span></td><td>2–4 дня</td></tr>
        </tbody>
      </table>
    `,
    services: ['Чистка MSI Raider', 'Замена термопасты', 'BGA-пайка GPU', 'Ремонт цепи питания'],
    popularModels: ['MSI Raider GE78', 'MSI Stealth 16', 'MSI Katana 15', 'MSI Pulse GL66'],
    prices: [{ service: 'Чистка MSI + термопаста', price: '2 500₽', time: '2 часа' }],
    keywords: ['ремонт msi вологда', 'ремонт msi raider'],
  },

  dell: {
    name: 'Dell',
    fullName: 'Dell (XPS, Inspiron, Latitude, Alienware)',
    logo: '/images/dell.png.webp',
    shortDescription: 'Ремонт ноутбуков Dell в Вологде. XPS, Inspiron, Latitude, Alienware. Замена матриц, чистка, ремонт плат.',
    description: `
      <p><strong>Ремонт ноутбуков Dell</strong> — от офисных Latitude до премиальных XPS и игровых Alienware.</p>
      
      <h2>💻 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Замена матрицы Dell XPS</td><td><span class="price-tag">от 6 000₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Чистка XPS</td><td><span class="price-tag">2 500₽</span></td><td>1–2 часа</td></tr>
          <tr><td>Ремонт Alienware</td><td><span class="price-tag">от 4 000₽</span></td><td>1–5 дней</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена матрицы Dell', 'Чистка XPS', 'Ремонт Alienware', 'Замена клавиатуры'],
    popularModels: ['Dell XPS 13', 'Dell XPS 15', 'Dell Inspiron 15', 'Alienware m15'],
    prices: [{ service: 'Замена матрицы Dell XPS', price: 'от 6 000₽', time: '1–2 часа' }],
    keywords: ['ремонт dell вологда', 'ремонт xps'],
  },

  sony: {
    name: 'Sony',
    fullName: 'Sony (PlayStation, Xperia, VAIO)',
    logo: '/images/sony.png.webp',
    shortDescription: 'Ремонт PlayStation и техники Sony в Вологде. PS4, PS5, Xperia. Чистка, замена HDMI, ремонт джойстиков.',
    description: `
      <p><strong>Ремонт техники Sony</strong> — PlayStation 3/4/5, смартфоны Xperia. Профессиональный ремонт приставок с гарантией.</p>
      
      <h2>🎮 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Чистка PS4</td><td><span class="price-tag">1 500₽</span></td><td>1 час</td></tr>
          <tr><td>Чистка PS5</td><td><span class="price-tag">2 000₽</span></td><td>1 час</td></tr>
          <tr><td>Ремонт HDMI PS4</td><td><span class="price-tag">3 000₽</span></td><td>1 день</td></tr>
          <tr><td>Ремонт DualSense (дрифт)</td><td><span class="price-tag">1 800₽</span></td><td>1 час</td></tr>
          <tr><td>Замена термопасты PS5</td><td><span class="price-tag">2 500₽</span></td><td>1 час</td></tr>
        </tbody>
      </table>
    `,
    services: ['Чистка PS4/PS5', 'Замена HDMI', 'Ремонт DualSense', 'Замена термопасты'],
    popularModels: ['PlayStation 4', 'PlayStation 4 Pro', 'PlayStation 5', 'Xperia 1', 'Xperia 5'],
    prices: [
      { service: 'Чистка PS4', price: '1 500₽', time: '1 час' },
      { service: 'Чистка PS5', price: '2 000₽', time: '1 час' },
      { service: 'Ремонт HDMI PS4', price: '3 000₽', time: '1 день' },
    ],
    keywords: ['ремонт playstation вологда', 'ремонт ps5', 'чистка ps4'],
  },

  lg: {
    name: 'LG',
    fullName: 'LG (телевизоры, стиральные машины)',
    logo: '/images/lg.png.webp',
    shortDescription: 'Ремонт телевизоров LG в Вологде. Замена подсветки, ремонт блоков питания, T-Con плат. Гарантия до 12 месяцев.',
    description: `
      <p><strong>Ремонт телевизоров LG</strong> всех серий: OLED, NanoCell, UHD. Меняем подсветку, чиним блоки питания, восстанавливаем Smart TV.</p>
      
      <h2>📺 Услуги и цены</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Замена подсветки LED 32–43"</td><td><span class="price-tag">2 500₽</span></td><td>1 день</td></tr>
          <tr><td>Замена подсветки LED 49–55"</td><td><span class="price-tag">3 500₽</span></td><td>1 день</td></tr>
          <tr><td>Замена подсветки OLED</td><td><span class="price-tag">от 8 000₽</span></td><td>2–3 дня</td></tr>
          <tr><td>Ремонт блока питания</td><td><span class="price-tag">2 500₽</span></td><td>1–2 дня</td></tr>
          <tr><td>Ремонт T-Con платы</td><td><span class="price-tag">3 000₽</span></td><td>1–2 дня</td></tr>
        </tbody>
      </table>
    `,
    services: ['Замена подсветки LED', 'Ремонт блока питания', 'Замена T-Con', 'Ремонт Smart TV'],
    popularModels: ['LG OLED C2', 'LG NanoCell 85', 'LG UHD 50"', 'LG OLED G3'],
    prices: [{ service: 'Замена подсветки LG 49"', price: '3 500₽', time: '1 день' }],
    keywords: ['ремонт телевизоров lg вологда', 'ремонт lg oled'],
  },
};

// Генерация путей для статической генерации
export async function generateStaticParams() {
  return Object.keys(BRANDS).map(slug => ({ slug }));
}

// Метаданные страницы (SEO)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) return { title: 'Бренд не найден' };

  const pageUrl = `${BASE_URL}/brands/${slug}`;

  return {
    title: `Ремонт ${brand.name} в Вологде | ServiceBox — от 30 минут`,
    description: brand.shortDescription,
    keywords: brand.keywords.join(', '),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `Ремонт ${brand.name} в Вологде`,
      description: brand.shortDescription,
      url: pageUrl,
      siteName: 'ServiceBox Вологда',
      type: 'website',
      locale: 'ru_RU',
      images: [{ url: `${BASE_URL}${brand.logo}`, width: 400, height: 400, alt: brand.name }],
    },
  };
}

// Компонент страницы
export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) notFound();

  // JSON-LD разметка
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE_URL}/brands/${slug}#service`,
        name: `Ремонт ${brand.name} в Вологде`,
        description: brand.shortDescription,
        provider: { '@id': `${BASE_URL}#business` },
        areaServed: { '@type': 'City', name: 'Вологда' },
        serviceType: `Ремонт техники ${brand.name}`,
        brand: { '@type': 'Brand', name: brand.name },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Услуги по ремонту ${brand.name}`,
          itemListElement: brand.prices.map(p => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: p.service },
            price: p.price.replace(/[^\d]/g, ''),
            priceCurrency: 'RUB',
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Сколько стоит ремонт ${brand.name} в Вологде?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: brand.shortDescription,
            },
          },
          {
            '@type': 'Question',
            name: `Где починить ${brand.name} в Вологде?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'В сервисном центре ServiceBox на ул. Северная, 7А (ТЦ КИТ, 1 этаж). Работаем ежедневно с 10:00 до 20:00.',
            },
          },
        ],
      },
    ],
  };

  const cssStyles = `
    /* === Базовые стили страницы === */
    .brand-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a2a3a;
      line-height: 1.7;
    }

    /* === Стили для контента (таблицы, списки, заголовки) === */
    .brand-content {
      font-size: 1.05rem;
      margin-bottom: 2rem;
    }

    .brand-content p {
      margin-bottom: 1rem;
    }

    .brand-content strong {
      color: #0a1929;
      font-weight: 600;
    }

    /* === Заголовки H2 === */
    .brand-content h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      color: #0a1929;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .brand-content h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #0f172a;
    }

    /* === Таблицы — ГЛАВНОЕ ИСПРАВЛЕНИЕ === */
    .brand-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      font-size: 0.95rem;
    }

    .brand-content thead {
      background: linear-gradient(135deg, #002147 0%, #004499 100%);
      color: white;
    }

    .brand-content th {
      padding: 1rem 1.25rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
    }

    .brand-content tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s ease;
    }

    .brand-content tbody tr:last-child {
      border-bottom: none;
    }

    .brand-content tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .brand-content tbody tr:hover {
      background: #e0f2fe;
    }

    .brand-content td {
      padding: 1rem 1.25rem;
      color: #334155;
    }

    .brand-content td:first-child {
      font-weight: 500;
      color: #0f172a;
    }

    /* === Тег цены === */
    .price-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      color: #14532d;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    /* === Списки === */
    .brand-content ul,
    .brand-content ol {
      padding-left: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .brand-content li {
      margin-bottom: 0.6rem;
      color: #334155;
    }

    .brand-content li strong {
      color: #002147;
    }

    /* === Адаптивность для мобильных === */
    @media (max-width: 768px) {
      .brand-page {
        padding: 1rem 0.75rem;
      }

      .brand-content h2 {
        font-size: 1.25rem;
      }

      .brand-content table {
        font-size: 0.85rem;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
      }

      .brand-content th,
      .brand-content td {
        padding: 0.75rem 1rem;
      }

      .brand-content thead {
        display: table;
        width: 100%;
        table-layout: fixed;
      }

      .brand-content tbody {
        display: table;
        width: 100%;
        table-layout: fixed;
      }
    }

    @media (max-width: 480px) {
      .brand-content {
        font-size: 0.95rem;
      }

      .brand-content table {
        font-size: 0.8rem;
      }

      .price-tag {
        font-size: 0.8rem;
        padding: 0.2rem 0.6rem;
      }
    }
  `;

  return (
    <main className="brand-page">
      {/* JSON-LD разметка */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* Хлебные крошки */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        <Link href="/" style={{ color: '#002147', textDecoration: 'none' }}>Главная</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <Link href="/services" style={{ color: '#002147', textDecoration: 'none' }}>Услуги</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <span>{brand.name}</span>
      </nav>

      {/* Заголовок с логотипом */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '16px',
      }}>
        <img
          src={brand.logo}
          alt={brand.name}
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            background: 'white',
            padding: '0.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0a1929' }}>
            Ремонт {brand.name} в Вологде
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontSize: '1.05rem' }}>
            {brand.fullName}
          </p>
        </div>
      </div>

      {/* Краткое описание */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
        borderLeft: '4px solid #002147',
        borderRadius: '8px',
        fontSize: '1.1rem',
        marginBottom: '2rem',
        color: '#0c4a6e',
      }}>
        💡 {brand.shortDescription}
      </div>

      {/* Ключевые преимущества */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ padding: '1.25rem', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>⚡</div>
          <div style={{ fontWeight: 700, color: '#14532d', fontSize: '1.1rem' }}>от 30 минут</div>
          <div style={{ fontSize: '0.85rem', color: '#15803d' }}>Срочный ремонт</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#ede9fe', borderRadius: '12px', textAlign: 'center', border: '1px solid #c4b5fd' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🛡️</div>
          <div style={{ fontWeight: 700, color: '#581c87', fontSize: '1.1rem' }}>до 24 мес</div>
          <div style={{ fontSize: '0.85rem', color: '#6b21a8' }}>Гарантия</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fef3c7', borderRadius: '12px', textAlign: 'center', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>✅</div>
          <div style={{ fontWeight: 700, color: '#78350f', fontSize: '1.1rem' }}>Оригинал</div>
          <div style={{ fontSize: '0.85rem', color: '#92400e' }}>Запчасти</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fee2e2', borderRadius: '12px', textAlign: 'center', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🎁</div>
          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '1.1rem' }}>Бесплатно</div>
          <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>Диагностика</div>
        </div>
      </div>

      <article
        className="brand-content"
        dangerouslySetInnerHTML={{ __html: brand.description }}
      />

      {/* Популярные модели */}
      {brand.popularModels && brand.popularModels.length > 0 && (
        <div style={{
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 0 }}>📱 Популярные модели в ремонте</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {brand.popularModels.map((model, i) => (
              <span key={i} style={{
                padding: '0.5rem 1rem',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#334155',
                transition: 'all 0.2s',
              }}>
                {model}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #002147 0%, #004499 100%)',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0, 102, 204, 0.3)',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginTop: 0 }}>Сломался {brand.name}? Починим сегодня!</h2>
        <p style={{ opacity: 0.95, marginBottom: '1.5rem' }}>Бесплатная диагностика · Ремонт от 30 минут · Гарантия до 24 месяцев</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:+7-911-501-88-28" style={{
            padding: '0.85rem 1.75rem',
            background: '#28a745',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'transform 0.2s',
          }}>📞 +7 (911) 501-88-28</a>
          <a href="/contacts" style={{
            padding: '0.85rem 1.75rem',
            background: 'white',
            color: '#002147',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
          }}>📍 Адрес сервиса</a>
        </div>
      </div>

      {/* Все бренды */}
      <div style={{
        padding: '2rem',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
      }}>
        <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1.5rem' }}>🔧 Ремонтируем все бренды</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}>
          {Object.entries(BRANDS).filter(([key]) => key !== slug).map(([key, b]) => (
            <Link key={key} href={`/brands/${key}`} style={{
              padding: '1rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}>
              <img src={b.logo} alt={b.name} style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                marginBottom: '0.5rem',
              }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Футер */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.9rem',
      }}>
        <p>© {new Date().getFullYear()} ServiceBox Вологда · Ремонт цифровой техники с 2016 года</p>
        <p>
          <a href="tel:+7-911-501-88-28" style={{ color: '#002147', textDecoration: 'none' }}>+7 (911) 501-88-28</a>
          {' · '}
          ул. Северная, 7А, ТЦ КИТ · Ежедневно 10:00–20:00
        </p>
      </footer>
    </main>
  );
}