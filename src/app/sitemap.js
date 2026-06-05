export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Жёсткая гарантия BASE_URL
const getBaseUrl = () => {
  if (process.env.SITE_URL && process.env.SITE_URL.trim()) {
    return process.env.SITE_URL.trim().replace(/\/$/, '');
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

const safeFetch = async (url) => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    clearTimeout(t);
    return res.ok ? await res.json() : null;
  } catch (e) {
    console.warn(`⚠️ Sitemap fetch failed: ${url}`);
    return null;
  }
};

// === СПИСКИ СЛАГОВ ===
const brandSlugs = [
  'apple', 'samsung', 'xiaomi', 'huawei', 'asus', 'lenovo',
  'hp', 'acer', 'msi', 'dell', 'sony', 'lg'
];

const problemSlugs = [
  'laptop-not-turning-on',
  'phone-battery-drains-fast',
  'screen-artifacts',
  'laptop-overheating',
  'phone-charging-issue',
  'water-damage',
];

// ✅ ВСЕ 8 AI-ответов
const aiAnswerSlugs = [
  'repair-laptop-vologda',
  'phone-screen-replacement',
  'videocard-repair-cost',
  'water-damage-phone',
  'apple-repair-warranty',
  'laptop-not-turning-on',
  'price-diagnostics',
  'urgent-repair-vologda',
];

export default async function sitemap() {
  const now = new Date();

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
  ].map(([p, pri, f]) => createEntry(p, pri, f, now));

  // === AI API ЭНДПОИНТЫ ===
  const apiUrls = [
    ['/api/ai/v1/business', 0.8, 'weekly'],
    ['/api/ai/v1/emergency', 0.6, 'monthly'],
  ].map(([p, pri, f]) => createEntry(p, pri, f, now));

  // === СТРАНИЦЫ БРЕНДОВ ===
  const brandUrls = brandSlugs.map(slug =>
    createEntry(`/brands/${slug}`, 0.85, 'weekly', now)
  );

  // === СТРАНИЦЫ НЕИСПРАВНОСТЕЙ ===
  const problemUrls = problemSlugs.map(slug =>
    createEntry(`/problems/${slug}`, 0.85, 'weekly', now)
  );

  // === AI-ANSWERS (ВСЕ 8) ===
  const aiAnswers = aiAnswerSlugs.map(s =>
    createEntry(`/ai-answers/${s}`, 0.95, 'weekly', now) // ✅ Повышенный приоритет
  );

  // === ДИНАМИЧЕСКИЕ ===
  const [svc, prod, news] = await Promise.all([
    safeFetch(`${BASE_URL}/api/services/all`),
    safeFetch(`${BASE_URL}/api/products?limit=500`),
    safeFetch(`${BASE_URL}/api/news?all=1&limit=200`),
  ]);

  const svcUrls = (svc?.success && Array.isArray(svc.data))
    ? svc.data
      .filter(s => s.slug && !s.isCategory && s.isActive !== false)
      .map(s => createEntry(
        `/services/${encodeURIComponent(s.slug)}`,
        0.85,
        'monthly',
        s.updatedAt
      ))
    : [];

  const prodUrls = (prod?.products && Array.isArray(prod.products))
    ? prod.products
      .filter(p => p.slug)
      .map(p => createEntry(
        `/product/${encodeURIComponent(p.slug)}`,
        0.75,
        'weekly',
        p.updatedAt
      ))
    : [];

  const newsUrls = (news?.success && Array.isArray(news.data))
    ? news.data
      .filter(n => n.slug && n.isPublished)
      .map(n => createEntry(
        `/news/${encodeURIComponent(n.slug)}`,
        0.7,
        'monthly',
        n.updatedAt || n.publishedAt
      ))
    : [];

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

  // Сортировка по приоритету
  unique.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  console.log(`✅ Sitemap: ${unique.length} URLs | BASE="${BASE_URL}"`);
  console.log(`   ├─ Static:     ${staticUrls.length}`);
  console.log(`   ├─ API:        ${apiUrls.length}`);
  console.log(`   ├─ AI Answers: ${aiAnswers.length}`);
  console.log(`   ├─ Brands:     ${brandUrls.length}`);
  console.log(`   ├─ Problems:   ${problemUrls.length}`);
  console.log(`   ├─ Services:   ${svcUrls.length}`);
  console.log(`   ├─ Products:   ${prodUrls.length}`);
  console.log(`   └─ News:       ${newsUrls.length}`);

  return unique;
}