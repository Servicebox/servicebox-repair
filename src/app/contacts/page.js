import Link from 'next/link';
import { BUSINESS, BASE_URL } from '@/lib/constants';

export const metadata = {
    title: 'Контакты сервисного центра ServiceBox в Вологде | ул. Северная 7А',
    description: 'Сервисный центр ServiceBox в Вологде: ул. Северная, 7А, 1 этаж напротив эскалатора. Телефон +7 (911) 501-88-28. Постройте маршрут на Яндекс.Картах.',
    alternates: { canonical: `${BASE_URL}/contacts` },
};

const YANDEX_MAPS_PROFILE = 'https://yandex.ru/maps/org/servis_boks/58578899506/';

const contactsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "LocalBusiness",
            "@id": `${BASE_URL}#business`,
            "name": BUSINESS.name,
            "alternateName": ["Сервис Бокс", "СервисБокс Вологда", "ServiceBox35"],
            "image": `${BASE_URL}/logo.png`,
            "telephone": BUSINESS.phones.primary,
            "email": BUSINESS.email,
            "url": BASE_URL,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": BUSINESS.mainAddress.street,
                "addressLocality": BUSINESS.mainAddress.city,
                "addressRegion": BUSINESS.mainAddress.region,
                "postalCode": BUSINESS.mainAddress.postalCode,
                "addressCountry": BUSINESS.mainAddress.country
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": BUSINESS.coordinates.latitude,
                "longitude": BUSINESS.coordinates.longitude
            },
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": BUSINESS.hours.open,
                "closes": BUSINESS.hours.close
            },
            "priceRange": "₽₽",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": BUSINESS.rating.value,
                "reviewCount": BUSINESS.rating.count,
                "bestRating": BUSINESS.rating.bestRating,
                "worstRating": BUSINESS.rating.worstRating
            },
            "sameAs": [
                BUSINESS.socials.vk,
                BUSINESS.socials.telegram,
                YANDEX_MAPS_PROFILE
            ]
        }
    ]
};

export default function ContactsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactsJsonLd) }}
            />

            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Остальной код страницы остаётся без изменений */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#002147' }}>
                            Сервисный центр ServiceBox
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Профессиональный ремонт цифровой техники в Вологде с 2016 года
                        </p>
                    </div>

                    {/* Main Location Card */}
                    <div className="bg-white rounded-3xl shadow-lg border-2 mb-8 overflow-hidden" style={{ borderColor: '#002147' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-8 lg:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: '#002147' }}>
                                        📍
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold" style={{ color: '#002147' }}>
                                            Главный сервисный центр
                                        </h2>
                                        <div className="text-sm text-gray-500">Полный цикл ремонтных работ</div>
                                    </div>
                                </div>

                                <div className="space-y-5 mb-8">
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl mt-1 flex-shrink-0">🏢</span>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">
                                                г. Вологда, ул. Северная, 7А
                                            </div>
                                            <div className="text-gray-600">ТЦ «КИТ», <strong>1 этаж</strong>, напротив эскалатора</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Ориентир: рядом с Бристоль, прямо от входа
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl flex-shrink-0">🕐</span>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">Ежедневно: 10:00 – 20:00</div>
                                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Без выходных · Без записи
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl mt-1 flex-shrink-0">🔧</span>
                                        <div className="text-gray-700">
                                            <strong>Полный цикл ремонта:</strong> BGA-пайка, замена чипов, ремонт материнских плат, восстановление после залития, замена экранов, видеокарт
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={YANDEX_MAPS_PROFILE}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] shadow-lg"
                                    style={{ background: '#002147' }}
                                >
                                    🗺️ Открыть на Яндекс.Картах
                                </a>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 lg:p-8 flex flex-col gap-6">
                                <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                                    <iframe
                                        src="https://yandex.ru/map-widget/v1/?um=constructor%3Ad1892ae8340bf3eb12e962e969ca890d6706560ed5a2a082e22ac2d2c8ae16f4&source=constructor"
                                        width="100%"
                                        height="400"
                                        frameBorder="0"
                                        style={{ border: 0, display: 'block' }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        title="ServiceBox на Яндекс.Картах"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#002147' }}>
                                        Как нас найти внутри ТЦ
                                    </h3>
                                    <div className="space-y-2 text-gray-700 text-sm">
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-600 font-bold">1.</span>
                                            <span>Войдите в ТЦ «КИТ» (ул. Северная, 7А)</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-600 font-bold">2.</span>
                                            <span>Мы находимся на <strong>1 этаже</strong></span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-600 font-bold">3.</span>
                                            <span>Идите прямо мимо Бристоля к эскалатору — мы <strong>напротив эскалатора</strong></span>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded-xl border border-blue-200 text-center">
                                        <div className="text-xs text-gray-600">🅿️ Бесплатная парковка рядом с ТЦ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-8">
                        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#002147' }}>
                            Как с нами связаться
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} className="group p-6 rounded-2xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-all text-center">
                                <div className="text-4xl mb-3">📞</div>
                                <div className="text-sm text-gray-500 mb-1">Телефон</div>
                                <div className="text-xl font-bold group-hover:text-green-700 transition-colors" style={{ color: '#002147' }}>
                                    {BUSINESS.phonesFormatted.primary}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">Звонки: 10:00 – 20:00</div>
                            </a>

                            <a href={`mailto:${BUSINESS.email}`} className="group p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all text-center">
                                <div className="text-4xl mb-3">✉️</div>
                                <div className="text-sm text-gray-500 mb-1">Электронная почта</div>
                                <div className="text-lg font-bold group-hover:text-blue-700 transition-colors" style={{ color: '#002147' }}>
                                    {BUSINESS.email}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">Ответим в течение 1 дня</div>
                            </a>

                            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                                <div className="text-4xl mb-3">💬</div>
                                <div className="text-sm text-gray-500 mb-1">Мессенджеры</div>
                                <div className="flex justify-center gap-3 mt-3">
                                    <a href={BUSINESS.socials.telegram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm">
                                        Telegram
                                    </a>
                                    <a href={BUSINESS.socials.vk} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm">
                                        ВКонтакте
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: '⚡', title: 'Ремонт от 30 мин', desc: 'При вас' },
                            { icon: '🛡️', title: 'Гарантия 12 мес', desc: 'Официально' },
                            { icon: '🔍', title: 'Диагностика', desc: 'Бесплатно' },
                            { icon: '💰', title: 'Без предоплаты', desc: 'Оплата после' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 text-center">
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <div className="font-bold text-sm" style={{ color: '#002147' }}>{item.title}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick CTA */}
                    <div className="rounded-3xl p-8 text-center text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' }}>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Нужна консультация по ремонту?</h2>
                        <p className="text-lg opacity-90 mb-6">Опишите проблему — назовём точную стоимость и сроки</p>
                        <a
                            href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`}
                            className="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
                        >
                            📞 Позвонить сейчас
                        </a>
                    </div>

                    {/* Public Transport Info */}
                    <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#002147' }}>
                            🚌 Как добраться общественным транспортом
                        </h3>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">•</span>
                                <span><strong>Остановка «Судоремонтная»:</strong> автобусы № 6, 8, 16, 19, 42, 44, 4, 9, 23, 43</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">•</span>
                                <span><strong>Из центра:</strong> любой транспорт до остановки «Судоремонтная»</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}