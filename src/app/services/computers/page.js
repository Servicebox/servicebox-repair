import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт компьютеров в Вологде | Системные блоки, ПК | СЕРВИС БОКС',
    description: 'Ремонт компьютеров и системных блоков в Вологде: диагностика, ремонт блока питания и материнской платы, чистка, установка SSD/ОЗУ. Диагностика бесплатно, гарантия до 12 месяцев.',
    path: '/services/computers',
    keywords: ['ремонт компьютеров Вологда', 'ремонт системного блока Вологда', 'ремонт материнской платы ПК Вологда', 'чистка компьютера Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Сколько стоит ремонт компьютера в Вологде?',
        answer: 'Диагностика — бесплатно. Чистка системного блока — от 1 800 ₽, ремонт блока питания — от 1 500 ₽, ремонт материнской платы — от 4 000 ₽. Точная цена после диагностики.'
    },
    {
        question: 'Ремонтируете системные блоки и материнские платы?',
        answer: 'Да: диагностика и ремонт блока питания, BGA-пайка и ремонт материнской платы, установка SSD/ОЗУ, восстановление после скачков напряжения.'
    },
    {
        question: 'Есть ли выезд мастера на дом?',
        answer: 'Выездного ремонта у нас нет — все работы выполняются в сервисном центре по адресу ул. Северная, 7А. Если проблема программная (не запускается Windows, вирусы, настройка) — часто можем помочь удалённо, без визита.'
    },
    {
        question: 'Какой режим работы?',
        answer: 'Работаем ежедневно, без выходных, с 10:00 до 20:00. Звонки принимаем в это же время: +7 (911) 501-88-28.'
    },
]);

export default function ComputersPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="computers" />
        </>
    );
}
