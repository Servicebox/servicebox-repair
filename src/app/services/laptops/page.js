import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт ноутбуков в Вологде | MacBook, ASUS, Lenovo | ServiceBox',
    description: 'Ремонт ноутбуков в Вологде: MacBook, ASUS, Lenovo, HP, Dell. Замена матриц, клавиатур, ремонт материнских плат. BGA-пайка. Гарантия до 24 месяцев.',
    path: '/services/laptops',
    keywords: ['ремонт ноутбуков Вологда', 'ремонт MacBook Вологда', 'замена матрицы ноутбука', 'чистка ноутбука Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Сколько стоит ремонт ноутбука в Вологде?',
        answer: 'Чистка ноутбука от пыли — от 1 200 ₽, замена матрицы — от 2 500 ₽, ремонт материнской платы — от 2 000 ₽. Диагностика бесплатна. Итоговую стоимость называем после осмотра.'
    },
    {
        question: 'Как долго чинят ноутбук в сервисе?',
        answer: 'Чистка и замена термопасты — 1 час. Замена матрицы, клавиатуры, SSD — 1–2 часа. Ремонт материнской платы — 1–5 дней в зависимости от сложности.'
    },
    {
        question: 'Ремонтируете MacBook в Вологде?',
        answer: 'Да, ремонтируем все модели MacBook Air и MacBook Pro. Замена клавиш, экранов, батарей, ремонт плат с BGA-пайкой. Используем оригинальные и качественные совместимые запчасти.'
    },
    {
        question: 'Ноутбук сильно греется — что делать?',
        answer: 'Скорее всего, забита система охлаждения. Рекомендуем чистку ноутбука с заменой термопасты — от 1 200 ₽. Температура CPU после чистки снижается на 15–30°C. Записывайтесь: +7 (911) 501-88-28.'
    },
    {
        question: 'Есть ли гарантия на ремонт ноутбука?',
        answer: 'Гарантия на работы и запчасти — от 3 до 24 месяцев. На чистку и замену термопасты — 3 месяца, на замену матриц и клавиатур — до 12 месяцев.'
    },
]);

export default function LaptopsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="laptops" />
        </>
    );
}
