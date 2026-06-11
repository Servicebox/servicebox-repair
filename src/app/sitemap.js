// app/sitemap.js
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import News from '@/models/News';
import Service from '@/models/Service';

// Жёсткая гарантия BASE_URL для продакшена
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
console.log(`🗺️ [sitemap] BASE_URL="${BASE_URL}"`);

const formatDate = (date) => {
  if (!date) return new Date().toISOString();
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const createEntry = (path, priority, changefreq = 'monthly', lastmod) => ({
  url: `${BASE_URL}${path}`,
  lastModified: formatDate(lastmod || new Date()),
  changeFrequency: changefreq,
  priority: Math.max(0, Math.min(1, priority || 0.5)),
});

// === СПИСКИ СЛАГОВ (Статические массивы) ===
const brandSlugs = ['apple', 'samsung', 'xiaomi', 'huawei', 'asus', 'lenovo', 'hp', 'acer', 'msi', 'dell', 'sony', 'lg'];
const problemSlugs = ['laptop-not-turning-on', 'phone-battery-drains-fast', 'screen-artifacts', 'laptop-overheating', 'phone-charging-issue', 'water-damage'];
const aiAnswerSlugs = ['repair-laptop-vologda', 'phone-screen-replacement', 'videocard-repair-cost', 'water-damage-phone', 'apple-repair-warranty', 'laptop-not-turning-on', 'price-diagnostics', 'urgent-repair-vologda'];

export default async function sitemap() {
  const now = new Date();

  // 1. Подключаемся к БД напрямую (без HTTP fetch!)
  let dbConnected = false;
  try {
    await dbConnect();
    dbConnected = true;
  } catch (e) {
    console.error('❌ [Sitemap] MongoDB connection failed:', e.message);
  }

  // === СТАТИЧЕСКИЕ СТРАНИЦЫ ===
  const staticUrls = [
    ['/', 1.0, 'daily'],
    ['/about', 0.8, 'monthly'],
    ['/contacts', 0.9, 'monthly'],
    ['/parts', 0.9, 'daily'],
    ['/services', 0.95, 'daily'],
    ['/prices', 0.9, 'weekly'],
    ['/gallery', 0.7, 'monthly'],
    ['/news', 0.8, 'weekly'],
    ['/promotions-page', 0.85, 'weekly'],
    ['/depository-public', 0.6, 'weekly'],
    ['/tracking', 0.7, 'daily'],
    ['/worksteps', 0.85, 'monthly'],
    ['/ai-assistant.json', 0.95, 'weekly'],
    ['/consent', 0.1, 'yearly'],
    ['/privacy-policy', 0.1, 'yearly'],
  ].map(([p, pri, f]) => createEntry(p, pri, f, now));

  // === AI API ЭНДПОИНТЫ ===
  const apiUrls = [
    ['/api/ai/v1/business', 0.8, 'weekly'],
    ['/api/ai/v1/emergency', 0.6, 'monthly'],
  ].map(([p, pri, f]) => createEntry(p, pri, f, now));

  // === СТРАНИЦЫ БРЕНДОВ, ПРОБЛЕМ, AI-ОТВЕТОВ ===
  const brandUrls = brandSlugs.map(slug => createEntry(`/brands/${slug}`, 0.85, 'weekly', now));
  const problemUrls = problemSlugs.map(slug => createEntry(`/problems/${slug}`, 0.85, 'weekly', now));
  const aiAnswers = aiAnswerSlugs.map(s => createEntry(`/ai-answers/${s}`, 0.95, 'weekly', now));

  // === ДИНАМИЧЕСКИЕ СТРАНИЦЫ (ПРЯМОЙ ЗАПРОС В БД) ===
  let svcUrls = [];
  let prodUrls = [];
  let newsUrls = [];

  if (dbConnected) {
    // Услуги
    try {
      const services = await Service.find({ isActive: { $ne: false }, isCategory: { $ne: true } }, { slug: 1, updatedAt: 1 }).lean();
      svcUrls = services
        .filter(s => s.slug)
        .map(s => createEntry(`/services/${encodeURIComponent(s.slug)}`, 0.85, 'monthly', s.updatedAt));
    } catch (e) { console.warn('⚠️ Sitemap Services fetch failed:', e.message); }

    // Товары
    try {
      const products = await Product.find({ isActive: true, isDeleted: false }, { slug: 1, updatedAt: 1 }).limit(500).lean();
      prodUrls = products
        .filter(p => p.slug)
        .map(p => createEntry(`/product/${encodeURIComponent(p.slug)}`, 0.75, 'weekly', p.updatedAt));
    } catch (e) { console.warn('⚠️ Sitemap Products fetch failed:', e.message); }

    // Новости
    try {
      const news = await News.find({ isPublished: true }, { slug: 1, updatedAt: 1, publishedAt: 1 }).limit(200).lean();
      newsUrls = news
        .filter(n => n.slug)
        .map(n => createEntry(`/news/${encodeURIComponent(n.slug)}`, 0.7, 'monthly', n.updatedAt || n.publishedAt));
    } catch (e) { console.warn('⚠️ Sitemap News fetch failed:', e.message); }
  }

  // === ОБЪЕДИНЕНИЕ ВСЕХ СТРАНИЦ ===
  const all = [
    ...staticUrls,
    ...apiUrls,
    ...aiAnswers,
    ...brandUrls,
    ...problemUrls,
    ...svcUrls,
    ...prodUrls,
    ...newsUrls,
  ].filter(e => e?.url?.startsWith('http'));

  // Уникальность по URL
  const unique = Array.from(new Map(all.map(e => [e.url, e])).values());
  unique.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  console.log(`✅ Sitemap: ${unique.length} URLs | BASE="${BASE_URL}"`);
  console.log(`   ├─ Static:     ${staticUrls.length}`);
  console.log(`   ├─ AI Answers: ${aiAnswers.length}`);
  console.log(`   ├─ Brands:     ${brandUrls.length}`);
  console.log(`   ├─ Problems:   ${problemUrls.length}`);
  console.log(`   ├─ Services:   ${svcUrls.length}`);
  console.log(`   ├─ Products:   ${prodUrls.length}`);
  console.log(`   └─ News:       ${newsUrls.length}`);

  return unique;
}