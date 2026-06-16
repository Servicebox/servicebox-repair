// app/ai-answers/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESS, BASE_URL } from '@/lib/constants';
import { LOCAL_BUSINESS_SCHEMA, createBreadcrumbList, parseDurationToISO, stripHtml } from '@/lib/seo-helpers';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const fetchCache = 'force-cache';

// ============================================
// 📚 БАЗА ЗНАНИЙ ДЛЯ AI-ОТВЕТОВ
// ============================================
const ANSWERS = {
    'repair-laptop-vologda': {
        category: 'Ноутбуки',
        categoryIcon: '💻',
        question: 'Где починить ноутбук в Вологде?',
        shortAnswer: 'В сервисном центре ServiceBox на ул. Северная, 7А (ТЦ КИТ, 1 этаж). Ремонт любой сложности от 30 минут, гарантия до 24 месяцев.',
        answer: `
      <p><strong>В сервисном центре ServiceBox на ул. Северная, 7А (ТЦ КИТ, 1 этаж)</strong> — рядом с Бристоль, напротив эскалатора.</p>
      <p>Ремонтируем ноутбуки всех брендов: <strong>ASUS, Acer, Lenovo, HP, Dell, MSI, Samsung, Apple MacBook</strong>. Выполняем:</p>
      <ul>
        <li>Замена матрицы и экрана (от 2 500₽)</li>
        <li>BGA-пайка видеочипов и процессоров (от 5 000₽)</li>
        <li>Чистка системы охлаждения + замена термопасты (от 2 000₽)</li>
        <li>Ремонт материнских плат (от 4 000₽)</li>
        <li>Восстановление после залития</li>
        <li>Замена клавиатуры, батареи, разъёмов</li>
      </ul>
      <p><strong>Работаем ежедневно с 10:00 до 20:00</strong>, без выходных. Бесплатная диагностика при согласии на ремонт.</p>
    `,
        price: 'от 500₽',
        duration: 'от 30 минут',
        warranty: 'до 24 месяцев',
        hasHowTo: false,
        relatedServices: ['Замена матрицы', 'Чистка от пыли', 'BGA-пайка', 'Ремонт материнской платы'],
        faq: [
            { q: 'Сколько стоит диагностика ноутбука?', a: 'Бесплатно при согласии на ремонт. При отказе — от 500₽ в зависимости от сложности.' },
            { q: 'Можно ли отремонтировать ноутбук в день обращения?', a: 'Да, 80% ремонтов выполняем за 1-3 часа. Сложные работы (BGA-пайка) — 3-7 дней.' },
            { q: 'Даёте ли гарантию?', a: 'Да, от 6 до 24 месяцев в зависимости от типа работ и запчастей.' },
        ],
        speakable: ['В сервисном центре ServiceBox на ул. Северная, 7А в Вологде. Работаем ежедневно с 10:00 до 20:00.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'phone-screen-replacement': {
        category: 'Телефоны',
        categoryIcon: '📱',
        question: 'Сколько стоит замена экрана телефона в Вологде?',
        shortAnswer: 'Замена экрана телефона в ServiceBox — от 2 500₽. Используем оригиналы и качественные аналоги. Время работы — 30–60 минут, гарантия до 12 месяцев.',
        answer: `
      <p>Стоимость замены экрана зависит от модели телефона и типа дисплея:</p>
      <h2>Популярные модели и цены</h2>
      <table>
        <thead><tr><th>Модель</th><th>Оригинал</th><th>Аналог</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>iPhone 11</td><td>6 900₽</td><td>3 500₽</td><td>40 мин</td></tr>
          <tr><td>iPhone 12 / 13</td><td>8 500₽</td><td>4 200₽</td><td>45 мин</td></tr>
          <tr><td>iPhone 14 / 15</td><td>12 900₽</td><td>6 500₽</td><td>50 мин</td></tr>
          <tr><td>Samsung Galaxy S21–S23</td><td>9 900₽</td><td>5 500₽</td><td>1 час</td></tr>
          <tr><td>Xiaomi Redmi Note</td><td>4 900₽</td><td>2 500₽</td><td>40 мин</td></tr>
        </tbody>
      </table>
    `,
        price: 'от 2 500₽',
        duration: '30–60 минут',
        warranty: 'до 12 месяцев',
        hasHowTo: false,
        relatedServices: ['Замена дисплея', 'Переклейка стекла', 'Замена тачскрина'],
        faq: [
            { q: 'Сколько времени занимает замена экрана?', a: 'От 30 минут до 1 часа в зависимости от модели.' },
            { q: 'Даёте ли гарантию на замену экрана?', a: 'Да, от 6 до 12 месяцев в зависимости от типа запчасти.' },
            { q: 'Можно ли заменить только стекло?', a: 'Да, для OLED-дисплеев возможна переклейка стекла без замены дисплея.' },
        ],
        speakable: ['Стоимость замены экрана телефона в ServiceBox в Вологде — от 2500 рублей. Время работы — от 30 минут до 1 часа.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'water-damage-phone': {
        category: 'Телефоны',
        categoryIcon: '📱',
        question: 'Телефон упал в воду — что делать?',
        shortAnswer: 'Немедленно выключите, не заряжайте, не сушите феном и не кладите в рис. Принесите в ServiceBox в течение 24 часов — спасаем 90% утопленных устройств. Цена от 1 500₽.',
        answer: `
      <p><strong>Первые 60 минут решают всё</strong>. Если действовать правильно — шансы на спасение телефона 90%.</p>
      <h2>⚡ Первые действия</h2>
      <ol>
        <li><strong>Немедленно выключите телефон</strong> — удерживайте кнопку питания 10 секунд</li>
        <li><strong>НЕ подключайте к зарядке</strong> — это вызовет короткое замыкание</li>
        <li><strong>Снимите чехол</strong> — под ним скапливается вода</li>
        <li><strong>Извлеките SIM-карту и карту памяти</strong></li>
        <li><strong>Аккуратно промокните</strong> бумажной салфеткой (не трите!)</li>
      </ol>
      <h2>❌ Чего НЕЛЬЗЯ делать</h2>
      <ul>
        <li><strong>Сушить феном</strong> — горячий воздух расплавит клей</li>
        <li><strong>Класть в рис</strong> — миф! Рис не впитывает воду изнутри</li>
        <li><strong>Класть на батарею</strong> — перегрев повредит батарею</li>
        <li><strong>Включать "проверить"</strong> — вызовет коррозию</li>
      </ul>
    `,
        price: 'от 1 500₽',
        duration: '1–3 дня',
        warranty: '3 месяца',
        hasHowTo: true,
        howToSteps: [
            'Немедленно выключите телефон (удерживайте кнопку питания 10 секунд)',
            'НЕ подключайте к зарядке и не пытайтесь включить',
            'Снимите чехол, извлеките SIM-карту и карту памяти',
            'Аккуратно промокните салфеткой (не трясите устройство!)',
            'НЕ сушите феном, на батарее и не кладите в рис',
            'Как можно скорее принесите в ServiceBox (ул. Северная, 7А)',
        ],
        relatedServices: ['Восстановление после воды', 'Ультразвуковая чистка', 'Замена компонентов'],
        faq: [
            { q: 'Можно ли спасти утопленный телефон?', a: 'Да, в 90% случаев, если принести в течение 24 часов и не пытаться включать.' },
            { q: 'Помогает ли рис?', a: 'Нет, это миф. Рис не впитывает влагу изнутри устройства.' },
            { q: 'Сколько стоит восстановление?', a: 'От 1 500₽ за диагностику и чистку. Финальная цена зависит от повреждений.' },
        ],
        speakable: ['Если телефон упал в воду — немедленно выключите его, не заряжайте и не сушите феном. Принесите в ServiceBox в течение 24 часов.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'videocard-repair-cost': {
        category: 'Видеокарты',
        categoryIcon: '🔥',
        question: 'Сколько стоит ремонт видеокарты в Вологде?',
        shortAnswer: 'Ремонт видеокарты в ServiceBox — от 2 500₽. Замена чипов, реболл, восстановление цепей питания, замена памяти. Гарантия до 12 месяцев.',
        answer: `
      <p>Мы специализируемся на <strong>сложном ремонте видеокарт</strong> — у нас есть BGA-станции, микроскопы, профессиональное оборудование.</p>
      <h2>Прайс-лист на ремонт видеокарт</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Срок</th><th>Гарантия</th></tr></thead>
        <tbody>
          <tr><td>Диагностика</td><td>500₽ (бесплатно при ремонте)</td><td>1 день</td><td>—</td></tr>
          <tr><td>Чистка + замена термопасты</td><td>2 500₽</td><td>1 день</td><td>3 мес</td></tr>
          <tr><td>Замена видеочипа (GPU)</td><td>8 000–22 000₽</td><td>3–7 дней</td><td>12 мес</td></tr>
          <tr><td>Замена памяти (VRAM)</td><td>5 500–10 500₽</td><td>3–7 дней</td><td>12 мес</td></tr>
          <tr><td>Реболл чипа</td><td>5 500–11 000₽</td><td>3–5 дней</td><td>12 мес</td></tr>
          <tr><td>Ремонт цепи питания</td><td>4 500₽</td><td>2–5 дней</td><td>6 мес</td></tr>
        </tbody>
      </table>
    `,
        price: 'от 2 500₽',
        duration: '1–7 дней',
        warranty: 'до 12 месяцев',
        hasHowTo: false,
        relatedServices: ['BGA-пайка', 'Замена GPU', 'Замена VRAM', 'Реболл'],
        faq: [
            { q: 'Ремонтируете ли RTX 4090?', a: 'Да, ремонтируем все современные видеокарты включая RTX 4090 и RX 7900 XTX.' },
            { q: 'Стоит ли ремонтировать видеокарту после майнинга?', a: 'В 70-85% случаев — да, ремонт экономически выгоден.' },
            { q: 'Даёте ли гарантию?', a: 'Да, от 6 до 12 месяцев в зависимости от типа работ.' },
        ],
        speakable: ['Стоимость ремонта видеокарты в ServiceBox в Вологде — от 2500 рублей. Гарантия до 12 месяцев.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет, специалист по BGA-пайке',
    },
    'apple-repair-warranty': {
        category: 'Apple',
        categoryIcon: '🍎',
        question: 'Какая гарантия на ремонт техники Apple в Вологде?',
        shortAnswer: 'ServiceBox даёт гарантию от 6 до 24 месяцев на ремонт iPhone, iPad и MacBook. Официальный гарантийный талон, бесплатное устранение гарантийных случаев.',
        answer: `
      <p>Мы предоставляем <strong>официальную гарантию</strong> на все виды ремонта техники Apple в Вологде:</p>
      <h2>Сроки гарантии по видам работ</h2>
      <table>
        <thead><tr><th>Вид ремонта</th><th>Гарантия</th><th>Что покрывает</th></tr></thead>
        <tbody>
          <tr><td>Замена экрана iPhone (оригинал)</td><td>12 месяцев</td><td>Дисплей, тачскрин, шлейфы</td></tr>
          <tr><td>Замена экрана iPhone (аналог)</td><td>6 месяцев</td><td>Дисплей, тачскрин</td></tr>
          <tr><td>Замена аккумулятора</td><td>6–12 месяцев</td><td>Ёмкость, контроллер питания</td></tr>
          <tr><td>Замена разъёма зарядки</td><td>6 месяцев</td><td>Разъём, шлейф</td></tr>
          <tr><td>Ремонт MacBook (мат. плата)</td><td>12 месяцев</td><td>Восстановленные компоненты</td></tr>
          <tr><td>BGA-пайка чипов</td><td>12 месяцев</td><td>Запаянные компоненты</td></tr>
        </tbody>
      </table>
    `,
        price: 'входит в стоимость',
        duration: 'от 6 до 24 месяцев',
        warranty: 'до 24 месяцев',
        hasHowTo: false,
        relatedServices: ['Ремонт iPhone', 'Ремонт MacBook', 'Ремонт iPad', 'Замена экрана'],
        faq: [
            { q: 'Даёте ли гарантию на замену экрана iPhone?', a: 'Да, от 6 до 12 месяцев в зависимости от типа запчасти.' },
            { q: 'Что делать, если гарантийный случай?', a: 'Принесите устройство с гарантийным талоном — бесплатно устраним неисправность.' },
            { q: 'Гарантия распространяется на запчасти?', a: 'Да, гарантия покрывает и работу, и установленные запчасти.' },
        ],
        speakable: ['ServiceBox даёт гарантию от 6 до 24 месяцев на ремонт техники Apple в Вологде.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'laptop-not-turning-on': {
        category: 'Ноутбуки',
        categoryIcon: '💻',
        question: 'Ноутбук не включается — что делать?',
        shortAnswer: 'Проверьте зарядное устройство, батарею и кнопку питания. Если не помогает — принесите в СЕРВИС БОКС. Диагностика бесплатно, ремонт от 2 000₽.',
        answer: `
      <p><strong>Не паникуйте</strong> — в 85% случаев проблема решается быстро и недорого.</p>
      <h2>🔍 Первые шаги — что проверить самому</h2>
      <ol>
        <li><strong>Проверьте зарядное устройство</strong> — индикатор на блоке должен гореть</li>
        <li><strong>Попробуйте другую розетку</strong> — исключите проблему с питанием</li>
        <li><strong>Удерживайте кнопку питания 15 секунд</strong> — принудительный сброс</li>
        <li><strong>Отключите всю периферию</strong> — USB-устройства, внешние мониторы</li>
        <li><strong>Проверьте индикаторы</strong> — мигание может указывать на код ошибки</li>
      </ol>
    `,
        price: 'от 2 000₽',
        duration: '1–5 дней',
        warranty: 'до 12 месяцев',
        hasHowTo: true,
        howToSteps: [
            'Проверьте зарядное устройство — индикатор должен гореть',
            'Попробуйте другую розетку',
            'Удерживайте кнопку питания 15 секунд (принудительный сброс)',
            'Отключите всю периферию (USB, внешние мониторы)',
            'Проверьте индикаторы — мигание указывает на код ошибки',
            'Если не помогает — принесите в ServiceBox (ул. Северная, 7А)',
        ],
        relatedServices: ['Ремонт материнской платы', 'Диагностика', 'Замена контроллера питания'],
        faq: [
            { q: 'Сколько стоит диагностика?', a: 'Бесплатно при согласии на ремонт. При отказе — от 500₽.' },
            { q: 'Можно ли починить ноутбук после залития?', a: 'Да, в 85% случаев. Цена от 5 500₽.' },
            { q: 'Сколько времени займёт ремонт?', a: 'От 1 дня (простые случаи) до 5-7 дней (сложные).' },
        ],
        speakable: ['Если ноутбук не включается — проверьте зарядное устройство, удерживайте кнопку питания 15 секунд.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'price-diagnostics': {
        category: 'Диагностика',
        categoryIcon: '🔍',
        question: 'Сколько стоит диагностика техники в Вологде?',
        shortAnswer: 'Диагностика в ServiceBox — БЕСПЛАТНО при согласии на ремонт. При отказе — от 500 до 1 500₽ в зависимости от сложности.',
        answer: `
      <p><strong>Диагностика в ServiceBox — БЕСПЛАТНО</strong> при согласии на ремонт. Это наша политика прозрачности.</p>
      <h2>Стоимость диагностики</h2>
      <table>
        <thead><tr><th>Услуга</th><th>При согласии на ремонт</th><th>При отказе</th></tr></thead>
        <tbody>
          <tr><td>Простая диагностика (смартфоны)</td><td>Бесплатно</td><td>500₽</td></tr>
          <tr><td>Диагностика ноутбука</td><td>Бесплатно</td><td>700₽</td></tr>
          <tr><td>Диагностика MacBook</td><td>Бесплатно</td><td>1 000₽</td></tr>
          <tr><td>Сложная диагностика (BGA, цепи)</td><td>Бесплатно</td><td>1 500₽</td></tr>
        </tbody>
      </table>
    `,
        price: 'Бесплатно (при ремонте)',
        duration: '30 мин — 2 часа',
        warranty: '—',
        hasHowTo: false,
        relatedServices: ['Диагностика ноутбука', 'Диагностика iPhone', 'Диагностика MacBook'],
        faq: [
            { q: 'Диагностика действительно бесплатная?', a: 'Да, при согласии на ремонт. При отказе — от 500₽.' },
            { q: 'Сколько времени занимает диагностика?', a: 'От 30 минут (простые случаи) до 2 часов (сложные).' },
            { q: 'Нужна ли запись на диагностику?', a: 'Желательна — чтобы избежать ожидания. Позвоните по +7 (911) 501-88-28.' },
        ],
        speakable: ['Диагностика в ServiceBox в Вологде — бесплатно при согласии на ремонт. При отказе — от 500 до 1500 рублей.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
    'urgent-repair-vologda': {
        category: 'Срочный ремонт',
        categoryIcon: '⚡',
        question: 'Где сделать срочный ремонт техники в Вологде?',
        shortAnswer: 'ServiceBox — срочный ремонт за 30–60 минут в Вологде. iPhone, Samsung, ноутбуки, MacBook. Работаем ежедневно с 10:00 до 20:00 без выходных.',
        answer: `
      <p><strong>ServiceBox — это срочный ремонт</strong> цифровой техники в Вологде за 30–60 минут в присутствии клиента.</p>
      <h2>⚡ Что ремонтируем срочно</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Время</th><th>Цена</th></tr></thead>
        <tbody>
          <tr><td>Замена экрана iPhone</td><td>30–60 мин</td><td>от 2 500₽</td></tr>
          <tr><td>Замена экрана Samsung</td><td>40–90 мин</td><td>от 2 500₽</td></tr>
          <tr><td>Замена аккумулятора iPhone</td><td>20–40 мин</td><td>от 2 000₽</td></tr>
          <tr><td>Замена разъёма зарядки</td><td>40–90 мин</td><td>от 2 200₽</td></tr>
        </tbody>
      </table>
    `,
        price: 'от 2 000₽',
        duration: '30–60 минут',
        warranty: 'до 12 месяцев',
        hasHowTo: true,
        howToSteps: [
            'Позвоните по номеру +7 (911) 501-88-28',
            'Опишите проблему и модель устройства',
            'Запишитесь на удобное время',
            'Привезите устройство в ServiceBox (ул. Северная, 7А)',
            'Получите готовое устройство через 30–60 минут',
        ],
        relatedServices: ['Срочный ремонт iPhone', 'Срочный ремонт ноутбука', 'Срочная замена экрана'],
        faq: [
            { q: 'Можно ли починить iPhone за 30 минут?', a: 'Да, замена экрана или аккумулятора — 30–60 минут.' },
            { q: 'Нужна ли запись на срочный ремонт?', a: 'Желательна — чтобы избежать ожидания. Позвоните заранее.' },
            { q: 'Работаете ли в выходные?', a: 'Да, работаем ежедневно с 10:00 до 20:00 без выходных.' },
        ],
        speakable: ['ServiceBox в Вологде — срочный ремонт за 30-60 минут. Работаем ежедневно с 10:00 до 20:00 без выходных. Адрес: ул. Северная, 7А.'],
        author: 'Андрей Кознов',
        expertise: 'Мастер сервисного центра с опытом 10+ лет',
    },
};

export async function generateStaticParams() {
    return Object.keys(ANSWERS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = ANSWERS[slug];

    if (!data) {
        return {
            title: 'Ответ не найден | ServiceBox Вологда',
            robots: { index: false, follow: false },
        };
    }

    const pageUrl = `${BASE_URL}/ai-answers/${slug}`;
    const cleanAnswer = stripHtml(data.shortAnswer).slice(0, 155);

    return {
        title: `${data.question} — ответ эксперта | ServiceBox Вологда`,
        description: cleanAnswer,
        keywords: `${data.category.toLowerCase()}, ремонт Вологда, ServiceBox, ${data.question.toLowerCase()}`,
        alternates: { canonical: pageUrl },
        authors: [{ name: data.author, url: `${BASE_URL}/about` }],
        openGraph: {
            title: data.question,
            description: cleanAnswer,
            url: pageUrl,
            siteName: 'ServiceBox Вологда',
            type: 'article',
            locale: 'ru_RU',
            publishedTime: '2024-01-15',
            modifiedTime: new Date().toISOString(),
            authors: [data.author],
            images: [{
                url: `${BASE_URL}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: data.question,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: data.question,
            description: cleanAnswer,
            images: [`${BASE_URL}/og-image.jpg`],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-snippet': -1,
                'max-image-preview': 'large',
                'max-video-preview': -1,
            },
        },
        // ✅ ИСПРАВЛЕНО: удалены невалидные HTTP-заголовки из other
        other: {
            'yandex-ai': 'optimized',
        },
    };
}

export default async function AiAnswerPage({ params }) {
    const { slug } = await params;
    const data = ANSWERS[slug];
    if (!data) notFound();

    const today = new Date().toISOString().split('T')[0];

    // ============================================
    // 🏛️ JSON-LD РАЗМЕТКА (Schema.org)
    // ============================================
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            // ✅ 1. FAQPage
            {
                '@type': 'FAQPage',
                '@id': `${BASE_URL}/ai-answers/${slug}#faq`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: data.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: stripHtml(data.shortAnswer),
                        },
                    },
                    ...(data.faq || []).map(f => ({
                        '@type': 'Question',
                        name: f.q,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: stripHtml(f.a),
                        },
                    })),
                ],
            },

            // ✅ 2. HowTo (с правильным ISO 8601 duration)
            ...(data.hasHowTo && data.howToSteps ? [{
                '@type': 'HowTo',
                '@id': `${BASE_URL}/ai-answers/${slug}#howto`,
                name: data.question,
                description: stripHtml(data.shortAnswer),
                totalTime: parseDurationToISO(data.duration),
                step: data.howToSteps.map((step, i) => ({
                    '@type': 'HowToStep',
                    position: i + 1,
                    name: `Шаг ${i + 1}`,
                    text: step,
                    url: `${BASE_URL}/ai-answers/${slug}#step-${i + 1}`,
                })),
            }] : []),

            // ✅ 3. TechArticle (для SEO + E-E-A-T)
            {
                '@type': 'TechArticle',
                '@id': `${BASE_URL}/ai-answers/${slug}#article`,
                headline: data.question,
                description: stripHtml(data.shortAnswer),
                image: `${BASE_URL}/og-image.jpg`,
                author: {
                    '@type': 'Person',
                    name: data.author,
                    url: `${BASE_URL}/about`,
                    jobTitle: data.expertise,
                    worksFor: { '@id': `${BASE_URL}#business` },
                },
                publisher: { '@id': `${BASE_URL}#business` },
                datePublished: '2024-01-15',
                dateModified: today,
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `${BASE_URL}/ai-answers/${slug}`,
                },
                keywords: `${data.category.toLowerCase()}, ремонт Вологда, ServiceBox`,
                articleSection: data.category,
                inLanguage: 'ru-RU',
            },

            // ✅ 4. BreadcrumbList
            createBreadcrumbList([
                { name: 'Главная', url: BASE_URL },
                { name: 'Полезные статьи', url: `${BASE_URL}/news` },
                { name: data.category, url: `${BASE_URL}/ai-answers/${slug}` },
            ]),

            // ✅ 6. Speakable (для голосовых помощников — Алиса, Siri)
            ...(data.speakable ? [{
                '@type': 'WebPage',
                '@id': `${BASE_URL}/ai-answers/${slug}`,
                speakable: {
                    '@type': 'SpeakableSpecification',
                    cssSelector: ['.ai-short-answer', '.speakable-text'],
                },
            }] : []),
        ],
    };

    const cssStyles = `
    .ai-answer-content a { color: #0066cc; text-decoration: underline; }
    .ai-answer-content h2 { font-size: 1.4rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #0a1929; }
    .ai-answer-content h3 { font-size: 1.15rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #0f172a; }
    .ai-answer-content ul, .ai-answer-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    .ai-answer-content li { margin-bottom: 0.5rem; }
    .ai-answer-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
    .ai-answer-content th { background: #f1f5f9; padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 600; }
    .ai-answer-content td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    .ai-answer-content tr:hover { background: #f8fafc; }
    .ai-answer-content strong { color: #0a1929; font-weight: 600; }
    @media (max-width: 640px) {
      .ai-answer-page h1 { font-size: 1.5rem !important; }
      .ai-answer-content table { font-size: 0.85rem; }
      .ai-answer-content th, .ai-answer-content td { padding: 0.5rem 0.25rem; }
    }
  `;

    return (
        <main className="ai-answer-page" style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 1rem',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: '#1a2a3a',
            lineHeight: 1.7,
        }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

            {/* Хлебные крошки */}
            <nav aria-label="Хлебные крошки" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Главная</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <Link href="/news" style={{ color: '#0066cc', textDecoration: 'none' }}>Полезные статьи</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span>{data.category}</span>
            </nav>

            <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: '#e0f2fe',
                color: '#0369a1',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem',
            }}>
                {data.categoryIcon} {data.category}
            </div>

            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '1rem',
                color: '#0a1929',
                lineHeight: 1.3,
            }}>
                {data.question}
            </h1>

            {/* ✅ E-E-A-T сигнал: автор и экспертиза */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#475569',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#0066cc',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                }}>
                    АК
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{data.author}</div>
                    <div style={{ fontSize: '0.8rem' }}>{data.expertise}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Обновлено: {today}
                </div>
            </div>

            {/* ✅ Краткий ответ (для голосовых помощников) */}
            <div
                className="ai-short-answer speakable-text"
                style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
                    borderLeft: '4px solid #0066cc',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    marginBottom: '2rem',
                    color: '#0c4a6e',
                }}
            >
                <strong>💡 Краткий ответ:</strong> {data.shortAnswer}
            </div>

            {/* Цена, время, гарантия */}
            {(data.price || data.duration || data.warranty) && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}>
                    {data.price && (
                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.25rem' }}>💰 Стоимость</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14532d' }}>{data.price}</div>
                        </div>
                    )}
                    {data.duration && (
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '0.25rem' }}>⏱️ Время работы</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#78350f' }}>{data.duration}</div>
                        </div>
                    )}
                    {data.warranty && (
                        <div style={{ padding: '1rem', background: '#ede9fe', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
                            <div style={{ fontSize: '0.85rem', color: '#6b21a8', marginBottom: '0.25rem' }}>🛡️ Гарантия</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#581c87' }}>{data.warranty}</div>
                        </div>
                    )}
                </div>
            )}

            {/* HowTo инструкция */}
            {data.hasHowTo && data.howToSteps && (
                <div style={{
                    padding: '1.5rem',
                    background: '#fff7ed',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid #fed7aa',
                }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, color: '#9a3412' }}>
                        📋 Пошаговая инструкция
                    </h2>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {data.howToSteps.map((step, i) => (
                            <li key={i} id={`step-${i + 1}`} style={{ marginBottom: '0.75rem', color: '#7c2d12' }}>
                                <strong>{step}</strong>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <article
                className="ai-answer-content"
                style={{ fontSize: '1.05rem', marginBottom: '2rem' }}
                dangerouslySetInnerHTML={{ __html: data.answer }}
            />

            {/* FAQ */}
            {data.faq && data.faq.length > 0 && (
                <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid #e2e8f0',
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>
                        ❓ Часто задаваемые вопросы
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.faq.map((item, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                                    {item.q}
                                </h4>
                                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Похожие вопросы */}
            <div style={{
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0',
            }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
                    🔍 Похожие вопросы
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(ANSWERS)
                        .filter(([key, val]) => key !== slug && val.category === data.category)
                        .slice(0, 3)
                        .map(([key, related]) => (
                            <Link
                                key={key}
                                href={`/ai-answers/${key}`}
                                style={{
                                    padding: '0.75rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    color: '#0066cc',
                                    textDecoration: 'none',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                {related.categoryIcon} {related.question}
                            </Link>
                        ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                borderRadius: '16px',
                color: 'white',
                marginBottom: '3rem',
                textAlign: 'center',
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 0, marginBottom: '0.5rem' }}>
                    Нужна помощь прямо сейчас?
                </h2>
                <p style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.95 }}>
                    Бесплатная консультация и диагностика при ремонте.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                        href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem 1.75rem',
                            background: '#28a745',
                            color: 'white',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        📞 {BUSINESS.phonesFormatted.primary}
                    </a>
                    <Link
                        href="/contacts"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem 1.75rem',
                            background: 'white',
                            color: '#0066cc',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        📍 Как нас найти
                    </Link>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.9 }}>
                    Адрес: {BUSINESS.mainAddress.city}, {BUSINESS.mainAddress.street}
                </p>
            </div>

            <footer style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.9rem',
            }}>
                <p>© {new Date().getFullYear()} {BUSINESS.shortName} · Ремонт цифровой техники с {BUSINESS.foundingDate} года</p>
                <p>
                    <a href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                        {BUSINESS.phonesFormatted.primary}
                    </a>
                    {' · '}
                    {BUSINESS.mainAddress.streetShort}, {BUSINESS.mainAddress.landmark} · {BUSINESS.hours.text}
                </p>
            </footer>
        </main>
    );
}