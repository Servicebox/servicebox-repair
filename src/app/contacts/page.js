import { BUSINESS, BASE_URL } from '@/lib/constants';
import Script from 'next/script';

export const metadata = {
    title: 'Контакты ServiceBox в Вологде | Адрес, телефон, график работы',
    description: 'Как добраться в сервисный центр: г. Вологда, ул. Северная 7А, ТЦ КИТ. Бесплатная консультация по телефону +7 (911) 501-88-28. Ежедневно 10:00-20:00.',
    keywords: ['ServiceBox контакты', 'адрес сервис центра Вологда', 'телефон ремонта телефонов', 'график работы ServiceBox', 'где находится сервис центр'],
    alternates: { canonical: `${BASE_URL}/contacts` },
    openGraph: {
        title: 'Контакты ServiceBox Вологда',
        description: 'Приезжайте на диагностику или звоните. Работаем без выходных. Вологда, ул. Северная 7А.',
        type: 'website',
        url: `${BASE_URL}/contacts`,
    },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': BUSINESS.shortName,
  'description': 'Сервисный центр по ремонту электроники и техники в Вологде',
  'url': BASE_URL,
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': BUSINESS.mainAddress.street,
    'addressLocality': BUSINESS.mainAddress.city,
    'addressRegion': BUSINESS.mainAddress.region,
    'postalCode': BUSINESS.mainAddress.postalCode,
    'addressCountry': BUSINESS.mainAddress.country
  },
  'telephone': BUSINESS.phones.primary,
  'email': BUSINESS.email,
  'areaServed': {
    '@type': 'City',
    'name': 'Вологда'
  },
  'openingHours': {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    'opens': BUSINESS.hours.open,
    'closes': BUSINESS.hours.close
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': BUSINESS.coordinates.latitude,
    'longitude': BUSINESS.coordinates.longitude
  }
};

export default function ContactsPage() {
    const yandexMapUrl = "https://yandex.ru/map-widget/v1/?um=constructor%3Ad1892ae8340bf3eb12e962e969ca890d6706560ed5a2a082e22ac2d2c8ae16f4&source=constructor";
    const yandexProfileUrl = "https://yandex.ru/maps/org/servis_boks/58578899506/";

    return (
        <>
            <Script
                id="local-business-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema)
                }}
            />
            <section className="max-w-5xl mx-auto py-12 px-4">

            <header className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#002147] mb-4">Контакты сервисного центра ServiceBox</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Приезжайте на бесплатную диагностику или свяжитесь с нами онлайн. Отвечаем в течение 15 минут.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-[#002147]">Как с нами связаться</h2>
                    <div className="space-y-6">
                        <ContactBlock icon="📞" title="Телефон" value={BUSINESS.phonesFormatted.primary} sub={BUSINESS.phones.secondary} href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} note="Звонки: 10:00 – 20:00" />
                        <ContactBlock icon="✉️" title="Электронная почта" value={BUSINESS.email} href={`mailto:${BUSINESS.email}`} note="Ответим в течение 1 дня" />
                        <ContactBlock icon="🕒" title="Режим работы" value="Ежедневно: 10:00 - 20:00" note="Без выходных и перерывов" />
                    </div>

                    <div className="mt-8">
                        <h3 className="font-bold text-lg mb-4 text-[#002147]">Мы в социальных сетях</h3>
                        <div className="flex gap-4">
                            <a href={BUSINESS.socials.vk} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-center font-medium hover:bg-blue-800 transition">ВКонтакте</a>
                            <a href={BUSINESS.socials.telegram} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-center font-medium hover:bg-blue-600 transition">Telegram</a>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-[#002147]">Наш сервисный центр</h2>
                    <div className="mb-4 text-gray-700">
                        <p className="font-semibold text-lg">г. Вологда, ул. Северная, 7А</p>
                        <p className="text-sm text-gray-500">ТЦ «КИТ», 1 этаж, напротив эскалатора (ориентир: магазин Бристоль)</p>
                    </div>
                    <div className="w-full h-[300px] rounded-xl overflow-hidden bg-gray-100 mb-6">
                        <iframe src={yandexMapUrl} width="100%" height="100%" frameBorder="0" loading="lazy" title="Карта проезда ServiceBox" className="w-full h-full" />
                    </div>
                    <a href={yandexProfileUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-[#002147] text-white py-3 rounded-xl font-bold hover:bg-[#003d7a] transition">
                        🗺️ Открыть в Яндекс.Картах
                    </a>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-12">
                {[
                    { icon: '⚡', title: 'Ремонт от 30 мин', desc: 'При вас' },
                    { icon: '🛡️', title: 'Гарантия 24 мес', desc: 'Официально' },
                    { icon: '🔍', title: 'Диагностика', desc: 'Бесплатно' },
                    { icon: '💰', title: 'Без предоплаты', desc: 'Оплата после' }
                ].map((f, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-2xl mb-2">{f.icon}</div>
                        <div className="font-bold text-sm text-[#002147]">{f.title}</div>
                        <div className="text-xs text-gray-500">{f.desc}</div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-[#002147] to-[#003d7a] rounded-2xl p-8 text-center text-white mb-12">
                <h2 className="text-2xl font-bold mb-3">Нужна срочная консультация?</h2>
                <p className="mb-6 opacity-90">Опишите проблему — назовём точную стоимость и сроки ремонта вашей техники</p>
                <a href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105">
                    📞 Позвонить сейчас
                </a>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 text-gray-700">
                <h3 className="text-lg font-bold mb-4 text-[#002147] flex items-center gap-2">🚌 Как добраться на общественном транспорте</h3>
                <ul className="space-y-2 list-disc list-inside">
                    <li><strong>Остановка «Судоремонтная»:</strong> автобусы № 4, 6, 8, 9, 16, 19, 23, 42, 43, 44</li>
                    <li><strong>Из центра города:</strong> любой транспорт до остановки «Судоремонтная», далее 2 минуты пешком в сторону ТЦ «КИТ»</li>
                    <li><strong>На автомобиле:</strong> бесплатная парковка рядом с ТЦ «КИТ»</li>
                </ul>
            </div>
        </section>
        </>
    );
}

function ContactBlock({ icon, title, value, sub, href, note }) {
    const Content = href ? 'a' : 'div';
    return (
        <Content href={href} className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${href ? 'hover:bg-gray-50 cursor-pointer' : ''}`}>
            <span className="text-2xl">{icon}</span>
            <div>
                <div className="font-bold text-gray-900">{title}</div>
                <div className="text-lg font-medium text-[#002147]">{value}</div>
                {sub && <div className="text-sm text-gray-500">{sub}</div>}
                {note && <div className="text-xs text-gray-500 mt-1">{note}</div>}
            </div>
        </Content>
    );
}