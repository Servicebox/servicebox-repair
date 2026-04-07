// app/sitemap.js

const createSitemapEntry = ({ url, lastModified, changeFrequency, priority, aiMetadata = {} }) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    console.warn('⚠️ Invalid URL in sitemap entry:', url);
    return null;
  }

  const formatDate = (date) => {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const normalizedPriority = typeof priority === 'number'
    ? Math.max(0, Math.min(1, priority))
    : 0.5;

  const entry = {
    loc: url,
    lastmod: formatDate(lastModified),
    changefreq: changeFrequency || 'monthly',
    priority: normalizedPriority,
  };

  if (aiMetadata.pageType) entry['x-ai:type'] = aiMetadata.pageType;
  if (aiMetadata.contentFocus) entry['x-ai:focus'] = aiMetadata.contentFocus;
  if (Array.isArray(aiMetadata.primaryKeywords) && aiMetadata.primaryKeywords.length > 0) {
    entry['x-ai:keywords'] = aiMetadata.primaryKeywords.slice(0, 5).join(', ');
  }
  if (aiMetadata.contentSummary) entry['x-ai:summary'] = aiMetadata.contentSummary.substring(0, 200);

  entry['x-business:city'] = 'Вологда';
  entry['x-business:region'] = 'Вологодская область';
  entry['x-business:category'] = 'electronics_repair_service';
  entry['x-business:language'] = 'ru';

  if (aiMetadata.article) {
    entry['x-article:title'] = aiMetadata.article.title?.substring(0, 100);
    entry['x-article:published'] = aiMetadata.article.publishedAt;
    entry['x-article:updated'] = aiMetadata.article.updatedAt;
    entry['x-article:has-image'] = aiMetadata.article.hasImage ? 'true' : 'false';
  }

  return entry;
};

export default async function sitemap() {
  const baseUrl = 'https://servicebox35.ru';
  const currentDate = new Date();

  // Статические страницы
  const staticPages = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contacts`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/parts`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/prices`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/gallery`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/promotions-page`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/depository-public`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/tracking`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/worksteps`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
  ];

  // AI API эндпоинты
  const apiPages = [
    { url: `${baseUrl}/api/ai/v1/business`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/api/ai/v1/emergency`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
  ];

  let servicePages = [];
  let productPages = [];
  let newsEntries = [];

  // Услуги (только активные, не категории)
  try {
    const res = await fetch(`${baseUrl}/api/services/all`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        servicePages = data.data
          .filter(service => service.isCategory === false && service.slug && service.isActive !== false)
          .map(service => ({
            url: `${baseUrl}/services/${encodeURIComponent(service.slug)}`,
            lastModified: new Date(service.updatedAt || currentDate),
            changeFrequency: 'monthly',
            priority: 0.7,
          }));
      }
    }
  } catch (error) {
    console.warn('Error fetching services for sitemap:', error.message);
  }

  // Товары
  try {
    const res = await fetch(`${baseUrl}/api/products?limit=1000`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        productPages = data.products
          .filter(product => product.slug)
          .map(product => ({
            url: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
            lastModified: new Date(product.updatedAt || currentDate),
            changeFrequency: 'weekly',
            priority: 0.8,
          }));
      }
    }
  } catch (error) {
    console.warn('Error fetching products for sitemap:', error.message);
  }

  // Новости (только опубликованные)
  try {
    const res = await fetch(`${baseUrl}/api/news?all=1&limit=500`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        newsEntries = data.data
          .filter(news => news.isPublished === true && news.slug)
          .map(news => ({
            url: `${baseUrl}/news/${encodeURIComponent(news.slug)}`,
            lastModified: new Date(news.updatedAt || news.publishedAt || currentDate),
            changeFrequency: 'monthly',
            priority: 0.7,
          }));
      }
    }
  } catch (error) {
    console.warn('Error fetching news for sitemap:', error.message);
  }

  // Объединяем все страницы (без serviceCategoryPages)
  const allPages = [
    ...staticPages,
    ...apiPages,
    ...servicePages,
    ...productPages,
    ...newsEntries,
  ];

  // Удаление дубликатов
  const uniqueMap = new Map();
  for (const page of allPages) {
    if (!uniqueMap.has(page.url)) {
      uniqueMap.set(page.url, page);
    }
  }
  const uniquePages = Array.from(uniqueMap.values());

  uniquePages.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  console.log(`✅ Sitemap generated: ${uniquePages.length} URLs (services: ${servicePages.length}, products: ${productPages.length}, news: ${newsEntries.length})`);

  return uniquePages.slice(0, 50000);
}