// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // === Сборка и отладка ===
  productionBrowserSourceMaps: false,

  // === Экспериментальные функции ===
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      '@fortawesome/react-fontawesome',
      'framer-motion',
      'gsap',
      'axios',
      'lodash',
      'date-fns',
    ],
    optimizeCss: true,
    scrollRestoration: true,
  },

  // === Оптимизация изображений ===
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 750, 780, 828, 1040, 1080, 1200],
    imageSizes: [25, 50, 75, 85, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    qualities: [85, 90],
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

  // === Компилятор ===
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // === Производительность ===
  compress: true,
  poweredByHeader: false,
  staticPageGenerationTimeout: 120,

  // === PWA: Заголовки для Service Worker и манифеста ===
  async headers() {
    return [
      {
        // Service Worker: не кэшировать, всегда проверять обновления
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        // Манифест: правильный Content-Type
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        // Иконки: долгий кэш
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // === Редиректы (опционально) ===
  async redirects() {
    return [
      // Пример: редирект со старого чата на новый
      // {
      //   source: '/old-chat',
      //   destination: '/chat-admin',
      //   permanent: true,
      // },
    ];
  },

  // === Rewrites (опционально) ===
  async rewrites() {
    return [
      // Пример: проксирование внешних API
      {
        source: '/api/socketio/:path*',
        destination: 'https://servicebox35.ru/api/socketio/:path*',
      },
    ];
  },
};

// === Интеграция с @next/bundle-analyzer ===
const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({
    enabled: true,
    openAnalyzer: true,
  })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;