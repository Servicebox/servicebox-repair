import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт планшетов в Вологде | iPad, Galaxy Tab | СЕРВИС БОКС',
    description: 'Ремонт планшетов в Вологде: iPad, Samsung Galaxy Tab, Xiaomi Pad. Замена дисплеев, стёкол, батарей. Гарантия до 12 месяцев.',
    path: '/services/tablets',
    keywords: ['ремонт планшетов Вологда', 'ремонт iPad Вологда', 'замена стекла планшета', 'ремонт Samsung Galaxy Tab'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Ремонтируете iPad в Вологде?',
        answer: 'Да, ремонтируем iPad всех поколений: замена стекла, дисплея, батареи, разъёма зарядки. Диагностика бесплатно, ул. Северная, 7А.'
    },
    {
        question: 'Сколько стоит замена стекла на планшете?',
        answer: 'Замена стекла (тачскрина) на планшете — от 2 000 ₽, замена дисплейного модуля — от 3 000 ₽. Точную стоимость называем после диагностики.'
    },
    {
        question: 'Как долго ремонтируют планшет?',
        answer: 'Замена стекла или батареи занимает 1–3 часа. При наличии запчасти большинство ремонтов выполняем в день обращения.'
    },
]);

export default function TabletsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="tablets" />
        </>
    );
}
