// app/services/[category]/page.js — catch-all для категорий без отдельных страниц
import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
import { generateServiceMetadata } from '@/lib/seo-helpers';

const CATEGORY_META = {
    videocards: {
        title: 'Ремонт видеокарт в Вологде | NVIDIA, AMD, Intel | ServiceBox',
        description: 'Ремонт видеокарт в Вологде: реболл GPU, замена видеочипов, VRAM, цепей питания. NVIDIA RTX 30xx/40xx, AMD Radeon. Гарантия до 12 месяцев.',
    },
    phones: {
        title: 'Ремонт смартфонов в Вологде | iPhone, Samsung, Xiaomi | ServiceBox',
        description: 'Профессиональный ремонт смартфонов в Вологде. Замена экранов, батарей, разъёмов. Гарантия до 24 месяцев. Срочный ремонт от 30 минут.',
    },
    laptops: {
        title: 'Ремонт ноутбуков в Вологде | MacBook, ASUS, Lenovo | ServiceBox',
        description: 'Ремонт ноутбуков в Вологде: MacBook, ASUS, Lenovo, HP, Dell. Замена матриц, клавиатур, BGA-пайка. Гарантия до 24 месяцев.',
    },
};

export async function generateMetadata({ params }) {
    const { category } = await params;
    const meta = CATEGORY_META[category] ?? {
        title: `Ремонт ${category} в Вологде | ServiceBox`,
        description: `Профессиональный ремонт ${category} в Вологде. Гарантия, бесплатная диагностика. Ул. Северная, 7А.`,
    };

    return generateServiceMetadata({ ...meta, path: `/services/${category}` });
}

export default async function CategoryPage({ params }) {
    const { category } = await params;
    return <CategoryTemplate categorySlug={category} />;
}
