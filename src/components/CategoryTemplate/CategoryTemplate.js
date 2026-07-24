// components/CategoryTemplate/CategoryTemplate.js
'use client';

import Link from 'next/link';
import RepairCalculator from '@/components/RepairCalculator/RepairCalculator';

const RELATED_CATEGORIES = {
    phones: ['laptops', 'tablets', 'consoles'],
    laptops: ['phones', 'videocards', 'tablets'],
    tablets: ['phones', 'laptops', 'tv'],
    tv: ['consoles', 'tablets', 'phones'],
    videocards: ['laptops', 'consoles', 'phones'],
    consoles: ['videocards', 'tv', 'phones'],
};

const GEO_ANCHORS = {
    phones: [
        { label: 'Цена замены экрана iPhone в Вологде', href: '/services/phones#repair-calculator' },
        { label: 'Ремонт Samsung Galaxy в Вологде', href: '/services/phones#repair-calculator' },
        { label: 'Ремонт Xiaomi Redmi в Вологде', href: '/brands/xiaomi' },
    ],
    laptops: [
        { label: 'Ремонт MacBook в Вологде', href: '/brands/apple' },
        { label: 'Чистка ноутбука в Вологде — цена', href: '/services/laptops#repair-calculator' },
        { label: 'Замена матрицы ноутбука в Вологде', href: '/services/laptops#repair-calculator' },
    ],
    tablets: [
        { label: 'Замена экрана iPad в Вологде', href: '/services/tablets#repair-calculator' },
        { label: 'Ремонт Samsung Galaxy Tab в Вологде', href: '/brands/samsung' },
    ],
    tv: [
        { label: 'Замена подсветки телевизора в Вологде', href: '/services/tv#repair-calculator' },
        { label: 'Ремонт OLED LG в Вологде', href: '/brands/lg' },
    ],
    videocards: [
        { label: 'Реболл GPU в Вологде — цена', href: '/services/videocards#repair-calculator' },
        { label: 'Ремонт NVIDIA RTX в Вологде', href: '/services/videocards#repair-calculator' },
    ],
    consoles: [
        { label: 'Чистка PlayStation 5 в Вологде', href: '/services/consoles#repair-calculator' },
        { label: 'Ремонт Xbox Series X в Вологде', href: '/services/consoles#repair-calculator' },
    ],
};

const CALCULATOR_KEY_MAP = {
    phones: 'phone',
    laptops: 'laptop',
    tablets: 'tablet',
    tv: 'tv',
    videocards: 'videocard',
    consoles: 'console'
};
const CATEGORIES_DATA = {
    phones: {
        title: 'Ремонт смартфонов',
        subtitle: 'в Вологде',
        description: 'Профессиональный ремонт iPhone, Samsung, Xiaomi, Huawei и других смартфонов. Замена экранов, батарей, разъёмов. Гарантия до 24 месяцев.',
        icon: '📱',
        popularServices: [
            { name: 'Замена экрана iPhone 13', price: 'от 4 500₽', time: '40 мин' },
            { name: 'Замена экрана Samsung S23', price: 'от 3 500₽', time: '1 час' },
            { name: 'Замена батареи iPhone', price: 'от 1 400₽', time: '30 мин' },
            { name: 'Ремонт после воды', price: 'от 2 500₽', time: '1-5 дней' },
            { name: 'Замена разъёма зарядки', price: 'от 1 500₽', time: '40 мин' },
            { name: 'Замена стекла', price: 'от 2 000₽', time: '2-4 часа' },
        ],
        advantages: [
            { icon: '⚡', title: 'Ремонт от 30 минут', desc: 'Замена экрана при вас' },
            { icon: '🛡️', title: 'Гарантия 12 мес', desc: 'На работу и запчасти' },
            { icon: '✅', title: 'Оригинал / аналог', desc: 'Выбор за вами' },
            { icon: '💰', title: 'Без предоплаты', desc: 'Оплата после ремонта' },
        ],
        faq: [
            { q: 'Сколько стоит замена экрана iPhone?', a: 'От 2 000₽ за работу (без учёта дисплея). Точная цена зависит от модели — рассчитайте в калькуляторе выше.' },
            { q: 'Сколько времени занимает ремонт?', a: 'Замена экрана — 30-60 минут, батареи — 20-40 минут. Сложные работы (после воды) — 1-5 дней.' },
            { q: 'Даёте ли гарантию?', a: 'Да, от 6 до 24 месяцев в зависимости от типа работ. Оформляем официально, на бумаге.' },
            { q: 'Используете оригинальные запчасти?', a: 'Предлагаем и оригинал, и качественные аналоги. Выбор всегда за клиентом — честно объясняем разницу.' },
        ]
    },
    laptops: {
        title: 'Ремонт ноутбуков',
        subtitle: 'в Вологде',
        description: 'Ремонт MacBook, ASUS, Lenovo, HP, Dell и других ноутбуков. Замена матриц, клавиатур, ремонт материнских плат, чистка от пыли.',
        icon: '💻',
        popularServices: [
            { name: 'Замена матрицы ноутбука', price: 'от 2 500₽', time: '1-3 часа' },
            { name: 'Чистка + термопаста', price: 'от 2 000₽', time: '1-2 часа' },
            { name: 'Замена клавиатуры', price: 'от 1 800₽', time: '1-3 часа' },
            { name: 'Ремонт материнской платы', price: 'от 4 000₽', time: '3-7 дней' },
            { name: 'Восстановление после залития', price: 'от 3 000₽', time: '2-7 дней' },
            { name: 'Установка SSD', price: 'от 1 200₽', time: '30 мин' },
        ],
        advantages: [
            { icon: '🔧', title: 'BGA-пайка', desc: 'Ремонт материнских плат' },
            { icon: '⚡', title: 'Чистка за 1 час', desc: 'При вас' },
            { icon: '🛡️', title: 'Гарантия 24 мес', desc: 'На сложные работы' },
            { icon: '💾', title: 'Сохранение данных', desc: '100% безопасность' },
        ],
        faq: [
            { q: 'Сколько стоит чистка ноутбука?', a: 'От 2 000₽ с заменой термопасты. Полная разборка, чистка системы охлаждения, замена термоинтерфейса.' },
            { q: 'Ремонтируете ли после залития?', a: 'Да, восстанавливаем 80% залитых ноутбуков. Цена от 3 000₽, срок 2-7 дней. Ультразвуковая чистка платы.' },
            { q: 'Можно ли заменить матрицу?', a: 'Да, замена матриц любых размеров и типов (IPS, TN, OLED). Цена от 2 500₽ за работу, срок 1-3 часа.' },
            { q: 'Ремонтируете MacBook?', a: 'Да, специализируемся на MacBook всех поколений (Intel, M1, M2, M3, M4). Цена выше из-за сложности конструкции.' },
        ]
    },
    tablets: {
        title: 'Ремонт планшетов',
        subtitle: 'в Вологде',
        description: 'Ремонт iPad, Samsung Galaxy Tab, Xiaomi Pad и других планшетов. Замена дисплеев, стёкол, батарей.',
        icon: '📲',
        popularServices: [
            { name: 'Замена дисплея iPad', price: 'от 3 000₽', time: '1-3 часа' },
            { name: 'Замена тачскрина', price: 'от 2 000₽', time: '2-4 часа' },
            { name: 'Замена батареи iPad', price: 'от 1 800₽', time: '1-2 часа' },
            { name: 'Ремонт разъёма зарядки', price: 'от 1 500₽', time: '1-2 часа' },
        ],
        advantages: [
            { icon: '📲', title: 'iPad всех поколений', desc: 'От iPad 9 до Pro M4' },
            { icon: '⚡', title: 'Замена за 1 час', desc: 'Для большинства моделей' },
            { icon: '🛡️', title: 'Гарантия 12 мес', desc: 'Официально' },
            { icon: '💎', title: 'Оригинальные запчасти', desc: 'И качественные аналоги' },
        ],
        faq: [
            { q: 'Сколько стоит замена экрана iPad Pro?', a: 'От 7 500₽ за работу (без учёта дисплея). Точная цена зависит от диагонали (11" или 13").' },
            { q: 'Можно ли заменить только стекло?', a: 'Да, переклейка стекла без замены дисплея. Цена от 2 000₽, срок 2-4 часа.' },
        ]
    },
    tv: {
        title: 'Ремонт телевизоров',
        subtitle: 'в Вологде',
        description: 'Ремонт LED, OLED, QLED телевизоров Samsung, LG, Sony, Philips. Замена подсветки, ремонт блоков питания, T-Con плат.',
        icon: '📺',
        popularServices: [
            { name: 'Замена подсветки LED 32-43"', price: 'от 4 500₽', time: '1-2 дня' },
            { name: 'Замена подсветки LED 49-55"', price: 'от 6 500₽', time: '1-3 дня' },
            { name: 'Замена подсветки LED 58-65"', price: 'от 9 000₽', time: '2-4 дня' },
            { name: 'Ремонт QLED подсветки', price: 'от 10 000₽', time: '2-4 дня' },
            { name: 'Ремонт OLED подсветки', price: 'от 18 000₽', time: '3-7 дней' },
            { name: 'Ремонт блока питания', price: 'от 3 000₽', time: '1-3 дня' },
        ],
        advantages: [
            { icon: '📺', title: 'Все диагонали', desc: 'От 32" до 85"' },
            { icon: '💎', title: 'OLED и QLED', desc: 'Премиум-ремонт' },
            { icon: '🛡️', title: 'Гарантия 12 мес', desc: 'На все работы' },
            { icon: '🔧', title: 'Оригинальные LED-планки', desc: 'От производителя' },
        ],
        faq: [
            { q: 'Сколько стоит замена подсветки?', a: 'Зависит от диагонали: 32-43" — от 4 500₽, 49-55" — от 6 500₽, 58-65" — от 9 000₽. QLED и OLED — дороже.' },
            { q: 'Ремонтируете ли OLED телевизоры?', a: 'Да, ремонтируем OLED LG, Sony, Philips. Работа сложная, цена от 18 000₽.' },
        ]
    },
    videocards: {
        title: 'Ремонт видеокарт',
        subtitle: 'в Вологде',
        description: 'Профессиональный ремонт видеокарт NVIDIA GeForce, AMD Radeon, Intel Arc. Реболл GPU, замена видеочипов, VRAM, цепей питания.',
        icon: '🔥',
        popularServices: [
            { name: 'Чистка + термопаста', price: 'от 1 800₽', time: '1-2 часа' },
            { name: 'Замена термопрокладок', price: 'от 2 200₽', time: '1-3 часа' },
            { name: 'Реболл GPU', price: 'от 4 500₽', time: '2-5 дней' },
            { name: 'Замена видеочипа', price: 'от 6 000₽', time: '3-7 дней' },
            { name: 'Замена VRAM', price: 'от 4 000₽', time: '2-5 дней' },
            { name: 'Ремонт цепи питания', price: 'от 3 500₽', time: '2-5 дней' },
        ],
        advantages: [
            { icon: '🔥', title: 'BGA-станция', desc: 'Профессиональное оборудование' },
            { icon: '🎮', title: 'RTX 30xx/40xx', desc: 'Опыт с новейшими картами' },
            { icon: '🛡️', title: 'Гарантия 12 мес', desc: 'На сложные работы' },
            { icon: '🔬', title: 'Микроскоп + осциллограф', desc: 'Точная диагностика' },
        ],
        faq: [
            { q: 'Что такое реболл GPU?', a: 'BGA-пайка графического чипа — демонтаж, восстановление шариков припоя, обратная установка. Применяется при артефактах и отслоении чипа.' },
            { q: 'Ремонтируете ли RTX 4090?', a: 'Да, специализируемся на топовых картах. Реболл — от 11 000₽, замена GPU — от 18 000₽.' },
            { q: 'Почините после майнинга?', a: 'Да, ремонтируем карты после майнинга: замена термопрокладок, чистка, реболл. Успешность 70-85%.' },
        ]
    },
    consoles: {
        title: 'Ремонт игровых приставок',
        subtitle: 'в Вологде',
        description: 'Ремонт PlayStation 4/5, Xbox One/Series, Nintendo Switch. Чистка, замена термопасты, ремонт HDMI, приводов.',
        icon: '🎮',
        popularServices: [
            { name: 'Чистка PlayStation 4', price: 'от 1 500₽', time: '1-2 часа' },
            { name: 'Чистка PlayStation 5', price: 'от 2 200₽', time: '1-2 часа' },
            { name: 'Замена термопасты PS4/PS5', price: 'от 2 500₽', time: '1-2 часа' },
            { name: 'Ремонт HDMI порта', price: 'от 3 000₽', time: '1-2 дня' },
            { name: 'Ремонт геймпада', price: 'от 1 500₽', time: '1-3 часа' },
            { name: 'Ремонт привода', price: 'от 2 500₽', time: '1-3 дня' },
        ],
        advantages: [
            { icon: '🎮', title: 'PS4/PS5/Xbox/Switch', desc: 'Все консоли' },
            { icon: '⚡', title: 'Чистка за 1 час', desc: 'При вас' },
            { icon: '🛡️', title: 'Гарантия 6 мес', desc: 'На все работы' },
            { icon: '🔧', title: 'Ремонт геймпадов', desc: 'Дрифт, кнопки, Bluetooth' },
        ],
        faq: [
            { q: 'Сколько стоит чистка PS5?', a: '2 200₽. Полная разборка, чистка радиатора и вентилятора, замена термопасты.' },
            { q: 'Ремонтируете ли геймпады DualSense?', a: 'Да, ремонтируем дрифт стиков, кнопки, Bluetooth. Цена от 1 500₽.' },
        ]
    }
};

const BRAND_GRADIENT = 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 50%, #001a38 100%)';

export default function CategoryTemplate({ categorySlug }) {
    const data = CATEGORIES_DATA[categorySlug];

    if (!data) {
        return (
            <div className="min-h-screen py-12 text-center">
                <h1 className="text-3xl font-bold">Категория не найдена</h1>
                <Link href="/services" className="text-primaryDark mt-4 inline-block">
                    ← Вернуться к услугам
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <section
                className="relative py-20 overflow-hidden"
                style={{ background: BRAND_GRADIENT }}
            >
                {/* Декоративные элементы */}
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(255, 140, 0, 0.3) 0%, transparent 70%)',
                        transform: 'translate(30%, -30%)'
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                        transform: 'translate(-30%, 30%)'
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
                    <div className="text-7xl mb-6">{data.icon}</div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {data.title}
                        <span className="block text-2xl md:text-3xl mt-2 opacity-90">
                            {data.subtitle}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-95 mb-8">
                        {data.description}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="#repair-calculator"
                            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
                        >
                            🧮 Рассчитать стоимость
                        </a>
                        <a
                            href="tel:+7-911-501-88-28"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                        >
                            📞 +7 (911) 501-88-28
                        </a>
                    </div>
                </div>

                {/* Волна-переход к следующей секции */}
                <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 100"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                    >
                        <path
                            d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,100 L0,100 Z"
                            fill="#ffffff"
                        />
                    </svg>
                </div>
            </section>

            {/* Преимущества */}
            <section className="py-16 bg-bg">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--color-primary-dark)' }}>
                        Почему выбирают нас
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.advantages.map((adv, i) => (
                            <div
                                key={i}
                                className="bg-surface rounded-2xl p-6 border-2 border-border hover:border-primary transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="text-5xl mb-4">{adv.icon}</div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                                    {adv.title}
                                </h3>
                                <p className="text-muted text-sm">{adv.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Популярные услуги */}
            <section className="py-16 bg-surface">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                        Популярные услуги
                    </h2>
                    <p className="text-center text-muted mb-12">
                        Цены указаны <strong>только за работу</strong> мастера (без учёта запчастей)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.popularServices.map((svc, i) => (
                            <div
                                key={i}
                                className="bg-bg rounded-2xl p-6 border-2 border-border hover:border-orange-400 transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-lg flex-1" style={{ color: 'var(--color-primary-dark)' }}>
                                        {svc.name}
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-muted">⏱️ {svc.time}</span>
                                    <span className="font-bold text-xl" style={{ color: '#ff8c00' }}>
                                        {svc.price}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Калькулятор (предзагруженный на категорию) */}
            <section id="repair-calculator" className="py-16 bg-bg">
                <div className="max-w-7xl mx-auto px-4">
                    <RepairCalculator initialDeviceType={CALCULATOR_KEY_MAP[categorySlug]} />
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-surface">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--color-primary-dark)' }}>
                        ❓ Часто задаваемые вопросы
                    </h2>
                    <div className="space-y-4">
                        {data.faq.map((item, i) => (
                            <details
                                key={i}
                                className="group bg-bg rounded-2xl p-6 border-2 border-border hover:border-primary transition-all"
                            >
                                <summary className="flex items-center justify-between cursor-pointer font-bold text-lg" style={{ color: 'var(--color-primary-dark)' }}>
                                    <span>{item.q}</span>
                                    <svg
                                        className="w-5 h-5 text-muted group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <p className="mt-4 text-muted leading-relaxed">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Гео-якоря: быстрый доступ к популярным запросам */}
            {GEO_ANCHORS[categorySlug] && (
                <section className="py-8 bg-bg border-t border-border">
                    <div className="max-w-4xl mx-auto px-4">
                        <p className="text-sm text-muted mb-3 font-medium uppercase tracking-wide">
                            Популярные запросы в Вологде:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {GEO_ANCHORS[categorySlug].map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className="text-sm px-4 py-2 rounded-full border border-primary text-primaryDark hover:bg-primaryBg hover:border-primary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Смотрите также */}
            {RELATED_CATEGORIES[categorySlug] && (
                <section className="py-16 bg-surface">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: 'var(--color-primary-dark)' }}>
                            Смотрите также
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {RELATED_CATEGORIES[categorySlug].map((slug) => {
                                const related = CATEGORIES_DATA[slug];
                                if (!related) return null;
                                return (
                                    <Link
                                        key={slug}
                                        href={`/services/${slug}`}
                                        className="flex items-center gap-4 bg-bg rounded-2xl p-5 border-2 border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <span className="text-4xl flex-shrink-0">{related.icon}</span>
                                        <div>
                                            <p className="font-bold text-base" style={{ color: 'var(--color-primary-dark)' }}>
                                                {related.title}
                                            </p>
                                            <p className="text-sm text-muted mt-0.5">{related.subtitle}</p>
                                        </div>
                                        <span className="ml-auto text-muted text-xl flex-shrink-0">→</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-16" style={{ background: BRAND_GRADIENT }}>
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Нужна консультация по ремонту?
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        Опишите проблему — назовём точную стоимость и сроки
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="tel:+7-911-501-88-28"
                            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg"
                        >
                            📞 +7 (911) 501-88-28
                        </a>
                        <Link
                            href="/contacts"
                            className="px-8 py-4 bg-bg text-primaryDark rounded-xl font-bold text-lg hover:scale-105 transition-all"
                        >
                            📍 Приехать в сервис
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}