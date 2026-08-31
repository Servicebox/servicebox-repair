import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт игровых приставок в Вологде | PlayStation, Xbox, Switch | СЕРВИС БОКС',
    description: 'Ремонт PlayStation 4/5, Xbox One/Series, Nintendo Switch в Вологде. Чистка, замена термопасты, ремонт HDMI, приводов. Гарантия до 6 месяцев.',
    path: '/services/consoles',
    keywords: ['ремонт PlayStation Вологда', 'ремонт Xbox Вологда', 'ремонт Nintendo Switch', 'чистка приставки Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Ремонтируете PlayStation 5 в Вологде?',
        answer: 'Да, ремонтируем PS4, PS4 Pro, PS4 Slim и PS5: чистка, замена термопасты, ремонт HDMI-порта, привода. Гарантия до 6 месяцев.'
    },
    {
        question: 'Сколько стоит чистка PlayStation?',
        answer: 'Чистка PS4 с заменой термопасты — от 1 500 ₽, чистка PS5 — от 2 000 ₽. Включает разборку, чистку системы охлаждения и сборку.'
    },
    {
        question: 'Ремонтируете Xbox One и Xbox Series в Вологде?',
        answer: 'Да, ремонтируем Xbox One, One S, One X, Series S и Series X. Чистка, ремонт привода, HDMI, материнских плат.'
    },
]);

export default function ConsolesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="consoles" />
        </>
    );
}
