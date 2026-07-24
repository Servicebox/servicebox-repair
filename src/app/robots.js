import { BASE_URL } from '@/lib/constants';

export default function robots() {

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', '/api/ai/', '/services/', '/prices', '/contacts',
          '/news/', '/about', '/parts', '/gallery', '/promotions-page',
          '/tracking', '/worksteps', '/ai-assistant.json', '/ai-answers/',
          '/brands/', '/problems/'
        ],
        disallow: [
          '/admin-panel/', '/private/', '/checkout', '/cart',
          '/api/admin/', '/api/auth/', '/api/internal/', '/_next/', '/api/trpc/'
        ],
      },
      {
        userAgent: [
          'GPTBot', 'ChatGPT-User', 'Google-Extended', 'Google-CloudVertexBot',
          'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'YouBot', 'CCBot',
          'Omgilibot', 'Applebot-Extended', 'FacebookBot', 'BingPreview'
        ],
        allow: [
          '/', '/api/ai/', '/ai-assistant.json', '/ai-answers/',
          '/services/', '/prices', '/contacts', '/about', '/brands/', '/problems/',
          '/gallery/', '/images/', '/photos/', '/og-image.jpg', '/favicon.webp'
        ],
        disallow: ['/admin-panel/', '/api/admin/', '/private/', '/checkout', '/cart', '/_next/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}