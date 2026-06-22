import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';
import { BASE_URL } from '@/lib/constants';

export const metadata = generateServiceMetadata({
    title: 'Ремонт смартфонов в Вологде | iPhone, Samsung, Xiaomi | ServiceBox',
    description: 'Профессиональный ремонт смартфонов в Вологде. Замена экранов, батарей, разъёмов iPhone, Samsung, Xiaomi. Гарантия до 24 месяцев. Срочный ремонт от 30 минут.',
    path: '/services/phones',
    keywords: ['ремонт смартфонов Вологда', 'ремонт iPhone Вологда', 'замена экрана телефона', 'ремонт Samsung Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Сколько стоит ремонт смартфона в Вологде?',
        answer: 'Стоимость ремонта смартфона зависит от модели и неисправности. Замена экрана iPhone — от 2 500 ₽, замена батареи — от 800 ₽. Диагностика бесплатно. Точную цену называем после осмотра.'
    },
    {
        question: 'Как долго длится ремонт телефона?',
        answer: 'Большинство ремонтов выполняется за 30–60 минут при наличии запчасти. Сложные случаи (ремонт платы, BGA-пайка) занимают 1–3 дня.'
    },
    {
        question: 'Какая гарантия на ремонт смартфона?',
        answer: 'На все виды ремонта смартфонов даём гарантию от 3 до 24 месяцев в зависимости от вида работ. Гарантия распространяется на запчасти и работу.'
    },
    {
        question: 'Ремонтируете iPhone в Вологде?',
        answer: 'Да, специализируемся на ремонте Apple: замена экрана, батареи, разъёма, Face ID, ремонт платы. Работаем с iPhone 6 – iPhone 16. Адрес: ул. Северная, 7А, ТЦ КИТ.'
    },
    {
        question: 'Нужна ли предоплата за ремонт?',
        answer: 'Нет. Оплата только после выполнения ремонта и вашей проверки устройства. Диагностика бесплатная.'
    },
]);

export default function PhonesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="phones" />
        </>
    );
}
