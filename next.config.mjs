/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Устаревшее свойство 'domains' удалено. Используйте только 'remotePatterns'.
        remotePatterns: [
            // Для разработки: локальный хост
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            // Для продакшена: ваш домен
            {
                protocol: 'https',
                hostname: 'service-box-35.ru',
                port: '',
                pathname: '/**',
            },
            // Добавьте сюда другие домены, если изображения загружаются из внешних источников
            // {
            //   protocol: 'https',
            //   hostname: 'example.com',
            //   port: '',
            //   pathname: '/**',
            // },
        ],
        // Настройка качеств изображений для устранения предупреждения
        qualities: [75, 85, 90, 95, 100],
    },
    webpack: (config, { isServer }) => {
        // Более надежная настройка для обработки Node.js модулей в браузере
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback, // сохраняем уже установленные фолбэки
                fs: false,
                // path: false, // раскомментируйте, если понадобится
                // os: false,  // раскомментируйте, если понадобится
            };
        }
        return config;
    },
};

export default nextConfig;