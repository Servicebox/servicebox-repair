import CategoryTemplate from '@/components/CategoryTemplate/CategoryTemplate';

export const metadata = {
    title: 'Ремонт видеокарт в Вологде | NVIDIA, AMD, Intel | ServiceBox',
    description: 'Ремонт видеокарт в Вологде: реболл GPU, замена видеочипов, VRAM, цепей питания. NVIDIA RTX 30xx/40xx, AMD Radeon. Гарантия до 12 месяцев.',
    alternates: { canonical: 'https://servicebox35.ru/services/videocards' },
};

export default function VideocardsPage() {
    return <CategoryTemplate categorySlug="videocards" />;
}