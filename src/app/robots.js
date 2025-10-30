// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/parts',
          '/services',
          '/gallery',
          '/news',
          '/promotions-page',
          '/depository-public'
        ],
        disallow: [
          '/admin-panel',
          '/api/',
          '/private/',
          '/cart/checkout',
          '/user/',
          '/dashboard/'
        ],
      },
    ],
    sitemap: 'https://service-box-35.ru/sitemap.xml',
  };
}