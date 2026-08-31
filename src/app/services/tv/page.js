import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт телевизоров в Вологде | LED, OLED, QLED | СЕРВИС БОКС',
    description: 'Ремонт телевизоров в Вологде: замена подсветки LED, ремонт OLED и QLED. Samsung, LG, Sony, Philips. Гарантия до 12 месяцев.',
    path: '/services/tv',
    keywords: ['ремонт телевизоров Вологда', 'замена подсветки телевизора', 'ремонт Samsung TV Вологда', 'ремонт LG OLED Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Сколько стоит ремонт телевизора в Вологде?',
        answer: 'Стоимость зависит от неисправности: замена подсветки LED — от 2 500 ₽, ремонт платы — от 1 500 ₽, замена матрицы — от 5 000 ₽. Диагностика бесплатно.'
    },
    {
        question: 'Ремонтируете телевизоры Samsung и LG?',
        answer: 'Да, ремонтируем все бренды: Samsung, LG, Sony, Philips, Xiaomi. Модели с LED, OLED и QLED подсветкой. Используем оригинальные запчасти.'
    },
    {
        question: 'Берёте телевизор на ремонт с выездом на дом?',
        answer: 'Выездного ремонта у нас нет — все работы выполняются в сервисном центре по адресу ул. Северная, 7А. Позвоните заранее, чтобы уточнить, как удобнее привезти крупный телевизор: +7 (911) 501-88-28.'
    },
]);

export default function TvPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="tv" />
        </>
    );
}
