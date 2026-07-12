// app/problems/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const fetchCache = 'force-cache';

// ============================================
// 🔧 ЕДИНАЯ ФУНКЦИЯ ПОЛУЧЕНИЯ BASE_URL
// (синхронизирована с sitemap.js — никаких расхождений)
// ============================================
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_BASE_URL?.trim()) {
        return process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/$/, '');
    }
    if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
        return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, '');
    }
    return 'https://servicebox35.ru';
};

// ============================================
// 📚 БАЗА ЗНАНИЙ О ПРОБЛЕМАХ
// ✅ Массив `steps` вынесен отдельно — больше никакого regex-парсинга HTML!
// ✅ Цены синхронизированы с калькулятором (PRICING из RepairCalculator.jsx)
// ============================================
const PROBLEMS = {
    'laptop-not-turning-on': {
        title: 'Ноутбук не включается — причины и решение',
        shortAnswer: 'В 70% случаев проблема решается hard reset: отключите зарядку и зажмите кнопку питания на 15–20 секунд. Если не помогло — несите в ServiceBox на бесплатную диагностику.',
        category: 'Ноутбуки',
        icon: '💻',
        // ✅ Явные шаги для валидного HowTo Schema.org
        steps: [
            'Hard reset: отключите зарядку, зажмите кнопку питания на 15–20 секунд',
            'Проверьте зарядное устройство — индикатор на блоке должен гореть',
            'Извлеките батарею (если она съёмная) на 1 минуту',
            'Отключите всю периферию — USB-устройства, внешние диски, мониторы',
            'Попробуйте включить ноутбук в другую розетку',
        ],
        content: `
      <h2>Возможные причины и стоимость ремонта</h2>
      <table>
        <thead><tr><th>Симптом</th><th>Причина</th><th>Цена работы</th></tr></thead>
        <tbody>
          <tr><td>Индикаторы не горят</td><td>Неисправен БП или цепь питания</td><td>от 2 500₽</td></tr>
          <tr><td>Включается и сразу выключается</td><td>Проблема с материнской платой</td><td>от 6 500₽</td></tr>
          <tr><td>Чёрный экран, но кулеры шумят</td><td>Неисправна видеокарта или RAM</td><td>от 5 000₽</td></tr>
          <tr><td>Писки при включении</td><td>Ошибка оборудования (BIOS)</td><td>от 1 800₽</td></tr>
          <tr><td>После залития</td><td>Коррозия платы, требуется ультразвуковая чистка</td><td>от 5 500₽</td></tr>
        </tbody>
      </table>
      <p><em>Цены указаны только за работу мастера. Запчасти рассчитываются отдельно после диагностики.</em></p>
    `,
        // ✅ Диагностика бесплатна при согласии на ремонт (как в калькуляторе)
        price: 'Диагностика 700₽ (бесплатно при ремонте)',
        duration: 'от 30 минут',
        relatedBrands: ['apple', 'asus', 'lenovo', 'hp', 'acer', 'msi', 'dell'],
        author: 'Тома',
        authorRole: 'Основатель ServiceBox, BGA-инженер',
    },

    'phone-battery-drains-fast': {
        title: 'Телефон быстро разряжается — что делать',
        shortAnswer: 'Если телефон разряжается за 3–4 часа — в 95% случаев нужна замена аккумулятора. В ServiceBox меняем батарею за 30 минут от 1 290₽ с гарантией 6–12 месяцев.',
        category: 'Телефоны',
        icon: '🔋',
        steps: [
            'Отключите фоновые приложения и геолокацию в настройках',
            'Снизьте яркость экрана до 50%',
            'Отключите режим "Always On Display" (Samsung)',
            'Проверьте расход батареи по приложениям в настройках',
            'Если ёмкость ниже 80% — запишитесь на замену в ServiceBox',
        ],
        content: `
      <h2>Признаки, что пора менять батарею</h2>
      <ul>
        <li>Телефон работает меньше 4 часов при активном использовании</li>
        <li>Выключается при 20–30% заряда</li>
        <li>Вздулся задний корпус или экран</li>
        <li>iPhone показывает «Сервис» в настройках состояния аккумулятора</li>
        <li>Сильно греется при зарядке</li>
      </ul>

      <h2>Цены на замену аккумулятора</h2>
      <table>
        <thead><tr><th>Категория</th><th>Цена работы</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Старые модели (iPhone 6/7/8, Redmi 7/8)</td><td>от 1 290₽</td><td>20–30 мин</td></tr>
          <tr><td>Средний класс (iPhone 11/12, Samsung S21)</td><td>от 2 500₽</td><td>30–40 мин</td></tr>
          <tr><td>Флагманы (iPhone 15/16 Pro, Samsung S24/S25)</td><td>от 4 500₽</td><td>40–60 мин</td></tr>
        </tbody>
      </table>
      <p><em>Проверка состояния батареи — бесплатно в ServiceBox за 5 минут.</em></p>
    `,
        price: 'от 1 290₽',
        duration: '20–60 минут',
        relatedBrands: ['apple', 'samsung', 'xiaomi', 'huawei'],
        author: 'Андрей Кознов',
        authorRole: 'Совладелец ServiceBox, мастер-диагност',
    },

    'screen-artifacts': {
        title: 'Артефакты на экране — что это значит',
        shortAnswer: 'Артефакты (полосы, квадраты, искажения) — признак неисправности видеокарты. В 80% случаев проблема с GPU или видеопамятью VRAM. Диагностика в ServiceBox — 700₽ (бесплатно при согласии на ремонт).',
        category: 'Видеокарты',
        icon: '🔥',
        steps: [
            'Обновите драйвер видеокарты до последней версии с сайта NVIDIA/AMD',
            'Проверьте кабель HDMI/DisplayPort — замените при подозрении на поломку',
            'Измерьте температуру через GPU-Z или HWMonitor',
            'Снимите разгон GPU и памяти, если он есть',
            'Запустите стресс-тест FurMark на 10 минут для проверки стабильности',
        ],
        content: `
      <h2>Виды артефактов и их причины</h2>
      <table>
        <thead><tr><th>Тип артефакта</th><th>Причина</th><th>Срочность</th></tr></thead>
        <tbody>
          <tr><td>Цветные квадраты</td><td>Отвал чипов видеопамяти VRAM</td><td>Высокая</td></tr>
          <tr><td>Горизонтальные полосы</td><td>Отвал GPU, требуется реболл</td><td>Критическая</td></tr>
          <tr><td>Искажение цветов</td><td>Неисправность DAC или цепи питания</td><td>Средняя</td></tr>
          <tr><td>Рябь при нагрузке</td><td>Перегрев или неисправность VRM</td><td>Высокая</td></tr>
        </tbody>
      </table>

      <h2>Стоимость ремонта в ServiceBox</h2>
      <table>
        <thead><tr><th>Услуга</th><th>Цена</th><th>Гарантия</th></tr></thead>
        <tbody>
          <tr><td>Реболл GPU (BGA-пайка)</td><td>от 5 500₽</td><td>12 месяцев</td></tr>
          <tr><td>Замена видеочипа</td><td>от 8 000₽</td><td>12 месяцев</td></tr>
          <tr><td>Замена видеопамяти VRAM</td><td>от 5 500₽</td><td>12 месяцев</td></tr>
          <tr><td>Ремонт цепи питания</td><td>от 4 500₽</td><td>6 месяцев</td></tr>
        </tbody>
      </table>
    `,
        price: 'от 4 500₽',
        duration: '2–7 дней',
        relatedBrands: ['msi', 'asus', 'gigabyte', 'palit'],
        author: 'Тома',
        authorRole: 'Основатель ServiceBox, BGA-инженер',
    },

    'laptop-overheating': {
        title: 'Ноутбук перегревается и выключается',
        shortAnswer: 'Перегрев в 90% случаев вызван пылью в системе охлаждения. Чистка + замена термопасты в ServiceBox — от 2 800₽, занимает 1–2 часа. Температура падает на 20–35°C.',
        category: 'Ноутбуки',
        icon: '🔥',
        steps: [
            'Не используйте ноутбук на мягких поверхностях (кровать, диван)',
            'Поставьте на ровную твёрдую поверхность или подставку с вентилятором',
            'Закройте ресурсоёмкие программы через Диспетчер задач',
            'Проверьте температуру CPU через HWMonitor (норма до 85°C)',
            'Если температура выше — запишитесь на чистку в ServiceBox',
        ],
        content: `
      <h2>Признаки перегрева</h2>
      <ul>
        <li>Ноутбук горячий на ощупь в зоне клавиатуры</li>
        <li>Вентилятор постоянно шумит на максимальных оборотах</li>
        <li>Тормозит при нагрузке (троттлинг)</li>
        <li>Выключается через 15–30 минут работы</li>
        <li>Температура CPU/GPU стабильно выше 90°C</li>
      </ul>

      <h2>Цены на обслуживание системы охлаждения</h2>
      <table>
        <thead><tr><th>Тип ноутбука</th><th>Цена работы</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Офисные (ASUS VivoBook, Lenovo IdeaPad)</td><td>от 2 800₽</td><td>1 час</td></tr>
          <tr><td>Игровые (ROG, Legion, Omen)</td><td>от 3 500₽</td><td>1.5 часа</td></tr>
          <tr><td>MacBook (с заменой термопрокладок)</td><td>от 4 200₽</td><td>1.5 часа</td></tr>
        </tbody>
      </table>
      <p><em>Используем термопасту Thermal Grizzly Kryonaut и качественные термопрокладки.</em></p>
    `,
        price: 'от 2 800₽',
        duration: '1–2 часа',
        relatedBrands: ['asus', 'lenovo', 'hp', 'acer', 'msi', 'apple'],
        author: 'Андрей Кознов',
        authorRole: 'Совладелец ServiceBox, мастер-диагност',
    },

    'phone-charging-issue': {
        title: 'Телефон не заряжается — причины',
        shortAnswer: 'В 70% случаев проблема в разъёме зарядки (загрязнение или поломка). Чистка — 800₽, замена разъёма — от 1 800₽. Ремонт в ServiceBox за 40 минут — 2 часа.',
        category: 'Телефоны',
        icon: '🔌',
        steps: [
            'Проверьте кабель — попробуйте зарядить другим кабелем',
            'Проверьте блок питания в другой розетке',
            'Осмотрите разъём — нет ли в нём пыли, ворса, грязи',
            'Аккуратно прочистите разъём деревянной зубочисткой (НЕ металлической иголкой!)',
            'Перезагрузите телефон и повторите попытку зарядки',
        ],
        content: `
      <h2>Стоимость ремонта разъёма в ServiceBox</h2>
      <table>
        <thead><tr><th>Тип разъёма</th><th>Цена работы</th><th>Время</th></tr></thead>
        <tbody>
          <tr><td>Micro-USB (старые Android)</td><td>от 1 800₽</td><td>40 мин – 2 часа</td></tr>
          <tr><td>USB Type-C (современные Android)</td><td>от 2 800₽</td><td>40 мин – 2 часа</td></tr>
          <tr><td>Lightning (iPhone)</td><td>от 3 200₽</td><td>40 мин – 2 часа</td></tr>
          <tr><td>Чистка разъёма без замены</td><td>800₽</td><td>15 мин</td></tr>
        </tbody>
      </table>
      <p><em>Если самостоятельная чистка зубочисткой не помогла — не пытайтесь чинить иголкой, это вызовет короткое замыкание.</em></p>
    `,
        price: 'от 1 800₽',
        duration: '40 минут — 2 часа',
        relatedBrands: ['apple', 'samsung', 'xiaomi', 'huawei'],
        author: 'Андрей Кознов',
        authorRole: 'Совладелец ServiceBox, мастер-диагност',
    },

    'water-damage': {
        title: 'Техника попала в воду — что делать',
        shortAnswer: 'Немедленно выключите, НЕ заряжайте, НЕ сушите феном и НЕ кладите в рис. Принесите в ServiceBox в течение 24 часов — спасаем 90% устройств. Ультразвуковая чистка от 4 500₽ для смартфонов.',
        category: 'Общее',
        icon: '💧',
        steps: [
            'Немедленно выключите устройство (удерживайте кнопку питания 10 секунд)',
            'НЕ подключайте к зарядке и не пытайтесь включить "проверить"',
            'Снимите чехол, извлеките SIM-карту и карту памяти',
            'Аккуратно промокните влагу салфеткой (НЕ трясите устройство!)',
            'НЕ сушите феном, на батарее и не кладите в рис — это мифы',
            'Как можно скорее принесите в ServiceBox (ул. Северная, 7А)',
        ],
        content: `
      <h2>❌ Чего НЕЛЬЗЯ делать</h2>
      <ul>
        <li><strong>Сушить феном</strong> — горячий воздух расплавит клей и загонит воду глубже</li>
        <li><strong>Класть в рис</strong> — это миф, рис не впитывает влагу из-под микросхем</li>
        <li><strong>Класть на батарею</strong> — перегрев повредит аккумулятор</li>
        <li><strong>Включать "проверить"</strong> — вызовет электрохимическую коррозию</li>
      </ul>

      <h2>Стоимость восстановления в ServiceBox</h2>
      <table>
        <thead><tr><th>Тип устройства</th><th>Цена работы</th><th>Срок</th></tr></thead>
        <tbody>
          <tr><td>Смартфон (ультразвуковая чистка)</td><td>от 4 500₽</td><td>1–5 дней</td></tr>
          <tr><td>Ноутбук</td><td>от 5 500₽</td><td>2–7 дней</td></tr>
          <tr><td>Планшет</td><td>от 4 500₽</td><td>2–5 дней</td></tr>
        </tbody>
      </table>
      <p><em>Чем быстрее принесёте — тем выше шанс спасти данные и само устройство. Критический срок — 24 часа.</em></p>
    `,
        price: 'от 4 500₽',
        duration: '1–7 дней',
        relatedBrands: ['apple', 'samsung', 'asus', 'lenovo'],
        author: 'Тома',
        authorRole: 'Основатель ServiceBox, BGA-инженер',
    },
};

export async function generateStaticParams() {
    return Object.keys(PROBLEMS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const problem = PROBLEMS[slug];
    if (!problem) return { title: 'Не найдено' };

    const BASE_URL = getBaseUrl();
    return {
        title: `${problem.title} | ServiceBox Вологда`,
        description: problem.shortAnswer,
        alternates: { canonical: `${BASE_URL}/problems/${slug}` },
        authors: [{ name: problem.author, url: `${BASE_URL}/about` }],
        keywords: `${problem.category.toLowerCase()}, ${problem.title.toLowerCase()}, ServiceBox, ремонт Вологда`,
        openGraph: {
            title: problem.title,
            description: problem.shortAnswer,
            url: `${BASE_URL}/problems/${slug}`,
            siteName: 'ServiceBox Вологда',
            type: 'article',
            locale: 'ru_RU',
        },
    };
}

export default async function ProblemPage({ params }) {
    const { slug } = await params;
    const problem = PROBLEMS[slug];
    if (!problem) notFound();

    const BASE_URL = getBaseUrl();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            // 1. HowTo
            {
                '@type': 'HowTo',
                '@id': `${BASE_URL}/problems/${slug}#howto`,
                name: problem.title,
                description: problem.shortAnswer,
                totalTime: 'PT30M',
                step: problem.steps.map((text, i) => ({
                    '@type': 'HowToStep',
                    position: i + 1,
                    name: `Шаг ${i + 1}`,
                    text: text,
                    url: `${BASE_URL}/problems/${slug}#step-${i + 1}`,
                })),
            },
            // 2. FAQPage
            {
                '@type': 'FAQPage',
                '@id': `${BASE_URL}/problems/${slug}#faq`,
                mainEntity: [{
                    '@type': 'Question',
                    name: problem.title,
                    acceptedAnswer: { '@type': 'Answer', text: problem.shortAnswer },
                }],
            },
            // 3. TechArticle (E-E-A-T)
            {
                '@type': 'TechArticle',
                '@id': `${BASE_URL}/problems/${slug}#article`,
                headline: problem.title,
                description: problem.shortAnswer,
                author: {
                    '@type': 'Person',
                    name: problem.author,
                    jobTitle: problem.authorRole,
                    worksFor: { '@id': `${BASE_URL}#business` },  // ссылка
                },
                publisher: { '@id': `${BASE_URL}#business` },    // ссылка
                datePublished: '2024-01-15',
                dateModified: new Date().toISOString().split('T')[0],
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/problems/${slug}` },
                articleSection: problem.category,
                inLanguage: 'ru-RU',
            },
            // 4. BreadcrumbList
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Главная', item: BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Полезные статьи', item: `${BASE_URL}/news` },
                    { '@type': 'ListItem', position: 3, name: problem.category, item: `${BASE_URL}/problems/${slug}` },
                ],
            },
        ],
    };

    return (
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui', color: '#1a2a3a', lineHeight: 1.7 }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Хлебные крошки */}
            <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Link href="/" style={{ color: '#0066cc' }}>Главная</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <Link href="/news" style={{ color: '#0066cc' }}>Полезные статьи</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span>Неисправности</span>
            </nav>

            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                {problem.icon} {problem.category}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0a1929' }}>
                {problem.title}
            </h1>

            {/* ✅ E-E-A-T: автор и его экспертиза */}
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
                    {problem.author.charAt(0)}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{problem.author}</div>
                    <div style={{ fontSize: '0.8rem' }}>{problem.authorRole}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Обновлено: {new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>

            {/* Краткий ответ */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                fontSize: '1.1rem',
                marginBottom: '2rem',
            }}>
                💡 <strong>Краткий ответ:</strong> {problem.shortAnswer}
            </div>

            {/* Цена и время */}
            {(problem.price || problem.duration) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {problem.price && (
                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.25rem' }}>💰 Цена</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14532d' }}>{problem.price}</div>
                        </div>
                    )}
                    {problem.duration && (
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '0.25rem' }}>⏱️ Время</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#78350f' }}>{problem.duration}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Пошаговая инструкция (HowTo) */}
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
                    {problem.steps.map((step, i) => (
                        <li key={i} id={`step-${i + 1}`} style={{ marginBottom: '0.75rem', color: '#7c2d12' }}>
                            <strong>{step}</strong>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Основной контент */}
            <article dangerouslySetInnerHTML={{ __html: problem.content }} style={{ fontSize: '1.05rem', marginBottom: '2rem' }} />

            {/* CTA */}
            <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #0066cc 0%, var(--color-primary-dark) 100%)',
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center',
            }}>
                <h2 style={{ marginTop: 0 }}>Нужна помощь? Позвоните мастерам!</h2>
                <p>Тома и Андрей проведут бесплатную консультацию</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <a href="tel:+79115018828" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.85rem 1.75rem',
                        background: '#28a745',
                        color: 'white',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>📞 +7 (911) 501-88-28</a>
                    <Link href="/contacts" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.85rem 1.75rem',
                        background: 'white',
                        color: '#0066cc',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>📍 Как нас найти</Link>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.9 }}>
                    Вологда, ул. Северная, 7А · Ежедневно 10:00–20:00
                </p>
            </div>
        </main>
    );
}