// app/layout.js
import './globals.css'
import 'tailwindcss';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Header from '../components/Header/Header';
import BubbleBackground from "../components/BubbleBackground/BubbleBackground";
import Footer from "../components/Footer/Footer";
import CookieConsent from '../components/CookieConsent/CookieConsent';
import { AuthProvider } from "../components/contexts/AuthContext";
import Chat from '../components/Chat/Chat';
import ShopContextProvider from '../components/ShopContext/ShopContext';
import Analytics from '../components/Analytics/Analytics';
import BreadcrumbsWithContext from '@/components/BreadcrumbsWithContext'
import { BreadcrumbProvider } from '@/components/contexts/BreadcrumbContext';

config.autoAddCss = false;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ✅ Структурированные данные для SEO и AI
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}#business-severnaya`,
      "name": "ServiceBox - Сервисный центр на Северной",
      "description": "Сервисный центр по ремонту ноутбуков, телефонов, компьютеров и другой техники в Вологде. Ежедневно с 10:00 до 20:00.",
      "url": SITE_URL,
      "telephone": "+7-911-501-88-28",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Северная, д. 7А, 1 этаж",
        "addressLocality": "Вологда",
        "postalCode": "160000",
        "addressCountry": "RU",
        "addressRegion": "Вологодская область"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 59.229445,
        "longitude": 39.878542
      },
      "openingHours": ["Mo-Su 10:00-20:00"],
      "priceRange": "₽₽",
      "serviceType": [
        "Ремонт ноутбуков",
        "Чистка ноутбуков",
        "Ремонт видеокарт",
        "Ремонт телефонов",
        "Ремонт телевизоров",
        "Ремонт Apple техники",
        "Переклейка стекла дисплея",
        "Ремонт игровых приставок",
        "Замена дисплея на телефоне",
        "Замена аккумулятора на телефоне",
        "Ремонт моноблоков",
        "Ремонт компьютеров",
        "Ремонт планшетов",
        "Ремонт стационарных компьютеров",
        "Ремонт материнских плат",
        "BGA-пайка",
        "Ребол процессоров",
        "Замена подсветки на телевизоре"
      ],
      "areaServed": {
        "@type": "City",
        "name": "Вологда"
      },
      "foundingDate": "2016",
      "founder": {
        "@type": "Person",
        "name": "ServiceBox Team"
      }
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      "url": SITE_URL,
      "name": "ServiceBox Вологда",
      "description": "Сервисный центр по ремонту техники в Вологде. Ежедневно с 10:00 до 20:00.",
      "publisher": {
        "@id": `${SITE_URL}#business-severnaya`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      "name": "ServiceBox",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.png`,
      "sameAs": [
        "https://vk.com/servicebox35",
        "https://t.me/Tomkka"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+7-911-501-88-28",
          "contactType": "customer service",
          "availableLanguage": "Russian"
        },
        {
          "@type": "ContactPoint",
          "telephone": "+7-911-501-06-96",
          "contactType": "customer service",
          "availableLanguage": "Russian"
        }
      ]
    }
  ]
};

export const metadata = {
  title: {
    default: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    template: '%s | ServiceBox Вологда'
  },
  description: 'Ремонт ноутбуков, ремонт видеокарт, ремонт телефонов, телевизоров, Apple техники, переклейка стекол. Сервисный центр в Вологде на Северной, 7А. Ежедневно с 10:00 до 20:00.',
  keywords: 'ремонт ноутбуков Вологда, ремонт телефонов, сервисный центр, ремонт видеокарт, ремонт техники, Apple ремонт, чистка ноутбуков, переклейка стекол, ServiceBox',
  authors: [{ name: 'ServiceBox Вологда' }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    description: 'Профессиональный ремонт техники в Вологде. Сервисный центр на Северной, 7А. Ежедневно с 10:00 до 20:00. Гарантия качества.',
    url: SITE_URL,
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
  },
  verification: {
    yandex: '97888825',
    google: 'G-MZ24DLXSSM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ремонт ноутбуков и телефонов в Вологде | Сервис Бокс | ServiceBox',
    description: 'Профессиональный ремонт техники в Вологде. Ежедневно с 10:00 до 20:00.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const criticalCSS = `
  body { 
    margin: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
  }
  * { 
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .page__wrapper { 
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  :focus { 
    outline: 2px solid #0066cc; 
    outline-offset: 2px; 
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru"
      itemScope
      itemType="https://schema.org/WebSite"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Ремонт ноутбуков, ремонт видеокарт, ремонт телефонов, телевизоров, Apple техники, переклейка стекол. Сервисный центр в Вологде на Северной, 7А. Ежедневно с 10:00 до 20:00." />

        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />

        <meta name="google-ai" content="available" />

        <link
          rel="alternate"
          type="application/json"
          href="/api/ai/v1/business"
          title="Структурированные данные о бизнесе ServiceBox для AI"
        />
        <link
          rel="alternate"
          type="application/json"
          href="/api/ai/v1/emergency"
          title="Экстренные инструкции для AI"
        />

        {/* ✅ DNS prefetch для быстрой загрузки */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />

        {/* ✅ GEO метатеги для локального SEO */}
        <meta name="geo.region" content="RU-VLG" />
        <meta name="geo.placename" content="Вологда" />
        <meta name="geo.position" content="59.229445;39.878542" />
        <meta name="ICBM" content="59.229445, 39.878542" />

        {/* ✅ Фавиконы */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ✅ Структурированные данные (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* ✅ Безопасность */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body>
        {/* ✅ GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNT2RHZJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* ✅ Предупреждение для пользователей без JS */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#ff4444',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            zIndex: 9999
          }}>
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

        {/* ✅ Аналитика */}
        <Analytics />
      </body>
    </html>
  );
}