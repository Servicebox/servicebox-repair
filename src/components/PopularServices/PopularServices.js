'use client';

import Link from 'next/link';

const services = [
    {
        name: 'Замена экрана iPhone 13',
        price: 'от 4 500₽',
        time: '40 мин',
        icon: '📱',
        badge: '🔥 Хит',
        desc: 'Оригинал или качественный аналог'
    },
    {
        name: 'Чистка ноутбука + термопаста',
        price: 'от 2 000₽',
        time: '1-2 часа',
        icon: '💻',
        badge: '⚡ Быстро',
        desc: 'Полная разборка, замена термоинтерфейса'
    },
    {
        name: 'Замена подсветки ТВ 55"',
        price: 'от 6 500₽',
        time: '1 день',
        icon: '📺',
        badge: '💎 Премиум',
        desc: 'LED телевизоры средней диагонали'
    },
    {
        name: 'Реболл GPU RTX 3080',
        price: 'от 7 000₽',
        time: '2-5 дней',
        icon: '🎮',
        badge: '🛡️ Эксклюзив',
        desc: 'BGA-пайка графического чипа'
    },
    {
        name: 'Замена батареи iPad Pro',
        price: 'от 3 500₽',
        time: '1-2 часа',
        icon: '📲',
        badge: '✅ Гарантия',
        desc: 'Оригинальная батарея, гарантия 12 мес'
    },
    {
        name: 'Ремонт PS5 (чистка)',
        price: 'от 2 200₽',
        time: '1-2 часа',
        icon: '🕹️',
        badge: '⚡ Быстро',
        desc: 'Полная разборка, замена термопасты'
    },
];

export default function PopularServices() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                        🔥 Популярные услуги
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Самые востребованные ремонты с фиксированными ценами
                    </p>
                </div>

                {/* Сетка услуг */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((svc, i) => (
                        <div
                            key={i}
                            className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Бейдж */}
                            <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full mb-4">
                                {svc.badge}
                            </div>

                            {/* Иконка и цена */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">{svc.icon}</div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 mb-1">⏱️ {svc.time}</div>
                                    <div className="font-bold text-xl" style={{ color: '#ff8c00' }}>
                                        {svc.price}
                                    </div>
                                </div>
                            </div>

                            {/* Название и описание */}
                            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                                {svc.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {svc.desc}
                            </p>

                            {/* Кнопка */}
                            <Link
                                href="/services"
                                className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all"
                            >
                                Подробнее
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* CTA-блок */}
                <div className="mt-12 text-center">
                    <div className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <p className="text-gray-700 mb-4">
                            Не нашли нужную услугу? <strong>Рассчитайте стоимость</strong> для вашего устройства
                        </p>
                        <button
                            onClick={() => {
                                const calcSection = document.querySelector('[data-calculator]') ||
                                    document.querySelectorAll('section')[1];
                                if (calcSection) {
                                    calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                            style={{ background: '#ff8c00' }}
                        >
                            🧮 Открыть калькулятор
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}