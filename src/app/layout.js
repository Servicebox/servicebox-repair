import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Script from 'next/script';

import Header from '../components/Header/Header';
import BubbleBackground from '../components/BubbleBackground/BubbleBackground';
import Footer from '../components/Footer/Footer';
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
    default: `${SEO_DEFAULTS.title} | СЕРВИС БОКС Вологда`,
    template: `%s | ServiceBox`,
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
  },
  openGraph: {
    title: {
      default: `${SEO_DEFAULTS.title} | ServiceBox Вологда`,
      template: `%s | ServiceBox`,
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
    title: { default: SEO_DEFAULTS.title, template: `%s | ServiceBox` },
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
    <html lang="ru" suppressHydrationWarning>
      <head>
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-gray-50 text-slate-900">
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
                  <main>{children}</main>
                </div>
                <Footer />
                <CookieConsent />
              </div>
            </BreadcrumbProvider>
          </ShopContextProvider>
        </AuthProvider>

        <Analytics />

        {/* ✅ ЕДИНЫЙ СКРИПТ CHATWOOT: ЗАГРУЗКА + СКРЫТИЕ БРЕНДИНГА */}
        <Script id="chatwoot-integration" strategy="afterInteractive">
          {`(function(d,t) {
            var BASE_URL="https://service-box-35.ru";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.defer=true; g.async=true;
            s.parentNode.insertBefore(g,s);
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: 'dPQfRWS8ASmV5yq6tZkAPubu',
                baseUrl: BASE_URL
              });

              // Ждем инициализации Shadow DOM и скрываем футер с логотипом
              var checkInterval = setInterval(function() {
                var widget = document.querySelector('[class*="woot-widget"]') || document.querySelector('#chatwoot');
                if (widget && widget.shadowRoot && !widget.shadowRoot.querySelector('#cw-brand-hide')) {
                  var style = d.createElement('style');
                  style.id = 'cw-brand-hide';
                  style.textContent = "div[class*='justify-center']:has(img[class*='max-w-3']), div.px-0.py-3.flex.justify-center { display: none !important; height: 0 !important; padding: 0 !important; margin: 0 !important; }";
                  widget.shadowRoot.appendChild(style);
                  clearInterval(checkInterval);
                }
              }, 500);
              setTimeout(function() { clearInterval(checkInterval); }, 10000);
            }
          })(document,"script");`}
        </Script>
      </body>
    </html>
  );
}