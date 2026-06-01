// app/robots.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/ai/',
          '/services/',
          '/prices',
          '/contacts',
          '/news/',
          '/about',
          '/parts',
          '/gallery',
          '/promotions-page',
          '/tracking',
          '/worksteps',
          '/ai-assistant.json',
          '/ai-answers/',
        ],
        disallow: [
          '/admin/',
          '/private/',
          '/cart/checkout',
          '/dashboard/',
          '/api/admin/',
          '/api/auth/',
          '/api/internal/',
        ],
      },
      {
        userAgent: [
          'Google-Extended',
          'GPTBot',
          'CCBot',
          'Omgilibot',
          'FacebookBot',
          'YandexAccessibilityBot',
          'BingPreview',
          'Applebot-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'YouBot',
        ],
        allow: [
          '/api/ai/v1/',
          '/api/ai/',
          '/ai-assistant.json',
          '/ai-answers/',
          '/sitemap.xml',
          '/',
        ],
        disallow: ['/admin/', '/api/admin/', '/private/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}