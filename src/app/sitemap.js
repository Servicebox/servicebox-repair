// app/sitemap.js
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import News from '@/models/News';
import Service from '@/models/Service';
import { BASE_URL } from '@/lib/constants';
import { PROBLEMS } from '@/lib/problems-data';
import { ANSWERS } from '@/lib/ai-answers-data';

const BRAND_SLUGS = ['apple', 'samsung', 'xiaomi', 'huawei', 'asus', 'lenovo', 'hp', 'acer', 'msi', 'dell', 'sony', 'lg'];
const PROBLEM_SLUGS = Object.keys(PROBLEMS);
const AI_ANSWER_SLUGS = Object.keys(ANSWERS);

export default async function sitemap() {

  const createEntry = (path, priority, changeFrequency = 'monthly', lastmod) => ({
    url: `${BASE_URL}${path}`,
    lastModified: lastmod ? new Date(lastmod) : undefined,
    changeFrequency,
    priority: Math.min(1, Math.max(0, priority || 0.5)),
  });

  const staticUrls = [
    ['/', 1.0, 'daily'],
    ['/contacts', 0.9, 'monthly'],
    ['/services', 0.95, 'daily'],
    ['/price', 0.9, 'weekly'],
    ['/parts', 0.9, 'daily'],
    ['/about', 0.8, 'monthly'],
    ['/news', 0.8, 'weekly'],
    ['/promotions-page', 0.85, 'weekly'],
    ['/gallery', 0.7, 'monthly'],
    ['/depository-public', 0.6, 'weekly'],
    ['/tracking', 0.7, 'daily'],
    ['/consent', 0.1, 'yearly'],
    ['/privacy-policy', 0.1, 'yearly'],
  ].map(([p, pri, freq]) => createEntry(p, pri, freq));

  const aiApiUrls = [
    ['/api/ai/v1/business', 0.8, 'weekly'],
    ['/api/ai/v1/emergency', 0.6, 'monthly'],
    ['/ai-assistant.json', 0.95, 'weekly'],
  ].map(([p, pri, freq]) => createEntry(p, pri, freq));

  const brandUrls = BRAND_SLUGS.map(s => createEntry(`/brands/${s}`, 0.85, 'weekly'));
  const problemUrls = PROBLEM_SLUGS.map(s => createEntry(`/problems/${s}`, 0.85, 'weekly'));
  const aiAnswerUrls = AI_ANSWER_SLUGS.map(s => createEntry(`/ai-answers/${s}`, 0.95, 'weekly'));

  let dbUrls = [];
  try {
    await dbConnect();
    const [services, products, news] = await Promise.all([
      Service.find({ isActive: { $ne: false }, isCategory: false }, { slug: 1, updatedAt: 1 }).lean(),
      Product.find({ isActive: true, isDeleted: false }, { slug: 1, updatedAt: 1 }).limit(500).lean(),
      News.find({ isPublished: true }, { slug: 1, updatedAt: 1, publishedAt: 1 }).limit(200).lean(),
    ]);

    dbUrls = [
      ...services.filter(s => s.slug).map(s => createEntry(`/services/${encodeURIComponent(s.slug)}`, 0.85, 'monthly', s.updatedAt)),
      ...products.filter(p => p.slug).map(p => createEntry(`/product/${encodeURIComponent(p.slug)}`, 0.75, 'weekly', p.updatedAt)),
      ...news.filter(n => n.slug).map(n => createEntry(`/news/${encodeURIComponent(n.slug)}`, 0.7, 'monthly', n.updatedAt || n.publishedAt)),
    ];
  } catch (error) {
    console.warn('⚠️ [Sitemap] DB fetch skipped:', error.message);
  }

  const allEntries = [...staticUrls, ...aiApiUrls, ...aiAnswerUrls, ...brandUrls, ...problemUrls, ...dbUrls]
    .filter(entry => entry.url.startsWith('http'));

  const uniqueMap = new Map();
  for (const entry of allEntries) {
    const existing = uniqueMap.get(entry.url);
    if (!existing || entry.priority > existing.priority) {
      uniqueMap.set(entry.url, entry);
    }
  }
  const uniqueUrls = Array.from(uniqueMap.values());
  uniqueUrls.sort((a, b) => b.priority - a.priority);

  console.log(`✅ Sitemap generated: ${uniqueUrls.length} URLs | Base: ${BASE_URL}`);
  return uniqueUrls;
}