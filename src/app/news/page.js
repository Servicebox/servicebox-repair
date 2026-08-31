// src/app/news/page.js
import { Suspense } from 'react';
import NewsList from '@/components/NewsList/NewsList';
import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
    title: 'Новости и советы по ремонту техники в Вологде | СЕРВИС БОКС',
    description: 'Новости сервисного центра СЕРВИС БОКС: акции, советы по уходу за техникой, обзоры ремонтов. Вологда, ул. Северная, 7А.',
    keywords: ['новости ремонт техники', 'акции сервисный центр Вологда', 'советы по ремонту смартфонов', 'СЕРВИС БОКС новости'],
    alternates: {
        canonical: `${BASE_URL}/news`,
    },
    openGraph: {
        title: 'Новости и советы по ремонту | СЕРВИС БОКС Вологда',
        description: 'Актуальные новости, акции и полезные советы от сервисного центра СЕРВИС БОКС в Вологде.',
        url: `${BASE_URL}/news`,
        siteName: BUSINESS.shortName,
        locale: 'ru_RU',
        type: 'website',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Новости СЕРВИС БОКС Вологда' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Новости СЕРВИС БОКС Вологда',
        description: 'Акции, советы по ремонту и новости сервисного центра.',
        images: ['/og-image.jpg'],
    },
};

export default function NewsPage() {
    return (
        <main>
            {/* SSR-заголовок: список новостей рендерится на клиенте (NewsList
                грузит /api/news в useEffect), из-за чего в исходном HTML не
                было ни h1, ни текста. Выносим заголовок и лид на сервер. */}
            <header className="news-page-header">
                <h1>Новости и советы по ремонту техники в Вологде</h1>
                <p>Акции, полезные советы по уходу за техникой и обзоры ремонтов от сервисного центра СЕРВИС БОКС на Северной, 7А.</p>
            </header>
            <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
            }>
                <NewsList />
            </Suspense>
        </main>
    );
}
