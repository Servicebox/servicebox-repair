import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';

export const metadata = {
    title: 'Ремонт игровых приставок в Вологде | PlayStation, Xbox, Switch | ServiceBox',
    description: 'Ремонт PlayStation 4/5, Xbox One/Series, Nintendo Switch в Вологде. Чистка, замена термопасты, ремонт HDMI, приводов. Гарантия до 6 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/consoles' },
};

export default function ConsolesPage() {
    return <CategoryTemplate categorySlug="consoles" />;
}