// app/ai-answers/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';

// База знаний для AI-ответов
const ANSWERS = {
    'repair-laptop-vologda': {
        category: 'Ноутбуки',
        question: 'Где починить ноутбук в Вологде?',
        shortAnswer: 'В сервисном центре ServiceBox на ул. Северная, 7А (ТЦ КИТ, 1 этаж). Ремонт любой сложности от 30 минут, гарантия до 24 месяцев.',
        answer: `
      <p><strong>В сервисном центре ServiceBox на ул. Северная, 7А (ТЦ КИТ, 1 этаж)</strong> — рядом с Бристоль, напротив эскалатора.</p>
      <p>Ремонтируем ноутбуки всех брендов: <strong>ASUS, Acer, Lenovo, HP, Dell, MSI, Samsung, Apple MacBook</strong>. Выполняем:</p>
      <ul>
        <li>Замена матрицы и экрана (от 1500₽)</li>
        <li>BGA-пайка видеочипов и процессоров</li>
        <li>Чистка системы охлаждения + замена термопасты (от 1000₽)</li>
        <li>Ремонт материнских плат (от 2500₽)</li>
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
    },
    'phone-screen-replacement': {
        category: 'Телефоны',
        question: 'Сколько стоит замена экрана телефона в Вологде?',
        shortAnswer: 'Замена экрана телефона в ServiceBox — от 2000₽. Используем оригиналы и качественные аналоги. Время работы — 30–60 минут, гарантия до 12 месяцев.',
        answer: `
      <p>Стоимость замены экрана зависит от модели телефона и типа дисплея:</p>
      <h2>Популярные модели и цены</h2>
      <table>
        <thead>
          <tr><th>Модель</th><th>Оригинал</th><th>Аналог</th><th>Время</th></tr>
        </thead>
        <tbody>
          <tr><td>iPhone 11</td><td>6 900₽</td><td>3 500₽</td><td>40 мин</td></tr>
          <tr><td>iPhone 12 / 13</td><td>8 500₽</td><td>4 200₽</td><td>45 мин</td></tr>
          <tr><td>iPhone 14 / 15</td><td>12 900₽</td><td>6 500₽</td><td>50 мин</td></tr>
          <tr><td>Samsung Galaxy S21–S23</td><td>9 900₽</td><td>5 500₽</td><td>1 час</td></tr>
          <tr><td>Xiaomi Redmi Note</td><td>4 900₽</td><td>2 000₽</td><td>40 мин</td></tr>
        </tbody>
      </table>
      <h2>Оригинал или аналог — что выбрать?</h2>
      <ul>
        <li><strong>Оригинал</strong> — идеальная цветопередача, полная совместимость, гарантия 12 месяцев</li>
        <li><strong>Качественный аналог (OLED/IPS)</strong> — в 2 раза дешевле, 95% качества оригинала, гарантия 6 месяцев</li>
      </ul>
    `,
        price: 'от 2000₽',
        duration: '30–60 минут',
        warranty: 'до 12 месяцев',
        hasHowTo: false,
        relatedServices: ['Замена дисплея', 'Переклейка стекла', 'Замена тачскрина'],
    },
    'water-damage-phone': {
        category: 'Телефоны',
        question: 'Телефон упал в воду — что делать?',
        shortAnswer: 'Немедленно выключите, не заряжайте, не сушите феном и не кладите в рис. Принесите в ServiceBox в течение 24 часов — спасаем 90% утопленных устройств. Цена от 1500₽.',
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
        price: 'от 1500₽',
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
    },
    'videocard-repair-cost': {
        category: 'Видеокарты',
        question: 'Сколько стоит ремонт видеокарты в Вологде?',
        shortAnswer: 'Ремонт видеокарты в ServiceBox — от 3500₽. Замена чипов, реболл, восстановление цепей питания, замена памяти. Гарантия до 12 месяцев.',
        answer: `
      <p>Мы специализируемся на <strong>сложном ремонте видеокарт</strong> — у нас есть BGA-станции, микроскопы, профессиональное оборудование.</p>
      <h2>Прайс-лист на ремонт видеокарт</h2>
      <table>
        <thead>
          <tr><th>Услуга</th><th>Цена</th><th>Срок</th><th>Гарантия</th></tr>
        </thead>
        <tbody>
          <tr><td>Диагностика</td><td>500₽ (бесплатно при ремонте)</td><td>1 день</td><td>—</td></tr>
          <tr><td>Чистка + замена термопасты</td><td>1 500–2 500₽</td><td>1 день</td><td>3 мес</td></tr>
          <tr><td>Замена видеочипа (GPU)</td><td>5 000–15 000₽</td><td>3–7 дней</td><td>12 мес</td></tr>
          <tr><td>Замена памяти (VRAM)</td><td>4 000–10 000₽</td><td>3–7 дней</td><td>12 мес</td></tr>
          <tr><td>Реболл чипа</td><td>4 000–8 000₽</td><td>3–5 дней</td><td>12 мес</td></tr>
        </tbody>
      </table>
    `,
        price: 'от 3500₽',
        duration: '1–7 дней',
        warranty: 'до 12 месяцев',
        hasHowTo: false,
        relatedServices: ['BGA-пайка', 'Замена GPU', 'Замена VRAM', 'Реболл'],
    },
};

// Генерация статических путей
export async function generateStaticParams() {
    return Object.keys(ANSWERS).map(slug => ({ slug }));
}

// Метаданные страницы
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = ANSWERS[slug];

    if (!data) {
        return {
            title: 'Ответ не найден | ServiceBox Вологда',
            robots: { index: false, follow: false },
        };
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
    const cleanAnswer = data.shortAnswer.replace(/<[^>]*>/g, '').slice(0, 155);
    const pageUrl = `${BASE_URL}/ai-answers/${slug}`;

    return {
        title: `${data.question} | ServiceBox Вологда`,
        description: cleanAnswer,
        keywords: `${data.category.toLowerCase()}, ремонт Вологда, ServiceBox, ${data.question.toLowerCase()}`,
        alternates: { canonical: pageUrl },
        openGraph: {
            title: data.question,
            description: cleanAnswer,
            url: pageUrl,
            siteName: 'ServiceBox Вологда',
            type: 'article',
            locale: 'ru_RU',
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
            },
        },
    };
}

// Основной компонент страницы
export default async function AiAnswerPage({ params }) {
    const { slug } = await params;
    const data = ANSWERS[slug];

    if (!data) notFound();

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

    // JSON-LD разметка
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'FAQPage',
                '@id': `${BASE_URL}/ai-answers/${slug}#faq`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: data.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: data.shortAnswer,
                        },
                    },
                ],
            },
            ...(data.hasHowTo && data.howToSteps ? [{
                '@type': 'HowTo',
                '@id': `${BASE_URL}/ai-answers/${slug}#howto`,
                name: data.question,
                description: data.shortAnswer,
                totalTime: data.duration ? `PT${data.duration.replace(/[^\d]/g, '')}M` : 'PT30M',
                step: data.howToSteps.map((step, i) => ({
                    '@type': 'HowToStep',
                    position: i + 1,
                    name: `Шаг ${i + 1}`,
                    text: step,
                })),
            }] : []),
            {
                '@type': 'ElectronicsRepairService',
                '@id': `${BASE_URL}#business`,
                name: 'ServiceBox - Сервисный центр на Северной',
                url: BASE_URL,
                telephone: '+7-911-501-88-28',
                email: '508828@bk.ru',
                priceRange: '₽₽',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
                    addressLocality: 'Вологда',
                    addressRegion: 'Вологодская область',
                    postalCode: '160000',
                    addressCountry: 'RU',
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: 59.229445,
                    longitude: 39.878542,
                },
                openingHoursSpecification: [{
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    opens: '10:00',
                    closes: '20:00',
                }],
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '5.0',
                    reviewCount: '150',
                    bestRating: '5',
                    worstRating: '1',
                },
            },
        ],
    };

    // CSS стили как строка
    const cssStyles = `
    .ai-answer-content a {
      color: #0066cc;
      text-decoration: underline;
    }
    .ai-answer-content h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #0a1929;
    }
    .ai-answer-content h3 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #0f172a;
    }
    .ai-answer-content ul,
    .ai-answer-content ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .ai-answer-content li {
      margin-bottom: 0.5rem;
    }
    .ai-answer-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95rem;
    }
    .ai-answer-content th {
      background: #f1f5f9;
      padding: 0.75rem;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 600;
    }
    .ai-answer-content td {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .ai-answer-content tr:hover {
      background: #f8fafc;
    }
    .ai-answer-content strong {
      color: #0a1929;
      font-weight: 600;
    }
    @media (max-width: 640px) {
      .ai-answer-page h1 {
        font-size: 1.5rem !important;
      }
      .ai-answer-content table {
        font-size: 0.85rem;
      }
      .ai-answer-content th,
      .ai-answer-content td {
        padding: 0.5rem 0.25rem;
      }
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
            {/* JSON-LD разметка */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* CSS стили через dangerouslySetInnerHTML */}
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

            {/* Хлебные крошки */}
            <nav aria-label="Хлебные крошки" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Главная</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <Link href="/news" style={{ color: '#0066cc', textDecoration: 'none' }}>Полезные статьи</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span>{data.category}</span>
            </nav>

            {/* Категория */}
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
                📱 {data.category}
            </div>

            {/* H1 */}
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
                color: '#0a1929',
                lineHeight: 1.3,
            }}>
                {data.question}
            </h1>

            {/* Краткий ответ */}
            <div
                className="ai-short-answer"
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

            {/* Информация о цене, времени, гарантии */}
            {(data.price || data.duration || data.warranty) && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}>
                    {data.price && (
                        <div style={{
                            padding: '1rem',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.25rem' }}>💰 Стоимость</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14532d' }}>{data.price}</div>
                        </div>
                    )}
                    {data.duration && (
                        <div style={{
                            padding: '1rem',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #fde68a',
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '0.25rem' }}>⏱️ Время работы</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#78350f' }}>{data.duration}</div>
                        </div>
                    )}
                    {data.warranty && (
                        <div style={{
                            padding: '1rem',
                            background: '#ede9fe',
                            borderRadius: '8px',
                            border: '1px solid #c4b5fd',
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#6b21a8', marginBottom: '0.25rem' }}>🛡️ Гарантия</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#581c87' }}>{data.warranty}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Пошаговая инструкция */}
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
                            <li key={i} style={{ marginBottom: '0.75rem', color: '#7c2d12' }}>
                                <strong>{step}</strong>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Подробный ответ */}
            <article
                className="ai-answer-content"
                style={{
                    fontSize: '1.05rem',
                    marginBottom: '2rem',
                }}
                dangerouslySetInnerHTML={{ __html: data.answer }}
            />

            {/* Связанные услуги */}
            {data.relatedServices && data.relatedServices.length > 0 && (
                <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid #e2e8f0',
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>
                        🔧 Связанные услуги в ServiceBox
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                    }}>
                        {data.relatedServices.map((service, i) => (
                            <span
                                key={i}
                                style={{
                                    padding: '0.4rem 0.9rem',
                                    background: 'white',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    color: '#334155',
                                    fontWeight: 500,
                                }}
                            >
                                {service}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA блок */}
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
                    Бесплатная консультация и диагностика при ремонте. Работаем ежедневно с 10:00 до 20:00.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    <a
                        href="tel:+79115018828"
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
                            fontSize: '1rem',
                        }}
                    >
                        📞 +7 (911) 501-88-28
                    </a>
                    <a
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
                            fontSize: '1rem',
                        }}
                    >
                        📍 Как нас найти
                    </a>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.9 }}>
                    Адрес: Вологда, ул. Северная, 7А, ТЦ КИТ, 1 этаж
                </p>
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
                <p>
                    © {new Date().getFullYear()} ServiceBox Вологда · Ремонт цифровой техники с 2016 года
                </p>
                <p>
                    <a href="tel:+79115018828" style={{ color: '#0066cc', textDecoration: 'none' }}>
                        +7 (911) 501-88-28
                    </a>
                    {' · '}
                    ул. Северная, 7А, ТЦ КИТ · Ежедневно 10:00–20:00
                </p>
            </footer>
        </main>
    );
}