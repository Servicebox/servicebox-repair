import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';

export const metadata = {
    title: 'Ремонт ноутбуков в Вологде | MacBook, ASUS, Lenovo | ServiceBox',
    description: 'Ремонт ноутбуков в Вологде: MacBook, ASUS, Lenovo, HP, Dell. Замена матриц, клавиатур, ремонт материнских плат. BGA-пайка. Гарантия до 24 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/laptops' },
};

export default function LaptopsPage() {
    return <CategoryTemplate categorySlug="laptops" />;
}