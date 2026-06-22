// src/app/news/page.js
import { Suspense } from 'react';
import NewsList from '@/components/NewsList/NewsList';
import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
    title: 'Новости и советы по ремонту техники в Вологде | ServiceBox',
    description: 'Новости сервисного центра ServiceBox: акции, советы по уходу за техникой, обзоры ремонтов. Вологда, ул. Северная, 7А.',
    keywords: ['новости ремонт техники', 'акции сервисный центр Вологда', 'советы по ремонту смартфонов', 'ServiceBox новости'],
    alternates: {
        canonical: `${BASE_URL}/news`,
    },
    openGraph: {
        title: 'Новости и советы по ремонту | ServiceBox Вологда',
        description: 'Актуальные новости, акции и полезные советы от сервисного центра ServiceBox в Вологде.',
        url: `${BASE_URL}/news`,
        siteName: BUSINESS.shortName,
        locale: 'ru_RU',
        type: 'website',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Новости ServiceBox Вологда' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Новости ServiceBox Вологда',
        description: 'Акции, советы по ремонту и новости сервисного центра.',
        images: ['/og-image.jpg'],
    },
};

export default function NewsPage() {
    return (
        <main>
            <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            }>
                <NewsList />
            </Suspense>
        </main>
    );
}
