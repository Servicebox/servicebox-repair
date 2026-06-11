// components/RepairCalculator/RepairCalculatorWrapper.jsx
// ❌ НЕ добавляйте 'use client' — это серверный компонент!

import RepairCalculator from './RepairCalculator';
import { BUSINESS, BASE_URL } from '@/lib/constants';

export default function RepairCalculatorWrapper() {
    const calculatorSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            // === 1. WebApplication (сам калькулятор) ===
            {
                '@type': 'WebApplication',
                '@id': `${BASE_URL}/#calculator`,
                name: 'Калькулятор стоимости ремонта техники в Вологде',
                description: 'Бесплатный онлайн-калькулятор точной стоимости ремонта смартфонов, ноутбуков, планшетов, телевизоров, игровых приставок и видеокарт в ServiceBox. Учитывает 300+ моделей устройств и 60+ видов работ. Цены ниже конкурентов на 500-2000₽.',
                url: `${BASE_URL}/#calculator`,
                applicationCategory: 'BusinessApplication',
                applicationSubCategory: 'Price Calculator',
                operatingSystem: 'All',
                browserRequirements: 'Requires JavaScript',
                inLanguage: 'ru-RU',
                isAccessibleForFree: true,
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'RUB',
                    description: 'Бесплатный онлайн-калькулятор без регистрации',
                    availability: 'https://schema.org/InStock'
                },
                provider: { '@id': `${BASE_URL}#business` },
                publisher: { '@id': `${BASE_URL}#business` },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: BUSINESS.rating.value,
                    reviewCount: BUSINESS.rating.count,
                    bestRating: BUSINESS.rating.bestRating,
                    worstRating: BUSINESS.rating.worstRating
                },
                featureList: [
                    'Расчёт для 7 категорий техники (смартфоны, ноутбуки, планшеты, ТВ, приставки, видеокарты, handheld-PC)',
                    'Учёт 300+ моделей устройств (iPhone, Samsung, Xiaomi, MacBook, Google Pixel, ASUS, Lenovo и др.)',
                    '60+ видов ремонтных работ с точными ценами',
                    'Мгновенный результат за 30 секунд',
                    'Учёт поколения устройства и сложности работ',
                    'Цены ниже конкурентов на 500-2000₽ на популярные услуги',
                    'Бесплатная диагностика при согласии на ремонт'
                ],
                screenshot: `${BASE_URL}/images/calculator-preview.jpg`,
                softwareVersion: '3.0',
                datePublished: '2024-01-15',
                dateModified: new Date().toISOString().split('T')[0]
            },

            // === 2. Service (услуги калькулятора) ===
            {
                '@type': 'Service',
                '@id': `${BASE_URL}/#repair-calculator-service`,
                name: 'Онлайн-калькулятор стоимости ремонта',
                description: 'Интерактивный инструмент для расчёта стоимости ремонта цифровой техники в Вологде. Цены ниже конкурентов на 500-2000₽.',
                serviceType: 'Ремонт цифровой техники',
                provider: { '@id': `${BASE_URL}#business` },
                areaServed: {
                    '@type': 'City',
                    name: BUSINESS.mainAddress.city
                },
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Категории ремонта в калькуляторе',
                    itemListElement: [
                        {
                            '@type': 'OfferCatalog',
                            name: 'Ремонт смартфонов',
                            itemListElement: [
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Замена экрана iPhone 16 Pro Max' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '8990', priceCurrency: 'RUB' },
                                    description: 'Работа без учёта модуля. Дешевле конкурентов на 500-1500₽'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Переклейка стекла iPhone 16 Pro Max' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '11000', priceCurrency: 'RUB' },
                                    description: 'Дешевле конкурентов на 3000-5000₽'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Замена аккумулятора iPhone 16 Pro Max' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '4990', priceCurrency: 'RUB' },
                                    description: 'Дешевле конкурентов на 500-1500₽'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Замена разъёма Type-C (смартфон)' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '2500', priceCurrency: 'RUB' },
                                    description: 'От 2500₽. Дешевле конкурентов на 500-1000₽'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Замена разъёма Micro-USB (смартфон)' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '1800', priceCurrency: 'RUB' },
                                    description: 'От 1800₽. Дешевле конкурентов на 300-700₽'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Восстановление после воды' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '3500', priceCurrency: 'RUB' },
                                    description: 'Ультразвуковая чистка платы'
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: { '@type': 'Service', name: 'Замена экрана Samsung Galaxy S25 Ultra' },
                                    priceSpecification: { '@type': 'PriceSpecification', price: '6490', priceCurrency: 'RUB' },
                                    description: 'Дешевле конкурентов на 1000-2000₽'
                                }
                            ]
                        },
                        {
                            '@type': 'OfferCatalog',
                            name: 'Ремонт ноутбуков',
                            itemListElement: [
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Чистка от пыли + термопаста' }, priceSpecification: { '@type': 'PriceSpecification', price: '2200', priceCurrency: 'RUB' }, description: 'От 2200₽. Дешевле конкурентов на 500-1500₽' },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена матрицы' }, priceSpecification: { '@type': 'PriceSpecification', price: '2500', priceCurrency: 'RUB' }, description: 'От 2500₽. Работа без учёта матрицы' },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'BGA-пайка (реболл CPU/GPU)' }, priceSpecification: { '@type': 'PriceSpecification', price: '7500', priceCurrency: 'RUB' }, description: 'От 7500₽ на профессиональной станции' },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт материнской платы' }, priceSpecification: { '@type': 'PriceSpecification', price: '5500', priceCurrency: 'RUB' } }
                            ]
                        },
                        {
                            '@type': 'OfferCatalog',
                            name: 'Ремонт телевизоров',
                            itemListElement: [
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена LED-подсветки 32-43"' }, priceSpecification: { '@type': 'PriceSpecification', price: '3500', priceCurrency: 'RUB' }, description: 'Дешевле конкурентов на 1000-2000₽' },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена LED-подсветки 49-55"' }, priceSpecification: { '@type': 'PriceSpecification', price: '4800', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт OLED-панели' }, priceSpecification: { '@type': 'PriceSpecification', price: '15000', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт блока питания ТВ' }, priceSpecification: { '@type': 'PriceSpecification', price: '3200', priceCurrency: 'RUB' } }
                            ]
                        },
                        {
                            '@type': 'OfferCatalog',
                            name: 'Ремонт видеокарт',
                            itemListElement: [
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Реболл GPU' }, priceSpecification: { '@type': 'PriceSpecification', price: '4500', priceCurrency: 'RUB' }, description: 'От 4500₽. Дешевле конкурентов на 1000-2000₽' },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена VRAM' }, priceSpecification: { '@type': 'PriceSpecification', price: '4500', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт после майнинга' }, priceSpecification: { '@type': 'PriceSpecification', price: '4000', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Чистка + термопаста' }, priceSpecification: { '@type': 'PriceSpecification', price: '2000', priceCurrency: 'RUB' } }
                            ]
                        },
                        {
                            '@type': 'OfferCatalog',
                            name: 'Ремонт игровых приставок',
                            itemListElement: [
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт HDMI PlayStation 5' }, priceSpecification: { '@type': 'PriceSpecification', price: '5000', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена жидкого металла PS5' }, priceSpecification: { '@type': 'PriceSpecification', price: '5000', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Реболл APU PS5 Pro' }, priceSpecification: { '@type': 'PriceSpecification', price: '11500', priceCurrency: 'RUB' } },
                                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт геймпада' }, priceSpecification: { '@type': 'PriceSpecification', price: '2000', priceCurrency: 'RUB' } }
                            ]
                        }
                    ]
                }
            },

            // === 3. FAQPage ===
            {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'Сколько стоит замена экрана на iPhone 16 Pro Max в Вологде?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Замена дисплейного модуля iPhone 16 Pro Max в ServiceBox стоит 8 990₽ (только работа). Это на 500-1500₽ дешевле конкурентов. Переклейка стекла — 11 000₽ (дешевле на 3000-5000₽). Замена занимает 30-60 минут, даём гарантию 12 месяцев.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Сколько стоит замена разъёма Type-C и Micro-USB на смартфоне?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'В ServiceBox замена разъёма Type-C стоит от 2500₽, Micro-USB — от 1800₽, Lightning — от 2800₽. Цены на 300-1000₽ ниже конкурентов. Работаем с iPhone, Samsung, Xiaomi, Huawei, Honor, Google Pixel, Realme и другими брендами.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Сколько стоит чистка ноутбука с заменой термопасты?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Чистка ноутбука от пыли с заменой термопасты в ServiceBox стоит от 2200₽ — это на 500-1500₽ дешевле конкурентов. Полная разборка системы охлаждения, замена термопасты (Thermal Grizzly / Arctic), проверка температур.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Сколько стоит замена LED-подсветки телевизора?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Замена LED-подсветки телевизора: 32-43" — от 3500₽, 49-55" — от 4800₽, 58-65" — от 7500₽, 70"+ — от 12 000₽. QLED/Mini-LED — от 9500₽, OLED — от 15 000₽. Цены на 1000-3000₽ ниже конкурентов в Вологде.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Как работает калькулятор стоимости ремонта?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Выберите категорию техники (смартфон, ноутбук, планшет, ТВ, приставка или видеокарта), затем бренд и точную модель. Отметьте нужные работы — калькулятор мгновенно покажет диапазон цен с учётом поколения устройства. Все цены на 500-2000₽ ниже конкурентов.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Цены в калькуляторе окончательные?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'В калькуляторе указана стоимость работ мастера. Запчасти рассчитываются отдельно после диагностики. Финальная цена фиксируется до начала ремонта и не меняется. Диагностика бесплатна при согласии на ремонт.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Почему ваши цены дешевле конкурентов?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Мы работаем с 2016 года и оптимизировали все процессы: прямые поставки запчастей без посредников, собственная лаборатория с профессиональным оборудованием, опытные мастера с 10+ летним стажем. Это позволяет нам предлагать цены на 500-2000₽ ниже рыночных без потери качества.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Сколько стоит реболл GPU видеокарты и BGA-пайка ноутбука?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Реболл GPU видеокарты — от 4500₽, замена видеочипа — от 6500₽, замена VRAM — от 4500₽. Для ноутбуков: реболл CPU от 8000₽, реболл GPU от 7500₽, замена видеочипа от 9000₽. Используем профессиональные BGA-станции и микроскопы.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Ремонтируете ли вы Google Pixel, Nothing Phone, OnePlus?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Да, мы ремонтируем Google Pixel (6/7/8/9/10 серии), Nothing Phone (2a/3/4), OnePlus (12/13), Realme GT, Motorola Edge и другие современные смартфоны. Цены на замену экрана от 1500₽, замена разъёма Type-C от 2500₽.'
                        }
                    }
                ]
            },

            // === 4. HowTo ===
            {
                '@type': 'HowTo',
                name: 'Как рассчитать стоимость ремонта в калькуляторе ServiceBox',
                description: 'Пошаговая инструкция: узнайте точную цену ремонта за 30 секунд. Цены ниже конкурентов на 500-2000₽.',
                totalTime: 'PT30S',
                step: [
                    {
                        '@type': 'HowToStep',
                        position: 1,
                        name: 'Выберите категорию техники',
                        text: 'Нажмите на иконку нужной категории: смартфон, ноутбук, планшет, телевизор, игровая приставка или видеокарта.'
                    },
                    {
                        '@type': 'HowToStep',
                        position: 2,
                        name: 'Выберите бренд',
                        text: 'Найдите производителя вашего устройства: Apple, Samsung, Xiaomi, ASUS, Lenovo, HP, Dell, MSI, Acer, Google Pixel, Huawei, Honor или другой.'
                    },
                    {
                        '@type': 'HowToStep',
                        position: 3,
                        name: 'Выберите точную модель',
                        text: 'Отметьте вашу модель из списка. Калькулятор учтёт поколение устройства для точного расчёта.'
                    },
                    {
                        '@type': 'HowToStep',
                        position: 4,
                        name: 'Отметьте нужные работы',
                        text: 'Выберите одну или несколько услуг. Калькулятор покажет диапазон цен с учётом сложности. Все цены на 500-2000₽ ниже конкурентов.'
                    }
                ]
            },

            // === 5. BreadcrumbList ===
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Главная', item: BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Цены на ремонт', item: `${BASE_URL}/prices` },
                    { '@type': 'ListItem', position: 3, name: 'Калькулятор стоимости', item: `${BASE_URL}/#calculator` }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
                key="calculator-schema"
            />
            <RepairCalculator />
        </>
    );
}
