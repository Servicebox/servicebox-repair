// app/brands/page.js
import Link from 'next/link';
import Image from 'next/image';
import { BASE_URL, BUSINESS } from '@/lib/constants';

// === БАЗА БРЕНДОВ (должна совпадать с [slug]/page.js) ===
const BRANDS = [
    { slug: 'apple', name: 'Apple', logo: '/images/apple.png.webp', category: 'Телефоны, ноутбуки, планшеты', popular: ['iPhone', 'MacBook', 'iPad', 'Apple Watch'] },
    { slug: 'samsung', name: 'Samsung', logo: '/images/samsung.png.webp', category: 'Телефоны, планшеты, ТВ', popular: ['Galaxy S', 'Galaxy A', 'Galaxy Tab', 'Galaxy Watch'] },
    { slug: 'xiaomi', name: 'Xiaomi', logo: '/images/xiaomi.png.webp', category: 'Телефоны', popular: ['Redmi Note', 'Poco', 'Mi', 'Black Shark'] },
    { slug: 'huawei', name: 'Huawei', logo: '/images/huaw.png.webp', category: 'Телефоны', popular: ['P-серия', 'Mate', 'Nova', 'Honor'] },
    { slug: 'asus', name: 'ASUS', logo: '/images/asus.png.webp', category: 'Ноутбуки', popular: ['ROG', 'ZenBook', 'VivoBook', 'TUF'] },
    { slug: 'lenovo', name: 'Lenovo', logo: '/images/lenovo.png.webp', category: 'Ноутбуки', popular: ['ThinkPad', 'IdeaPad', 'Legion', 'Yoga'] },
    { slug: 'hp', name: 'HP', logo: '/images/hp.png.webp', category: 'Ноутбуки', popular: ['Pavilion', 'Envy', 'Omen', 'EliteBook'] },
    { slug: 'acer', name: 'Acer', logo: '/images/acer.png.webp', category: 'Ноутбуки', popular: ['Aspire', 'Predator', 'Swift', 'Nitro'] },
    { slug: 'msi', name: 'MSI', logo: '/images/msi.png.webp', category: 'Игровые ноутбуки', popular: ['Raider', 'Stealth', 'Katana', 'Pulse'] },
    { slug: 'dell', name: 'Dell', logo: '/images/dell.png.webp', category: 'Ноутбуки', popular: ['XPS', 'Inspiron', 'Latitude', 'Alienware'] },
    { slug: 'sony', name: 'Sony', logo: '/images/sony.png.webp', category: 'Приставки, телефоны', popular: ['PlayStation 4', 'PlayStation 5', 'Xperia'] },
    { slug: 'lg', name: 'LG', logo: '/images/lg.png.webp', category: 'Телевизоры', popular: ['OLED', 'NanoCell', 'UHD'] },
];

// Метаданные страницы
export const metadata = {
    title: 'Ремонт техники всех брендов в Вологде | ServiceBox',
    description: 'Ремонт Apple, Samsung, Xiaomi, Huawei, ASUS, Lenovo, HP, Acer, MSI, Dell, Sony, LG в Вологде. Гарантия до 24 месяцев, срочный ремонт от 30 минут. Бесплатная диагностика.',
    keywords: 'ремонт техники вологда, ремонт apple, ремонт samsung, ремонт xiaomi, сервисный центр всех брендов',
    alternates: {
        canonical: `${BASE_URL}/brands`,
    },
    openGraph: {
        title: 'Ремонт техники всех брендов в Вологде | ServiceBox',
        description: 'Apple, Samsung, Xiaomi, Huawei, ASUS, Lenovo, HP и другие. Гарантия до 24 месяцев.',
        url: `${BASE_URL}/brands`,
        siteName: BUSINESS.shortName,
        type: 'website',
        locale: 'ru_RU',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Ремонт техники всех брендов в Вологде' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ремонт техники всех брендов в Вологде | ServiceBox',
        description: 'Apple, Samsung, Xiaomi, Huawei, ASUS, Lenovo, HP и другие. Гарантия до 24 месяцев.',
        images: ['/og-image.jpg'],
    },
};

export default function BrandsPage() {
    // JSON-LD разметка
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${BASE_URL}/brands`,
                name: 'Ремонт техники всех брендов в Вологде',
                description: 'Профессиональный ремонт техники Apple, Samsung, Xiaomi, Huawei, ASUS, Lenovo, HP, Acer, MSI, Dell, Sony, LG в сервисном центре ServiceBox.',
                url: `${BASE_URL}/brands`,
                isPartOf: { '@id': `${BASE_URL}#website` },
                about: { '@id': `${BASE_URL}#business` },
                mainEntity: {
                    '@type': 'ItemList',
                    itemListElement: BRANDS.map((brand, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: `Ремонт ${brand.name}`,
                        url: `${BASE_URL}/brands/${brand.slug}`,
                    })),
                },
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'Какие бренды техники вы ремонтируете?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Ремонтируем все популярные бренды: Apple (iPhone, MacBook, iPad), Samsung (Galaxy), Xiaomi (Redmi, Poco), Huawei, Honor, ASUS (ROG, ZenBook), Lenovo (ThinkPad, Legion), HP (Omen, Pavilion), Acer (Predator), MSI, Dell (XPS, Alienware), Sony (PlayStation), LG. Если вашего бренда нет в списке — всё равно приносите, починим!',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Используете ли вы оригинальные запчасти?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Да, мы используем оригинальные запчасти от официальных поставщиков и качественные сертифицированные аналоги. Выбор за клиентом — мы всегда предлагаем оба варианта с честным сравнением.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Какая гарантия на ремонт?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Гарантия от 3 до 24 месяцев в зависимости от вида работ и типа устройства. На запчасти Apple — до 12 месяцев, на работы по чистке — 3 месяца. Гарантия оформляется официально.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Сколько времени занимает ремонт?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Большинство работ выполняем за 30–60 минут при вас: замена экрана, батареи, разъёмов. Сложный ремонт (BGA-пайка, материнские платы) — от 1 до 7 дней. Срочный ремонт с доплатой 500₽.',
                        },
                    },
                ],
            },
        ],
    };

    // CSS стили
    const cssStyles = `
    .brands-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a2a3a;
      line-height: 1.7;
    }

    .brands-hero {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
      border-radius: 24px;
      margin-bottom: 3rem;
    }

    .brands-hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: #0a1929;
    }

    .brands-hero p {
      font-size: 1.2rem;
      color: #475569;
      max-width: 700px;
      margin: 0 auto;
    }

    .brands-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .brands-stat {
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      text-align: center;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .brands-stat-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .brands-stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-primary-dark);
    }

    .brands-stat-label {
      font-size: 0.9rem;
      color: #64748b;
    }

    .brands-section-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 2rem 0 1.5rem 0;
      color: #0a1929;
      padding-bottom: 0.75rem;
      border-bottom: 3px solid var(--color-primary-dark);
    }

    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .brand-card {
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .brand-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .brand-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 102, 204, 0.15);
      border-color: var(--color-primary-dark);
    }

    .brand-card:hover::before {
      transform: scaleX(1);
    }

    .brand-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .brand-card-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      background: #f8fafc;
      padding: 0.5rem;
      border-radius: 12px;
    }

    .brand-card-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0a1929;
      margin: 0;
    }

    .brand-card-category {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
    }

    .brand-card-models {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: auto;
    }

    .brand-card-model {
      padding: 0.3rem 0.7rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .brand-card-arrow {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      color: var(--color-primary-dark);
      font-size: 1.5rem;
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.3s ease;
    }

    .brand-card:hover .brand-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .brands-cta {
      padding: 3rem 2rem;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%);
      border-radius: 24px;
      color: white;
      text-align: center;
      margin: 3rem 0;
      box-shadow: 0 10px 40px rgba(0, 102, 204, 0.3);
    }

    .brands-cta h2 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
    }

    .brands-cta p {
      font-size: 1.1rem;
      opacity: 0.95;
      margin-bottom: 2rem;
    }

    .brands-cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .brands-cta-button {
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.05rem;
      transition: transform 0.2s;
    }

    .brands-cta-button:hover {
      transform: translateY(-2px);
    }

    .brands-cta-button-primary {
      background: #28a745;
      color: white;
    }

    .brands-cta-button-secondary {
      background: white;
      color: var(--color-primary-dark);
    }

    .brands-advantages {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin: 3rem 0;
    }

    .brands-advantage {
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    .brands-advantage-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .brands-advantage-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0.5rem 0;
      color: #0a1929;
    }

    .brands-advantage-text {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    @media (max-width: 768px) {
      .brands-hero h1 {
        font-size: 1.75rem;
      }
      .brands-hero p {
        font-size: 1rem;
      }
      .brands-grid {
        grid-template-columns: 1fr;
      }
      .brands-cta h2 {
        font-size: 1.5rem;
      }
    }
  `;

    return (
        <main className="brands-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

            {/* Хлебные крошки */}
            <nav style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Link href="/" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none' }}>Главная</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <Link href="/services" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none' }}>Услуги</Link>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span>Все бренды</span>
            </nav>

            {/* Hero секция */}
            <div className="brands-hero">
                <h1>🔧 Ремонт техники всех брендов в Вологде</h1>
                <p>
                    ServiceBox — специализированный сервисный центр с опытом более 10 лет.
                    Ремонтируем смартфоны, ноутбуки, планшеты, телевизоры и игровые приставки
                    любых производителей с гарантией до 24 месяцев.
                </p>
            </div>

            {/* Статистика */}
            <div className="brands-stats">
                <div className="brands-stat">
                    <div className="brands-stat-icon">🏆</div>
                    <div className="brands-stat-value">12+</div>
                    <div className="brands-stat-label">брендов в ремонте</div>
                </div>
                <div className="brands-stat">
                    <div className="brands-stat-icon">⚡</div>
                    <div className="brands-stat-value">30 мин</div>
                    <div className="brands-stat-label">срочный ремонт</div>
                </div>
                <div className="brands-stat">
                    <div className="brands-stat-icon">🛡️</div>
                    <div className="brands-stat-value">24 мес</div>
                    <div className="brands-stat-label">гарантия</div>
                </div>
                <div className="brands-stat">
                    <div className="brands-stat-icon">⭐</div>
                    <div className="brands-stat-value">5.0</div>
                    <div className="brands-stat-label">150+ отзывов</div>
                </div>
            </div>

            {/* Заголовок секции */}
            <h2 className="brands-section-title">📱 Выберите ваш бренд</h2>

            {/* Сетка брендов */}
            <div className="brands-grid">
                {BRANDS.map((brand) => (
                    <Link key={brand.slug} href={`/brands/${brand.slug}`} className="brand-card">
                        <div className="brand-card-header">
                            <Image
                                src={brand.logo}
                                alt={`Ремонт ${brand.name}`}
                                className="brand-card-logo"
                                width={60}
                                height={60}
                            />
                            <div>
                                <h3 className="brand-card-name">{brand.name}</h3>
                                <p className="brand-card-category">{brand.category}</p>
                            </div>
                        </div>
                        <div className="brand-card-models">
                            {brand.popular.map((model, i) => (
                                <span key={i} className="brand-card-model">{model}</span>
                            ))}
                        </div>
                        <div className="brand-card-arrow">→</div>
                    </Link>
                ))}
            </div>

            {/* Блок "Не нашли свой бренд?" */}
            <div className="brands-cta">
                <h2>🤔 Не нашли свой бренд?</h2>
                <p>
                    Не расстраивайтесь! Наши мастера ремонтируют технику <strong>любых производителей</strong>,
                    даже если бренда нет в списке. Привозите — починим!
                </p>
                <div className="brands-cta-buttons">
                    <a href="tel:+7-911-501-88-28" className="brands-cta-button brands-cta-button-primary">
                        📞 +7 (911) 501-88-28
                    </a>
                    <a href="/contacts" className="brands-cta-button brands-cta-button-secondary">
                        📍 Приехать в сервис
                    </a>
                </div>
            </div>

            {/* Преимущества */}
            <h2 className="brands-section-title">⭐ Почему выбирают ServiceBox</h2>
            <div className="brands-advantages">
                <div className="brands-advantage">
                    <div className="brands-advantage-icon">✅</div>
                    <h3 className="brands-advantage-title">Оригинальные запчасти</h3>
                    <p className="brands-advantage-text">Используем детали от официальных поставщиков и качественные аналоги</p>
                </div>
                <div className="brands-advantage">
                    <div className="brands-advantage-icon">🔬</div>
                    <h3 className="brands-advantage-title">Проф. оборудование</h3>
                    <p className="brands-advantage-text">BGA-станции, микроскопы, ультразвуковые ванны для сложного ремонта</p>
                </div>
                <div className="brands-advantage">
                    <div className="brands-advantage-icon">🎁</div>
                    <h3 className="brands-advantage-title">Бесплатная диагностика</h3>
                    <p className="brands-advantage-text">При согласии на ремонт диагностика не оплачивается</p>
                </div>
                <div className="brands-advantage">
                    <div className="brands-advantage-icon">👨‍🔧</div>
                    <h3 className="brands-advantage-title">10+ лет опыта</h3>
                    <p className="brands-advantage-text">Сертифицированные мастера с опытом работы от 5 до 15 лет</p>
                </div>
            </div>

            {/* FAQ секция */}
            <h2 className="brands-section-title">❓ Частые вопросы</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    {
                        q: 'Какие бренды техники вы ремонтируете?',
                        a: 'Ремонтируем все популярные бренды: Apple (iPhone, MacBook, iPad), Samsung (Galaxy), Xiaomi (Redmi, Poco), Huawei, Honor, ASUS (ROG, ZenBook), Lenovo (ThinkPad, Legion), HP (Omen, Pavilion), Acer (Predator), MSI, Dell (XPS, Alienware), Sony (PlayStation), LG. Если вашего бренда нет в списке — всё равно приносите, починим!'
                    },
                    {
                        q: 'Используете ли вы оригинальные запчасти?',
                        a: 'Да, мы используем оригинальные запчасти от официальных поставщиков и качественные сертифицированные аналоги. Выбор за клиентом — мы всегда предлагаем оба варианта с честным сравнением.'
                    },
                    {
                        q: 'Какая гарантия на ремонт?',
                        a: 'Гарантия от 3 до 24 месяцев в зависимости от вида работ и типа устройства. На запчасти Apple — до 12 месяцев, на работы по чистке — 3 месяца. Гарантия оформляется официально.'
                    },
                    {
                        q: 'Сколько времени занимает ремонт?',
                        a: 'Большинство работ выполняем за 30–60 минут при вас: замена экрана, батареи, разъёмов. Сложный ремонт (BGA-пайка, материнские платы) — от 1 до 7 дней. Срочный ремонт с доплатой 500₽.'
                    },
                ].map((faq, i) => (
                    <div key={i} style={{
                        padding: '1.5rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--color-primary-dark)' }}>
                            {faq.q}
                        </h3>
                        <p style={{ margin: 0, color: '#334155' }}>{faq.a}</p>
                    </div>
                ))}
            </div>

            {/* Финальный CTA */}
            <div className="brands-cta">
                <h2>🚀 Готовы починить вашу технику?</h2>
                <p>Бесплатная диагностика · Срочный ремонт от 30 минут · Гарантия до 24 месяцев</p>
                <div className="brands-cta-buttons">
                    <a href="tel:+7-911-501-88-28" className="brands-cta-button brands-cta-button-primary">
                        📞 +7 (911) 501-88-28
                    </a>
                    <a href="/contacts" className="brands-cta-button brands-cta-button-secondary">
                        📍 ул. Северная, 7А, ТЦ КИТ
                    </a>
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
                    <a href="tel:+7-911-501-88-28" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none' }}>+7 (911) 501-88-28</a>
                    {' · '}
                    ул. Северная, 7А, ТЦ КИТ · Ежедневно 10:00–20:00
                </p>
            </footer>
        </main>
    );
}