import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
export const dynamic = 'force-dynamic'
export const metadata = {
    title: 'Ремонт планшетов в Вологде | iPad, Galaxy Tab | ServiceBox',
    description: 'Ремонт планшетов в Вологде: iPad, Samsung Galaxy Tab, Xiaomi Pad. Замена дисплеев, стёкол, батарей. Гарантия до 12 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/tablets' },
};

export default function TabletsPage() {
    return <CategoryTemplate categorySlug="tablets" />;
}