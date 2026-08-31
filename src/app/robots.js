import { BASE_URL } from '@/lib/constants';

export default function robots() {

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', '/api/ai/', '/services/', '/price', '/contacts',
          '/news/', '/about', '/parts', '/gallery', '/promotions-page',
          '/tracking', '/ai-assistant.json', '/ai-answers/',
          '/brands/', '/problems/'
        ],
        disallow: [
          '/admin-panel/', '/private/', '/checkout', '/cart',
          '/api/admin/', '/api/auth/', '/api/internal/', '/_next/', '/api/trpc/',
          '/api/yml', '/api/services-yml', '/yml-check', '/services/yml'
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
          '/services/', '/price', '/contacts', '/about', '/brands/', '/problems/',
          '/gallery/', '/images/', '/photos/', '/og-image.jpg', '/favicon.webp'
        ],
        disallow: [
          '/admin-panel/', '/api/admin/', '/private/', '/checkout', '/cart', '/_next/',
          '/api/auth/', '/api/internal/', '/api/yml', '/api/services-yml',
          '/yml-check', '/services/yml'
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}