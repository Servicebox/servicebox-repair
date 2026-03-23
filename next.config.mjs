// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // === Основные настройки ===
  output: 'standalone',
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,

  // === Игнорируем ошибки при сборке ===
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // === Экспериментальные оптимизации ===
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

  // === Оптимизация изображений ===
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'servicebox35.ru',
        pathname: '/**',
      },
    ],
  },

  // === Удаляем console.log в production ===
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // === Оптимизация сборки ===
  staticPageGenerationTimeout: 180,

  httpAgentOptions: {
    keepAlive: true,
  },

  // === Кэширование ===
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 час
    pagesBufferLength: 5,
  },
};

// Анализ бандла
const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({
    enabled: true,
    openAnalyzer: true,
  })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;