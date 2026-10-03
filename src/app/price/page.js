import PricePageClient from '@/components/PricePage/PricePageClient';
import { generateServiceMetadata } from '@/lib/seo-helpers';

// ✅ Был 'use client' на весь page.js — страница не имела ни export const
// metadata (Next.js не допускает его в клиентском компоненте), ни H1 в
// исходном HTML (единственный H1 рисовался только после клиентского фетча,
// до этого curl видел только спиннер загрузки). Из-за отсутствия своего
// metadata страница наследовала canonical родительского layout.js — тот
// указывает на главную, получался кросс-canonical. Найдено в SEO-аудите
// 2026-10-03. Теперь H1 и canonical рендерятся на сервере всегда,
// интерактивная таблица/поиск/пагинация — в PricePageClient.
export const metadata = generateServiceMetadata({
    title: 'Прайс-лист на ремонт техники в Вологде | СЕРВИС БОКС',
    description: 'Актуальные цены на ремонт телефонов, ноутбуков, видеокарт, телевизоров и консолей в Вологде. Поиск по прайсу, скачивание в Excel. Диагностика бесплатно.',
    path: '/price',
    keywords: ['прайс-лист ремонт Вологда', 'цены на ремонт техники', 'стоимость ремонта телефона Вологда', 'стоимость ремонта ноутбука Вологда'],
});

export default function PricePage() {
    return (
        <div className="min-h-screen bg-surface py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Прайс-лист на ремонт техники в Вологде</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Актуальные цены на запчасти и работы — поиск по прайсу, скачивание в Excel
                    </p>
                </div>
                <PricePageClient />
            </div>
        </div>
    );
}
