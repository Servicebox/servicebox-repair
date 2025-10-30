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
import YandexMetrika from '../components/YandexMetrika';
import GoogleAnalytics from '../components/GoogleAnalytics';

config.autoAddCss = false;

export const metadata = {
  title: {
    default: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    template: '%s | ServiceBox Вологда'
  },
  description: 'Профессиональный ремонт ноутбуков, чистка, замена видеокарт, ремонт телефонов, телевизоров, Apple техники, переклейка стекол. Два сервисных центра в Вологде. Гарантия 90 дней.',
  keywords: 'ремонт ноутбуков Вологда, чистка ноутбуков, ремонт видеокарт, ремонт телефонов Вологда, ремонт Apple, переклейка стекла, ремонт телевизоров, игровые приставки, сервисный центр Вологда, ServiceBox',
  authors: [{ name: 'ServiceBox Вологда' }],
  metadataBase: new URL('https://service-box-35.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ремонт ноутбуков и телефонов в Вологде | ServiceBox',
    description: 'Профессиональный ремонт техники в Вологде. Два сервисных центра. Гарантия качества.',
    url: 'https://service-box-35.ru',
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    yandex: '104985183', // Код верификации Яндекс.Вебмастер
    google: 'G-MZ24DLXSSM', // Код верификации Google Search Console
  }
}

// Структурированные данные для двух филиалов
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "ServiceBox - Сервисный центр на Ленина",
      "description": "Сервисный центр по ремонту ноутбуков, телефонов, компьютеров и другой техники в Вологде",
      "url": "https://service-box-35.ru",
      "telephone": "+7-911-501-06-96",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Ленина, д. 6",
        "addressLocality": "Вологда",
        "postalCode": "160000",
        "addressCountry": "RU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 59.218183,
        "longitude": 39.888497
      },
      "openingHours": ["Mo-Fr 10:00-18:00"],
      "priceRange": "₽₽",
      "serviceType": [
        "Ремонт ноутбуков",
        "Чистка ноутбуков", 
        "Ремонт видеокарт",
        "Ремонт телефонов",
        "Ремонт телевизоров",
        "Ремонт Apple техники",
        "Переклейка стекла дисплея",
        "Ремонт игровых приставок"
      ]
    },
    {
      "@type": "LocalBusiness",
      "name": "ServiceBox - Сервисный центр на Северной",
      "description": "Сервисный центр по ремонту цифровой и компьютерной техники в Вологде",
      "url": "https://service-box-35.ru",
      "telephone": "+7-911-501-88-28",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Северная, д. 7А, офис 405",
        "addressLocality": "Вологда",
        "postalCode": "160000",
        "addressCountry": "RU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 59.229445,
        "longitude": 39.878542
      },
      "openingHours": ["Mo-Fr 10:00-19:00"],
      "priceRange": "₽₽",
      "serviceType": [
        "Ремонт ноутбуков",
        "Чистка ноутбуков",
        "Ремонт видеокарт",
        "Ремонт телефонов",
        "Ремонт телевизоров",
        "Ремонт Apple техники",
        "Переклейка стекла дисплея",
        "Ремонт игровых приставок"
      ]
    }
  ]
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* Основные мета-теги */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Гео-метатеги для Вологды */}
        <meta name="geo.region" content="RU-VLG" />
        <meta name="geo.placename" content="Вологда" />
        <meta name="geo.position" content="59.218183;39.888497" />
        <meta name="ICBM" content="59.218183, 39.888497" />
        
        {/* Мета-теги верификации */}
        <meta name="yandex-verification" content="104985183" />
        <meta name="google-site-verification" content="G-MZ24DLXSSM" />
        
        {/* Структурированные данные */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <AuthProvider>
          <ShopContextProvider>
            <div className="">
              <Header />
              <BubbleBackground />
              <div className="page__wrapper">
                <div className="nav"></div>
                
                <main itemScope itemType="https://schema.org/Service">
                  {children}
                </main>
                
                <CookieConsent />
                <Chat />
                <Footer />
              </div>
            </div>
          </ShopContextProvider>
        </AuthProvider>

        {/* Компоненты аналитики */}
        <YandexMetrika />
        <GoogleAnalytics />
      </body>
    </html>
  );
}