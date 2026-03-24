import withBundleAnalyzer from '@next/bundle-analyzer';

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
};

// Анализ бандла (опционально, запускается через ANALYZE=true npm run build)
const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({
    enabled: true,
    openAnalyzer: true,
  })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;