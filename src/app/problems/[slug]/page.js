// app/problems/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems-data';

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


export async function generateStaticParams() {
    return Object.keys(PROBLEMS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const problem = PROBLEMS[slug];
    if (!problem) return { title: 'Не найдено' };

    const BASE_URL = getBaseUrl();
    return {
        title: `${problem.title} | СЕРВИС БОКС Вологда`,
        description: problem.shortAnswer,
        alternates: { canonical: `${BASE_URL}/problems/${slug}` },
        authors: [{ name: problem.author, url: `${BASE_URL}/about` }],
        keywords: `${problem.category.toLowerCase()}, ${problem.title.toLowerCase()}, СЕРВИС БОКС, ремонт Вологда`,
        openGraph: {
            title: problem.title,
            description: problem.shortAnswer,
            url: `${BASE_URL}/problems/${slug}`,
            siteName: 'СЕРВИС БОКС Вологда',
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

    // Похожие статьи: сначала та же категория, потом остальные — максимум 3
    const otherSlugs = Object.keys(PROBLEMS).filter((s) => s !== slug);
    const sameCategory = otherSlugs.filter((s) => PROBLEMS[s].category === problem.category);
    const otherCategory = otherSlugs.filter((s) => PROBLEMS[s].category !== problem.category);
    const relatedSlugs = [...sameCategory, ...otherCategory].slice(0, 3);

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

            {/* Похожие статьи — чтобы читатель не упирался в тупик, а продолжал
                смотреть сайт: сначала статьи той же категории, потом остальные */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                    Похожие статьи
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {relatedSlugs.map((relatedSlug) => {
                        const related = PROBLEMS[relatedSlug];
                        return (
                            <Link
                                key={relatedSlug}
                                href={`/problems/${relatedSlug}`}
                                style={{
                                    display: 'block',
                                    padding: '1.25rem',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{related.icon}</div>
                                <div style={{ fontWeight: 700, color: '#0a1929', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                                    {related.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{related.category}</div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%)',
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