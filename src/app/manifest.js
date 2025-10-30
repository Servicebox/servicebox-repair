// app/manifest.js
export default function manifest() {
  return {
    name: 'ServiceBox - Ремонт техники в Вологде',
    short_name: 'ServiceBox',
    description: 'Профессиональный ремонт ноутбуков, телефонов и другой техники в Вологде',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['technology', 'business'],
    lang: 'ru',
    scope: '/',
  };
}