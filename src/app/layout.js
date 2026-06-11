// app/layout.js - ИСПРАВЛЕННЫЙ
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
import { BUSINESS, BASE_URL, SEO_DEFAULTS } from '@/lib/constants';
import { LOCAL_BUSINESS_SCHEMA } from '@/lib/seo-helpers';

config.autoAddCss = false;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    LOCAL_BUSINESS_SCHEMA,
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}#website`,
      url: BASE_URL,
      name: BUSINESS.shortName,
      description: SEO_DEFAULTS.description,
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
    {
      '@type': 'FAQPage',
      '@id': `${BASE_URL}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Где находится сервисный центр ServiceBox в Вологде?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `ServiceBox находится по адресу: г. Вологда, ${BUSINESS.mainAddress.street}. Работаем ${BUSINESS.hours.text} без выходных.`,
          },
        },
        {
          '@type': 'Question',
          name: 'Сколько стоит диагностика техники?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Диагностика бесплатна для смартфонов, планшетов, телевизоров и приставок. Для ноутбуков — бесплатно при согласии на ремонт, при отказе — 700₽.',
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
        name: BUSINESS.mainAddress.city,
      },
      availableChannel: {
        '@type': 'ServiceChannel',
        servicePhone: BUSINESS.phones.primary,
        serviceUrl: BASE_URL,
      },
    },
  ],
};

export const metadata = {
  title: {
    default: SEO_DEFAULTS.title,
    template: `%s | ${BUSINESS.shortName}`,
  },
  description: SEO_DEFAULTS.description,
  keywords: SEO_DEFAULTS.keywords,
  authors: [{ name: BUSINESS.shortName }],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    url: BASE_URL,
    siteName: BUSINESS.shortName,
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BUSINESS.shortName} - Ремонт техники в Вологде`,
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
    google: '6k281LQ_idKz1FOxlcDm522DmLoGRjR3Pu3_so0dLhs',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: ['/og-image.jpg'],
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
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
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
        <meta name="google-ai" content="available" />
        <meta name="yandex-ai" content="optimized" />
        <link rel="alternate" type="application/json" href="/api/ai/v1/business" />
        <link rel="alternate" type="application/json" href="/api/ai/v1/emergency" />
        <link rel="alternate" type="application/json" href="/ai-assistant.json" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />
        <meta name="geo.region" content="RU-VLG" />
        <meta name="geo.placename" content={BUSINESS.mainAddress.city} />
        <meta name="geo.position" content={`${BUSINESS.coordinates.latitude};${BUSINESS.coordinates.longitude}`} />
        <meta name="ICBM" content={`${BUSINESS.coordinates.latitude}, ${BUSINESS.coordinates.longitude}`} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.webp" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body>
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
                  {/* ✅ ИСПРАВЛЕНО: убран дублирующий калькулятор */}
                  <main className="flex-grow">
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