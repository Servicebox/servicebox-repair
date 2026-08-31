import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata, generateFAQSchema } from '@/lib/seo-helpers';

export const metadata = generateServiceMetadata({
    title: 'Ремонт видеокарт в Вологде | NVIDIA, AMD, Intel | СЕРВИС БОКС',
    description: 'Ремонт видеокарт в Вологде: реболл GPU, замена видеочипов, VRAM, цепей питания. NVIDIA RTX 30xx/40xx, AMD Radeon. Гарантия до 12 месяцев.',
    path: '/services/videocards',
    keywords: ['ремонт видеокарт Вологда', 'реболл видеокарты', 'ремонт NVIDIA RTX Вологда', 'ремонт AMD Radeon Вологда'],
});

const faqSchema = generateFAQSchema([
    {
        question: 'Сколько стоит ремонт видеокарты в Вологде?',
        answer: 'Диагностика — бесплатно. Реболл GPU (перепайка чипа) — от 3 000 ₽, замена VRAM — от 4 000 ₽, ремонт цепей питания — от 1 500 ₽. Точная цена после диагностики.'
    },
    {
        question: 'Ремонтируете видеокарты NVIDIA RTX 3080, 4090?',
        answer: 'Да, специализируемся на ремонте NVIDIA RTX серий 20xx, 30xx, 40xx и AMD Radeon RX 5000/6000/7000. BGA-пайка, реболл GPU, замена видеопамяти.'
    },
    {
        question: 'Видеокарта не определяется — можно ли починить?',
        answer: 'В большинстве случаев — да. Чаще всего причина в оторвавшихся шарах под GPU (реболл) или перегоревших цепях питания. Диагностика бесплатно, адрес: ул. Северная, 7А.'
    },
    {
        question: 'Какая гарантия на ремонт видеокарты?',
        answer: 'Гарантия на ремонт видеокарты — от 3 до 12 месяцев в зависимости от вида работ. На реболл GPU — 6 месяцев, на замену конденсаторов и транзисторов — 12 месяцев.'
    },
]);

export default function VideocardsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CategoryTemplate categorySlug="videocards" />
        </>
    );
}
