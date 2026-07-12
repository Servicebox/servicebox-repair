'use client';

import Link from 'next/link';

const categories = [
    {
        name: 'Смартфоны',
        icon: '📱',
        slug: 'phones',
        desc: 'iPhone, Samsung, Xiaomi',
        color: 'from-blue-500 to-cyan-500',
        count: '120+ услуг'
    },
    {
        name: 'Ноутбуки',
        icon: '💻',
        slug: 'laptops',
        desc: 'MacBook, ASUS, Lenovo',
        color: 'from-purple-500 to-pink-500',
        count: '85+ услуг'
    },
    {
        name: 'Планшеты',
        icon: '📲',
        slug: 'tablets',
        desc: 'iPad, Galaxy Tab',
        color: 'from-green-500 to-emerald-500',
        count: '45+ услуг'
    },
    {
        name: 'Телевизоры',
        icon: '📺',
        slug: 'tv',
        desc: 'LED, OLED, QLED',
        color: 'from-orange-500 to-red-500',
        count: '30+ услуг'
    },
    {
        name: 'Видеокарты',
        icon: '🔥',
        slug: 'videocards',
        desc: 'NVIDIA, AMD, Intel',
        color: 'from-indigo-500 to-purple-500',
        count: '50+ услуг'
    },
    {
        name: 'Приставки',
        icon: '🕹️',
        slug: 'consoles',
        desc: 'PlayStation, Xbox, Switch',
        color: 'from-pink-500 to-rose-500',
        count: '25+ услуг'
    },
];

export default function CategoriesGrid() {
    return (
        <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                        🔧 Что нужно отремонтировать?
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Выберите категорию и узнайте стоимость ремонта за 30 секунд
                    </p>
                </div>

                {/* Сетка категорий */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, i) => (
                        <Link
                            key={i}
                            href={`/services/${cat.slug}`}
                            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {/* Градиентный фон при hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className="relative z-10 text-center">
                                <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    {cat.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary-dark)' }}>
                                    {cat.name}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                    {cat.desc}
                                </p>
                                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full">
                                    {cat.count}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}