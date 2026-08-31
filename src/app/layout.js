import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inter, Inter_Tight } from 'next/font/google';
import Script from 'next/script';

const interTight = Inter_Tight({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

import Header from '../components/Header/Header';
import BubbleBackground from '../components/BubbleBackground/BubbleBackground';
import Footer from '../components/Footer/Footer';
import MobileStickyCta from '../components/MobileStickyCta/MobileStickyCta';
import CookieConsent from '../components/CookieConsent/CookieConsent';
import { AuthProvider } from '../components/contexts/AuthContext';
import ShopContextProvider from '../components/ShopContext/ShopContext';
import Analytics from '../components/Analytics/Analytics';
import BreadcrumbsWithContext from '@/components/BreadcrumbsWithContext';
import { BreadcrumbProvider } from '@/components/contexts/BreadcrumbContext';
import { BUSINESS, BASE_URL, SEO_DEFAULTS } from '@/lib/constants';
import { LOCAL_BUSINESS_SCHEMA } from '@/lib/seo-helpers';

config.autoAddCss = false;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    // Бренд уже зашит в конце почти каждого title страниц (см. page.js,
    // services/*, brands/*, parts/* и т.д.). Шаблон "%s | СЕРВИС БОКС"
    // добавлял второй суффикс → в выдаче было "… | СЕРВИС БОКС | СЕРВИС БОКС".
    // Шаблон = "%s": страница сама отвечает за бренд в своём title.
    default: SEO_DEFAULTS.title,
    template: '%s',
  },
  description: SEO_DEFAULTS.description,
  keywords: SEO_DEFAULTS.keywords,
  authors: [{ name: BUSINESS.shortName }],
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
    other: {
      'zen-verification': 'GZkB7zLOb4yUywviRQMZ7uSkAhSM1LqMTopu0mBFxOU7NqbE5EoDFShPI6Q5yMju',
    },
  },
  openGraph: {
    title: {
      default: `${SEO_DEFAULTS.title} | СЕРВИС БОКС Вологда`,
      template: `%s | СЕРВИС БОКС`,
    },
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
  twitter: {
    card: 'summary_large_image',
    title: { default: SEO_DEFAULTS.title, template: `%s | СЕРВИС БОКС` },
    description: SEO_DEFAULTS.description,
    images: ['/og-image.jpg'],
  },
  other: {
    'yandex-ai': 'optimized',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1929',
};

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
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning data-scroll-behavior="smooth" className={`${interTight.variable} ${inter.variable}`}>
      <head>
        {/* Anti-flash: apply theme before hydration to prevent flicker */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){
    try {
      var t = localStorage.getItem('theme');
      var pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t || pref);
      var fs = localStorage.getItem('fontSize');
      if (fs && fs !== 'normal') document.documentElement.setAttribute('data-font-size', fs);
      var hc = localStorage.getItem('highContrast');
      if (hc === 'true') document.documentElement.setAttribute('data-contrast', 'high');
    } catch(e) {}
  })();` }} />
        <meta charSet="utf-8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WNT2RHZJ');`,
          }}
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://yastatic.net" />
        <link rel="dns-prefetch" href="https://api-maps.yandex.ru" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Перейти к основному содержимому
        </a>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNT2RHZJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <AuthProvider>
          <ShopContextProvider>
            <BreadcrumbProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <BubbleBackground />
                <div className="page__wrapper flex-grow">
                  <BreadcrumbsWithContext />
                  <main id="main-content">{children}</main>
                </div>
                <Footer />
                <MobileStickyCta />
                <CookieConsent />
              </div>
            </BreadcrumbProvider>
          </ShopContextProvider>
        </AuthProvider>

        <Analytics />
        <Script
          src="https://service-box-35.ru/widget-loader.js"
          data-key="wk_live_10fb3bed35b39bd97f13fb21a7e1eadfc9f614f6efef1924"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}