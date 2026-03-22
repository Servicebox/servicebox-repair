// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
 
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
    optimizeCss: true,
    scrollRestoration: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 750,780, 828, 1040, 1080, 1200],
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

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  compress: true,
  poweredByHeader: false,
  staticPageGenerationTimeout: 120,
};

const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({
      enabled: true,
      openAnalyzer: true,
    })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;