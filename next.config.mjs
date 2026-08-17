import withBundleAnalyzer from '@next/bundle-analyzer';
import slugMigrationPlan from './src/data/slug-migration-plan.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация для продакшена
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      '@fortawesome/react-fontawesome',
      'framer-motion',
      'gsap',
      'axios',
      'lodash',
      'date-fns'
    ],
    scrollRestoration: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 750, 780, 828, 1040, 1080, 1200],
    imageSizes: [25, 50, 75, 85, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    qualities: [65, 70, 75, 80, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'servicebox35.ru',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Оставляем ошибки и предупреждения
    } : false,
  },

  compress: true,
  poweredByHeader: false,
  staticPageGenerationTimeout: 120,

  // Улучшенное кэширование
  httpAgentOptions: {
    keepAlive: true,
  },

  // Редиректы для мёртвых/переименованных URL, попавших в индексацию Яндекса и Google
  async redirects() {
    return [
      {
        // /prices/page.js опустел после отката, реальная страница цен — /price
        source: '/prices',
        destination: '/price',
        permanent: true,
      },
      {
        // /worksteps никогда не было отдельной страницей — это секция на главной (Main.js)
        source: '/worksteps',
        destination: '/',
        permanent: true,
      },
      {
        // /service/page.js — весь файл закомментирован (JSX-комментарий на
        // верхнем уровне модуля), нет default export → 500 на проде.
        // Реальная страница услуг — /services (обнаружено при разборе SEO-аудита).
        source: '/service',
        destination: '/services',
        permanent: true,
      },
      {
        // /useprofile/page.js — пустой файл (0 байт), нет default export → 500.
        // Ничего в кодовой базе на него не ссылается; реальный ЛК — /profile.
        source: '/useprofile',
        destination: '/profile',
        permanent: true,
      },
      {
        // /shop — мёртвая заглушка, замененная каталогом /parts
        source: '/shop',
        destination: '/parts',
        permanent: true,
      },
      {
        // /shop/[productSlug] — старая карточка товара без своих meta-тегов
        // (наследовала общий title/description от /shop/layout.js на все
        // товары разом — источник дублей в SEO-аудите). Актуальная карточка
        // товара с уникальными meta-тегами — /product/[slug].
        source: '/shop/:slug',
        destination: '/product/:slug',
        permanent: true,
      },
      // Редиректы со старых кириллических slug'ов услуг на новые латинские
      // (миграция см. src/data/slug-migration-plan.json и scripts/migrate-service-slugs.mjs)
      // Next.js матчит source по RAW (percent-encoded) пути запроса, поэтому кодируем явно;
      // дублируем и «сырой» кириллический вариант на случай иного поведения у прокси/версии Next.
      ...slugMigrationPlan.flatMap(({ oldSlug, newSlug }) => ([
        {
          source: `/services/${encodeURIComponent(oldSlug)}`,
          destination: `/services/${newSlug}`,
          permanent: true,
        },
        {
          source: `/services/${oldSlug}`,
          destination: `/services/${newSlug}`,
          permanent: true,
        },
      ])),
    ];
  },

  // CSP-заголовки для Yandex Pay WebSDK, Yandex Metrika (+ Вебвизор), GTM.
  // Единственное место, где задаётся CSP — раньше та же политика ЕЩЁ РАЗ
  // задавалась в nginx (add_header Content-Security-Policy), и два набора
  // разъехались: nginx-версия не пускала Yandex Pay и сужала img-src/font-src
  // (без blob:/data:), версия отсюда не пускала домены Вебвизора
  // (mc.webvisor.com/org, включён через webvisor:true в YandexMetrika.js) и
  // *.google-analytics.com. Браузер требует соответствия ОБОИМ заголовкам
  // сразу (пересечение, не замена), так что реально применялась худшая
  // комбинация из двух. Убрано из nginx-конфига — эта версия ниже единственная.
  // service-box-35.ru снова в списке — не старый Chatwoot (тот правда выпилен),
  // а новый чат-виджет CRM (public/widget-loader.js + iframe /widget/[key]).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-inline' нужен для GTM inline-скрипта и JSON-LD в layout.js
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pay.yandex.ru https://www.googletagmanager.com https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.com https://mc.webvisor.org https://yastatic.net https://service-box-35.ru",
              "frame-src 'self' https://pay.yandex.ru https://www.googletagmanager.com https://yandex.ru https://mc.yandex.ru https://mc.yandex.com https://service-box-35.ru",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://pay.yandex.ru https://sandbox.pay.yandex.ru https://servicebox35.ru https://www.googletagmanager.com https://*.googletagmanager.com https://mc.yandex.ru wss://mc.yandex.ru https://yastatic.net https://yandex.ru https://*.google-analytics.com https://*.analytics.google.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "media-src 'self'",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

// Анализ бандла (опционально, запускается через ANALYZE=true npm run build)
const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({
    enabled: true,
    openAnalyzer: true,
  })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;