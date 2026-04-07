// app/robots.js
export default function robots() {
  const baseUrl = 'https://servicebox35.ru';
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/ai/', '/services/', '/prices', '/contacts'],
      disallow: ['/admin', '/private', '/cart/checkout', '/dashboard', '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}