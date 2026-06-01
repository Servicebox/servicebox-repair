// app/layout.js
import './globals.css';
import 'tailwindcss';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import Header from '../components/Header/Header';
import BubbleBackground from '../components/BubbleBackground/BubbleBackground';
import Footer from '../components/Footer/Footer';
import CookieConsent from '../components/CookieConsent/CookieConsent';
import { AuthProvider } from '../components/contexts/AuthContext';
import Chat from '../components/Chat/Chat';
import ShopContextProvider from '../components/ShopContext/ShopContext';
import Analytics from '../components/Analytics/Analytics';
import BreadcrumbsWithContext from '@/components/BreadcrumbsWithContext';
import { BreadcrumbProvider } from '@/components/contexts/BreadcrumbContext';

config.autoAddCss = false;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// === Структурированные данные (JSON-LD) ===

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // === LocalBusiness (исправлено) ===
    {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}#business`,
      name: 'ServiceBox - Сервисный центр на Северной',
      alternateName: ['Сервис Бокс', 'СервисБокс Вологда', 'ServiceBox35'],
      description: 'Профессиональный ремонт ноутбуков, телефонов, видеокарт, телевизоров, Apple техники в Вологде. Ежедневно с 10:00 до 20:00. Гарантия до 24 месяцев.',
      url: BASE_URL,
      telephone: ['+7-911-501-88-28', '+7-911-501-06-96'],
      email: '508828@bk.ru',
      address: {
        '@type': 'PostalAddress',
        streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
        addressLocality: 'Вологда',
        addressRegion: 'Вологодская область',
        postalCode: '160000',
        addressCountry: 'RU',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 59.229445, longitude: 39.878542 },
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      }],
      priceRange: '₽₽',
      image: `${BASE_URL}/logo.png`,
      areaServed: { '@type': 'City', name: 'Вологда' },
      foundingDate: '2016',
      founder: { '@type': 'Person', name: 'ServiceBox Team' },
      sameAs: ['https://vk.com/servicebox35', 'https://t.me/Tomkka'],

      makesOffer: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт ноутбуков' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт телефонов' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт видеокарт' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт телевизоров' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт Apple техники' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Чистка ноутбуков' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'BGA-пайка' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Восстановление данных' } },
      ],

      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
    },

    // === WebSite (исправлен SearchAction) ===
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}#website`,
      url: BASE_URL,
      name: 'ServiceBox Вологда',
      description: 'Сервисный центр по ремонту техники в Вологде. Ежедневно с 10:00 до 20:00.',
      publisher: { '@id': `${BASE_URL}#business` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },

        'query-input': 'required name=search_term_string',
      },
    },

    // === FAQPage (без изменений) ===
    {
      '@type': 'FAQPage',
      '@id': `${BASE_URL}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Где находится сервисный центр ServiceBox в Вологде?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "ServiceBox находится по адресу: г. Вологда, ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'. Работаем ежедневно с 10:00 до 20:00 без выходных.",
          },
        },
        {
          '@type': 'Question',
          name: 'Сколько стоит диагностика техники?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Диагностика бесплатна при согласии на ремонт. При отказе — от 500 до 1000 рублей в зависимости от сложности.',
          },
        },
        {
          '@type': 'Question',
          name: 'Даете ли вы гарантию на ремонт?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Да, гарантия на работы от 3 до 24 месяцев и на запчасти от 3 до 12 месяцев.',
          },
        },
        {
          '@type': 'Question',
          name: 'Как быстро можно починить телефон или ноутбук?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Простые работы — от 30 минут. Сложный ремонт — от 1 до 7 дней.',
          },
        },
        {
          '@type': 'Question',
          name: 'Что делать, если телефон упал в воду?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Немедленно выключите, не заряжайте и не сушите феном. Принесите в ServiceBox для профессиональной чистки.',
          },
        },
      ],
    },

    {
      '@type': 'Service',
      '@id': `${BASE_URL}#main-service`,
      name: 'Ремонт цифровой техники в Вологде',
      description: 'Комплексный ремонт ноутбуков, телефонов, видеокарт и другой электроники',
      provider: { '@id': `${BASE_URL}#business` },
      areaServed: {
        '@type': 'City',
        name: 'Вологда',
        address: {
          '@type': 'PostalAddress',
          streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
          addressLocality: 'Вологда',
          addressRegion: 'Вологодская область',
          postalCode: '160000',
          addressCountry: 'RU',
        },
      },
      availableChannel: {
        '@type': 'ServiceChannel',
        servicePhone: '+7-911-501-88-28',
        serviceUrl: BASE_URL,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Услуги сервисного центра ServiceBox',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Диагностика', price: '0', priceCurrency: 'RUB' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Замена экрана ноутбука', priceRange: '1500-5000 RUB' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонт материнской платы', priceRange: '2500-8000 RUB' } },
        ],
      },
    },
  ],
};

export const metadata = {
  title: {
    default: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    template: '%s | ServiceBox Вологда',
  },
  description: 'Ремонт ноутбуков, видеокарт, телефонов, телевизоров, Apple техники в Вологде. Сервисный центр на Северной, 7А. Ежедневно 10:00-20:00. Гарантия до 24 мес. Бесплатная диагностика.',
  keywords: 'ремонт ноутбуков Вологда, ремонт телефонов, сервисный центр, ремонт видеокарт, ремонт техники, ремонт Apple, чистка ноутбуков, переклейка стекол, ServiceBox, Северная 7А',
  authors: [{ name: 'ServiceBox Вологда' }],
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    description: 'Профессиональный ремонт техники в Вологде. Сервисный центр на Северной, 7А. Ежедневно с 10:00 до 20:00. Гарантия качества до 24 месяцев.',
    url: BASE_URL,
    siteName: 'ServiceBox',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ServiceBox - Ремонт техники в Вологде',
      },
    ],
  },
  robots: {
    index: IS_PRODUCTION,
    follow: IS_PRODUCTION,
    googleBot: {
      index: IS_PRODUCTION,
      follow: IS_PRODUCTION,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    additional: ['all', 'max-snippet:-1', 'max-image-preview:large', 'max-video-preview:-1'],
  },
  verification: {
    yandex: '97888825',
    google: '6k281LQ_idKz1FOxlcDm522DmLoGRjR3Pu3_so0dLhs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ремонт ноутбуков и телефонов в Вологде | Сервис Бокс',
    description: 'Профессиональный ремонт техники в Вологде. Ежедневно с 10:00 до 20:00. Гарантия до 24 месяцев.',
    images: ['/og-image.jpg'],
  },
  other: {
    'google-ai': 'available',
    'yandex-ai': 'optimized',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1929',
};

const criticalCSS = `
  body { 
    margin: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #f8fafc;
    color: #1a2a3a;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page__wrapper { min-height: 100vh; display: flex; flex-direction: column; }
  :focus { outline: 2px solid #0066cc; outline-offset: 2px; }
  :focus:not(:focus-visible) { outline: none; }
  :focus-visible { outline: 2px solid #0066cc; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" itemScope itemType="https://schema.org/WebSite" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Ремонт ноутбуков, видеокарт, телефонов, телевизоров, Apple техники в Вологде. Сервисный центр на Северной, 7А. Ежедневно 10:00-20:00. Гарантия до 24 мес." />
        <meta name="google-site-verification" content="6k281LQ_idKz1FOxlcDm522DmLoGRjR3Pu3_so0dLhs" />
        <meta name="yandex-verification" content="aaae5f6d8950e0e0" />

        {/* Critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WNT2RHZJ');
            `,
          }}
        />

        {/* AI-оптимизация */}
        <meta name="google-ai" content="available" />
        <meta name="yandex-ai" content="optimized" />
        <link rel="alternate" type="application/json" href="/api/ai/v1/business" title="Структурированные данные о бизнесе ServiceBox для AI-ассистентов" />
        <link rel="alternate" type="application/json" href="/api/ai/v1/emergency" title="Экстренные инструкции для пользователей и ИИ" />
        <link rel="alternate" type="application/json" href="/ai-assistant.json" title="Прямой доступ к данным для ИИ-ассистентов" />

        {/* Preconnect и DNS prefetch */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />

        {/* GEO-метатеги */}
        <meta name="geo.region" content="RU-VLG" />
        <meta name="geo.placename" content="Вологда" />
        <meta name="geo.position" content="59.229445;39.878542" />
        <meta name="ICBM" content="59.229445, 39.878542" />

        {/* Фавиконы */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.webp" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta httpEquiv="content-security-policy" content="upgrade-insecure-requests" />
      </head>
      <body>
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNT2RHZJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
            loading="lazy"
          />
        </noscript>
        <noscript>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              background: '#dc2626',
              color: 'white',
              padding: '12px 16px',
              textAlign: 'center',
              zIndex: 9999,
              fontSize: '14px',
            }}
          >
            ⚠️ Для корректной работы сайта включите JavaScript в настройках браузера.
          </div>
        </noscript>

        <AuthProvider>
          <ShopContextProvider>
            <BreadcrumbProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <BubbleBackground />
                <div className="page__wrapper flex-grow">
                  <BreadcrumbsWithContext />
                  <main itemScope itemType="https://schema.org/Service" className="flex-grow">
                    {children}
                  </main>
                  <CookieConsent />
                  <Chat />
                  <Footer />
                </div>
              </div>
            </BreadcrumbProvider>
          </ShopContextProvider>
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  );
}