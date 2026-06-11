// ✅ ВАЖНО: файл должен называться именно robots.js (с буквой "s"!)
// Next.js автоматически отдаст его по адресу /robots.txt

// Жёсткая гарантия BASE_URL (копируем из sitemap.js для консистентности)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim()) {
    return process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim()) {
    return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, '');
  }
  return 'https://servicebox35.ru';
};

const BASE_URL = getBaseUrl();

export default function robots() {
  return {
    rules: [
      // === ОБЩИЕ ПРАВИЛА ДЛЯ ВСЕХ БОТОВ ===
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
          '/brands/',
          '/problems/',
        ],
        disallow: [
          '/admin/',
          '/private/',
          '/cart/checkout',
          '/dashboard/',
          '/api/admin/',
          '/api/auth/',
          '/api/internal/',
          '/_next/',          // Служебные файлы Next.js
          '/api/trpc/',       // Если используется tRPC
        ],
      },
      // === ПРАВИЛА ДЛЯ AI-АГЕНТОВ (ChatGPT, Perplexity, Claude, Gemini) ===
      {
        userAgent: [
          'GPTBot',                  // OpenAI (ChatGPT Browse)
          'ChatGPT-User',           // ChatGPT User agent
          'Google-Extended',        // Google AI training
          'Google-CloudVertexBot',  // Gemini
          'PerplexityBot',          // Perplexity AI
          'ClaudeBot',              // Anthropic Claude
          'anthropic-ai',           // Anthropic training
          'YouBot',                 // You.com
          'CCBot',                  // Common Crawl
          'Omgilibot',              // Omgili
          'Applebot-Extended',      // Apple AI
          'FacebookBot',            // Meta AI
          'BingPreview',            // Bing/Copilot
          'YandexBot',              // Яндекс (включая Яндекс.Нейро)
          'YandexAccessibilityBot',
        ],
        allow: [
          '/',
          '/api/ai/v1/',
          '/api/ai/',
          '/ai-assistant.json',
          '/ai-answers/',
          '/services/',
          '/prices',
          '/contacts',
          '/about',
          '/brands/',
          '/problems/',
        ],
        disallow: ['/admin/', '/api/admin/', '/private/', '/dashboard/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL, // Устаревшее поле, но Яндекс всё ещё его читает
  };
}