import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';

// Принудительная динамическая рендеринг


export const metadata = {
    title: 'Ремонт ноутбуков в Вологде | MacBook, ASUS, Lenovo | ServiceBox',
    description: 'Ремонт ноутбуков в Вологде: MacBook, ASUS, Lenovo, HP, Dell. Замена матриц, клавиатур, ремонт материнских плат. BGA-пайка. Гарантия до 24 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/laptops' }, // Исправьте URL на продакшен
};

export default function LaptopsPage() {
    return <CategoryTemplate categorySlug="laptops" />;
}