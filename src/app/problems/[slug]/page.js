// app/problems/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';

const PROBLEMS = {
    'laptop-not-turning-on': {
        title: 'Ноутбук не включается — причины и решение',
        shortAnswer: 'В 70% случаев проблема решается hard reset: отключите зарядку и зажмите кнопку питания на 15–20 секунд. Если не помогло — несите в ServiceBox на бесплатную диагностику.',
        category: 'Ноутбуки',
        icon: '💻',
        content: `
      <h2>Что делать прямо сейчас</h2>
      <ol>
        <li><strong>Hard reset</strong> — отключите зарядку, зажмите кнопку питания 15–20 секунд</li>
        <li><strong>Проверьте зарядное устройство</strong> — индикатор должен гореть</li>
        <li><strong>Извлеките батарею</strong> (если съёмная) на 1 минуту</li>
        <li><strong>Отключите всю периферию</strong> — USB-устройства, внешние диски</li>
        <li><strong>Попробуйте другую розетку</strong></li>
      </ol>
      
      <h2>Возможные причины</h2>
      <table>
        <thead><tr><th>Симптом</th><th>Причина</th><th>Цена ремонта</th></tr></thead>
        <tbody>
          <tr><td>Индикаторы не горят</td><td>Неисправен БП или цепь питания</td><td>от 2 500₽</td></tr>
          <tr><td>Включается и сразу выключается</td><td>Проблема с материнской платой</td><td>от 3 500₽</td></tr>
          <tr><td>Чёрный экран, но кулеры шумят</td><td>Неисправна видеокарта или RAM</td><td>от 2 000₽</td></tr>
          <tr><td>Писки при включении</td><td>Ошибка оборудования (BIOS)</td><td>от 1 500₽</td></tr>
          <tr><td>После залития</td><td>Коррозия платы</td><td>от 3 000₽</td></tr>
        </tbody>
      </table>
    `,
        price: 'Диагностика бесплатно при ремонте',
        duration: 'от 30 минут',
        relatedBrands: ['apple', 'asus', 'lenovo', 'hp', 'acer'],
    },

    'phone-battery-drains-fast': {
        title: 'Телефон быстро разряжается — что делать',
        shortAnswer: 'Если телефон разряжается за 3–4 часа — в 95% случаев нужна замена аккумулятора. В ServiceBox меняем батарею за 30 минут от 1 500₽ с гарантией 6–12 месяцев.',
        category: 'Телефоны',
        icon: '🔋',
        content: `
      <h2>Признаки, что пора менять батарею</h2>
      <ul>
        <li>Телефон работает меньше 4 часов при активном использовании</li>
        <li>Выключается при 20–30% заряда</li>
        <li>Вздулся задний корпус или экран</li>
        <li>iPhone показывает "Сервис" в настройках батареи</li>
        <li>Сильно греется при зарядке</li>
      </ul>
      
      <h2>Что можно сделать самостоятельно</h2>
      <ol>
        <li>Отключите фоновые приложения и геолокацию</li>
        <li>Снизьте яркость экрана</li>
        <li>Отключите "Always On Display" (Samsung)</li>
        <li>Проверьте расход батареи в настройках</li>
      </ol>
      
      <h2>Когда точно нужна замена</h2>
      <p>Если ёмкость батареи ниже 80% — замена неизбежна. Проверяем бесплатно в ServiceBox за 5 минут.</p>
    `,
        price: 'от 1 500₽',
        duration: '30 минут',
        relatedBrands: ['apple', 'samsung', 'xiaomi', 'huawei'],
    },

    'screen-artifacts': {
        title: 'Артефакты на экране — что это значит',
        shortAnswer: 'Артефакты (полосы, квадраты, искажения) — признак неисправности видеокарты. В 80% случаев проблема с GPU или памятью. Диагностика в ServiceBox — 500₽ (бесплатно при ремонте).',
        category: 'Видеокарты',
        icon: '🔥',
        content: `
      <h2>Виды артефактов и их причины</h2>
      <table>
        <thead><tr><th>Тип артефакта</th><th>Причина</th><th>Срочность</th></tr></thead>
        <tbody>
          <tr><td>Цветные квадраты</td><td>Проблема с памятью VRAM</td><td>Высокая</td></tr>
          <tr><td>Полосы горизонтальные</td><td>Отвал GPU</td><td>Критическая</td></tr>
          <tr><td>Искажение цветов</td><td>Неисправность DAC</td><td>Средняя</td></tr>
          <tr><td>Рябь при нагрузке</td><td>Перегрев или цепь питания</td><td>Высокая</td></tr>
        </tbody>
      </table>
      
      <h2>Что проверить самостоятельно</h2>
      <ol>
        <li>Обновите драйвер видеокарты</li>
        <li>Проверьте кабель HDMI/DisplayPort</li>
        <li>Измерьте температуру через GPU-Z</li>
        <li>Снизьте разгон (если есть)</li>
        <li>Запустите FurMark для теста</li>
      </ol>
    `,
        price: 'от 3 500₽',
        duration: '1–7 дней',
        relatedBrands: ['msi', 'asus'],
    },

    'laptop-overheating': {
        title: 'Ноутбук перегревается и выключается',
        shortAnswer: 'Перегрев в 90% случаев из-за пыли в системе охлаждения. Чистка + замена термопасты в ServiceBox — от 1 500₽, занимает 1–2 часа. Температура падает на 20–35°C.',
        category: 'Ноутбуки',
        icon: '🔥',
        content: `
      <h2>Признаки перегрева</h2>
      <ul>
        <li>Ноутбук горячий на ощупь</li>
        <li>Вентилятор постоянно шумит на максимуме</li>
        <li>Тормозит при нагрузке</li>
        <li>Выключается через 15–30 минут</li>
        <li>Температура CPU выше 85°C</li>
      </ul>
      
      <h2>Что делать прямо сейчас</h2>
      <ol>
        <li>Не используйте на мягких поверхностях</li>
        <li>Поставьте на ровную твёрдую поверхность</li>
        <li>Закройте ресурсоёмкие программы</li>
        <li>Используйте подставку с вентилятором</li>
      </ol>
    `,
        price: 'от 1 500₽',
        duration: '1–2 часа',
        relatedBrands: ['asus', 'lenovo', 'hp', 'acer', 'msi'],
    },

    'phone-charging-issue': {
        title: 'Телефон не заряжается — причины',
        shortAnswer: 'В 70% случаев проблема в разъёме зарядки (загрязнение или поломка). Чистка — 500₽, замена разъёма — от 1 200₽. Ремонт в ServiceBox за 30–60 минут.',
        category: 'Телефоны',
        icon: '🔌',
        content: `
      <h2>Первые действия</h2>
      <ol>
        <li>Проверьте кабель — попробуйте другой</li>
        <li>Проверьте блок питания</li>
        <li>Осмотрите разъём — нет ли грязи/пыли</li>
        <li>Аккуратно прочистите разъём деревянной зубочисткой</li>
        <li>Перезагрузите телефон</li>
      </ol>
      
      <h2>Если не помогло — несите в сервис</h2>
      <p>В 70% случаев нужна замена разъёма. Делаем за 30–60 минут при вас.</p>
    `,
        price: 'от 1 200₽',
        duration: '30–60 минут',
        relatedBrands: ['apple', 'samsung', 'xiaomi', 'huawei'],
    },

    'water-damage': {
        title: 'Техника попала в воду — что делать',
        shortAnswer: 'Немедленно выключите, не заряжайте, не сушите феном и не кладите в рис. Принесите в ServiceBox в течение 24 часов — спасаем 90% устройств. Цена от 1 500₽.',
        category: 'Общее',
        icon: '💧',
        content: `
      <h2>⚡ Первые 5 минут</h2>
      <ol>
        <li><strong>Немедленно выключите устройство</strong></li>
        <li><strong>НЕ подключайте к зарядке</strong></li>
        <li>Снимите чехол, извлеките SIM и карту памяти</li>
        <li>Промокните салфеткой (не трясите!)</li>
      </ol>
      
      <h2>❌ Чего НЕЛЬЗЯ делать</h2>
      <ul>
        <li>Сушить феном — расплавит клей</li>
        <li>Класть в рис — миф, не работает</li>
        <li>Класть на батарею — повредит компоненты</li>
        <li>Включать "проверить" — вызовет коррозию</li>
      </ul>
    `,
        price: 'от 1 500₽',
        duration: '1–3 дня',
        relatedBrands: ['apple', 'samsung', 'asus', 'lenovo'],
    },
};

export async function generateStaticParams() {
    return Object.keys(PROBLEMS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const problem = PROBLEMS[slug];
    if (!problem) return { title: 'Не найдено' };

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
    return {
        title: `${problem.title} | ServiceBox Вологда`,
        description: problem.shortAnswer,
        alternates: { canonical: `${BASE_URL}/problems/${slug}` },
    };
}

export default async function ProblemPage({ params }) {
    const { slug } = await params;
    const problem = PROBLEMS[slug];
    if (!problem) notFound();

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'HowTo',
                name: problem.title,
                description: problem.shortAnswer,
                totalTime: 'PT30M',
                step: problem.content.match(/<li><strong>([^<]+)<\/strong>/g)?.map((s, i) => ({
                    '@type': 'HowToStep',
                    position: i + 1,
                    text: s.replace(/<\/?[^>]+>/g, ''),
                })) || [],
            },
            {
                '@type': 'FAQPage',
                mainEntity: [{
                    '@type': 'Question',
                    name: problem.title,
                    acceptedAnswer: { '@type': 'Answer', text: problem.shortAnswer },
                }],
            },
        ],
    };

    return (
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui', color: '#1a2a3a', lineHeight: 1.7 }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Link href="/" style={{ color: '#0066cc' }}>Главная</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span>Неисправности</span>
            </nav>

            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '999px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {problem.icon} {problem.category}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{problem.title}</h1>

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

            {(problem.price || problem.duration) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {problem.price && (
                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#15803d' }}>💰 Цена</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{problem.price}</div>
                        </div>
                    )}
                    {problem.duration && (
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>⏱️ Время</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{problem.duration}</div>
                        </div>
                    )}
                </div>
            )}

            <article dangerouslySetInnerHTML={{ __html: problem.content }} style={{ fontSize: '1.05rem', marginBottom: '2rem' }} />

            <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center',
            }}>
                <h2 style={{ marginTop: 0 }}>Нужна помощь? Позвоните!</h2>
                <p>Бесплатная консультация и диагностика при ремонте</p>
                <a href="tel:+79115018828" style={{
                    display: 'inline-block',
                    padding: '0.85rem 1.75rem',
                    background: '#28a745',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    marginTop: '1rem',
                }}>📞 +7 (911) 501-88-28</a>
            </div>
        </main>
    );
}