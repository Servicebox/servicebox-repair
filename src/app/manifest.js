// app/manifest.js
export default function manifest() {
  return {
    name: 'СЕРВИС БОКС - Ремонт техники в Вологде',
    short_name: 'СЕРВИС БОКС',
    description: 'Профессиональный ремонт ноутбуков, телефонов и другой техники в Вологде',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a1929',
    theme_color: '#0a1929',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['technology', 'business'],
    lang: 'ru',
    scope: '/',
  };
}