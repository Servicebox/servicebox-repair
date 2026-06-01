import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';
export const dynamic = 'force-dynamic'
export const metadata = {
    title: 'Ремонт телевизоров в Вологде | LED, OLED, QLED | ServiceBox',
    description: 'Ремонт телевизоров в Вологде: замена подсветки LED, ремонт OLED и QLED. Samsung, LG, Sony, Philips. Гарантия до 12 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/tv' },
};

export default function TvPage() {
    return <CategoryTemplate categorySlug="tv" />;
}