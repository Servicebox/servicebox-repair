import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
export const dynamic = 'force-dynamic'
export const metadata = {
    title: 'Ремонт смартфонов в Вологде | iPhone, Samsung, Xiaomi | ServiceBox',
    description: 'Профессиональный ремонт смартфонов в Вологде. Замена экранов, батарей, разъёмов iPhone, Samsung, Xiaomi. Гарантия до 24 месяцев. Срочный ремонт от 30 минут.',
    alternates: { canonical: 'https://servicebox35.ru/services/phones' },
};

export default function PhonesPage() {
    return <CategoryTemplate categorySlug="phones" />;
}