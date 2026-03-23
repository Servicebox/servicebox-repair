// app/robots.js
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
  return {
    rules: {
      userAgent: '*', // Правило для всех ботов
      allow: ['/', '/api/ai/', '/services/', '/prices', '/contacts'], // Явно разрешаем API
      disallow: ['/admin', '/private', '/cart/checkout', '/dashboard'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}