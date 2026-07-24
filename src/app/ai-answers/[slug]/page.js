// app/ai-answers/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESS, BASE_URL } from '@/lib/constants';
import { LOCAL_BUSINESS_SCHEMA, createBreadcrumbList, parseDurationToISO, stripHtml } from '@/lib/seo-helpers';
import { ANSWERS } from '@/lib/ai-answers-data';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const fetchCache = 'force-cache';

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
                background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%)',
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