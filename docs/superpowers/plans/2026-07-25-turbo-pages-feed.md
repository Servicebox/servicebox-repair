# Turbo-страницы: RSS-фид (Этап 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `src/app/api/turbo-feed/route.js` — a dynamic RSS feed for Яндекс.Турбо covering all 123 services (including category pages like «Ремонт видеокарт») and all published news, with a native Turbo callback form (email-only delivery) in each service page.

**Architecture:** Single Next.js Route Handler, following the exact pattern already established in `src/app/api/services-yml/route.js` (string-concatenated XML, module-level in-memory cache with 5-minute TTL, per-item try/catch so one bad document doesn't break the whole feed). No new dependencies, no new DB fields, no new files beyond the one route.

**Tech Stack:** Next.js App Router Route Handler, Mongoose (`Service`, `News` models), plain string templating (no XML library — matches existing YML feed routes).

## Global Constraints

- No new npm dependencies.
- Next.js App Router `route.js` files only allow specific recognized exports (`GET`, `POST`, `dynamic`, `revalidate`, `runtime`, etc.) — an extra `export const` for a helper function makes the dev server silently fail to register/compile the route (plain 500 "Internal Server Error", no build error, no "Compiled" log line — this cost real debugging time before the cause was found). Tasks 1-2 export the helpers with `export const` ONLY so the ad-hoc `node --input-type=module` verification scripts can `import` them in isolation; Task 3's first step strips every `export` keyword from those helpers (keeping only `GET` and `dynamic` exported), matching the existing convention already used in `services-yml/route.js` (plain unexported `const escapeXml`).
- This repo's `package.json` has `"type": "module"` — every `.js` file is an ES module. Use `export const`/`export function`; CommonJS `module.exports`/`require()` do not work and fail silently/confusingly (verified: `require()` on such a file returns an object missing the expected properties, not a clean error).
- No automated test framework exists in this repo (confirmed: no `jest`/`vitest` in `package.json`, no `*.test.js` files anywhere). Testing here means: pure-function verification via ad-hoc `node --input-type=module -e` snippets using `import` (no `@/` import aliases involved, so plain Node can load the file directly), plus `curl` + XML-parse checks against the running dev server for the full route. This matches the established convention in this repo (see `docs/superpowers/plans/2026-07-24-public-offer.md` Task 5).
- Turbo callback form widget is **self-closing with zero child fields** — `<form data-type="callback" data-send-to="EMAIL"></form>`. Do not add `<input>` children; Turbo's renderer generates the full UI itself. (Verified against real source of `sokolnikov911/yandex-turbo-pages`, a maintained open-source Turbo RSS generator.)
- Callback form email destination: `s89062960353@yandex.ru` (confirmed by Tom 2026-07-25).
- RSS namespaces required on the root `<rss>` tag: `xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0"` (verified against real fixture output from `LightAir/turbo-rss`'s test suite).
- Video/YouTube news content blocks are NOT converted to Turbo markup in this stage — skip them, fall back to `excerpt` if they're the only content.
- Email-to-booking automation is explicitly out of scope for this plan (see spec's "Явно отложено на Этап 2").

Spec: `docs/superpowers/specs/2026-07-25-turbo-pages-feed-design.md`

---

### Task 1: XML/HTML escaping helpers + service item builder

**Files:**
- Create: `src/app/api/turbo-feed/route.js`

**Interfaces:**
- Produces: `escapeXml(text)`, `escapeHtml(text)`, `encodeUrlForXml(url)`, `wrapCdata(html)`, `buildServiceItem(service, baseUrl, formEmail)` — all consumed by Task 3's `GET` handler. `buildServiceItem` takes a plain lean Mongoose doc (`{ name, slug, description, price, metaTitle, updatedAt }`) and returns a complete `<item>` XML string.

This task writes ONLY plain functions with zero imports (no `@/lib/...`), so the file can be loaded directly with plain `node` for verification without needing Next.js's bundler to resolve path aliases. Task 3 adds the real imports and the `GET` handler on top.

- [ ] **Step 1: Write the helper functions and `buildServiceItem`**

```javascript
// app/api/turbo-feed/route.js
// Форма-заявка (data-type="callback") доставляет письма на email,
// а не через вебхук — см. docs/superpowers/specs/2026-07-25-turbo-pages-feed-design.md

export const escapeXml = (text) => {
  if (text === null || text === undefined || text === '') return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const encodeUrlForXml = (url) => encodeURI(url).replace(/&/g, '&amp;');

export const wrapCdata = (html) => `<![CDATA[${html.replace(/]]>/g, ']]&gt;')}]]>`;

export const buildServiceItem = (service, baseUrl, formEmail) => {
  const title = escapeXml(service.metaTitle || `${service.name} в Вологде`);
  const link = `${baseUrl}/services/${service.slug}`;
  const name = escapeHtml(service.name);
  const description = escapeHtml(service.description || '');
  const priceHtml = service.price
    ? `<p><strong>Стоимость:</strong> ${escapeHtml(String(service.price))}</p>`
    : '';
  const contentHtml =
    `<header><h1>${name}</h1></header>` +
    `<p>${description}</p>` +
    priceHtml +
    `<form data-type="callback" data-send-to="${formEmail}"></form>`;
  const pubDate = new Date(service.updatedAt || Date.now()).toUTCString();
  const encodedLink = encodeUrlForXml(link);

  return (
    `<item turbo="true">` +
    `<title>${title}</title>` +
    `<link>${encodedLink}</link>` +
    `<pubDate>${pubDate}</pubDate>` +
    `<guid>${encodedLink}</guid>` +
    `<turbo:content>${wrapCdata(contentHtml)}</turbo:content>` +
    `</item>`
  );
};

```

Note: this repo's `package.json` has `"type": "module"`, so every `.js` file is an ES module — use `export const`, never CommonJS `module.exports`/`require`. Task 3 later adds `export async function GET` to this same file alongside these exports.

- [ ] **Step 2: Verify manually with a throwaway Node script**

Run (note `--input-type=module` and `import`, not `require` — required because of `"type": "module"`):
```bash
node --input-type=module -e "
import { buildServiceItem } from './src/app/api/turbo-feed/route.js';
const item = buildServiceItem(
  { name: 'Замена стекла <тест>', slug: 'test-slug', description: 'Описание & проверка \"кавычек\"', price: '4500', updatedAt: new Date('2026-01-01') },
  'https://servicebox35.ru',
  's89062960353@yandex.ru'
);
console.log(item);
console.log('---');
console.log('Has escaped name tag:', item.includes('&lt;тест&gt;'));
console.log('Has form widget:', item.includes('data-type=\"callback\" data-send-to=\"s89062960353@yandex.ru\"'));
console.log('Has turbo attr:', item.includes('<item turbo=\"true\">'));
"
```

Expected output includes `Has escaped name tag: true`, `Has form widget: true`, `Has turbo attr: true`, and the printed `<item>` string is well-formed (visually check the `<turbo:content>` CDATA block contains literal `<header><h1>` tags, not escaped entities).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/turbo-feed/route.js
git commit -m "feat: add Turbo feed escaping helpers and service item builder"
```

---

### Task 2: News content-block-to-HTML mapper + news item builder

**Files:**
- Modify: `src/app/api/turbo-feed/route.js`

**Interfaces:**
- Consumes: `escapeHtml`, `encodeUrlForXml`, `wrapCdata` from Task 1 (same file, already in scope — no import needed).
- Produces: `buildContentBlocksHtml(blocks)`, `buildNewsItem(news, baseUrl)` — consumed by Task 3's `GET` handler. `buildNewsItem` takes a plain lean Mongoose doc (`{ title, slug, excerpt, contentBlocks, featuredImage, metaTitle, publishedAt, createdAt }`) and returns a complete `<item>` XML string.

- [ ] **Step 1: Add the content-block mapper and news item builder**

Add these functions to `src/app/api/turbo-feed/route.js`, after `buildServiceItem`:

```javascript
export const buildContentBlocksHtml = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((block) => {
      try {
        switch (block.type) {
          case 'heading':
            return `<h2>${escapeHtml(block.content)}</h2>`;
          case 'text':
            return `<p>${escapeHtml(block.content)}</p>`;
          case 'list': {
            const items = (block.content || '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => `<li>${escapeHtml(line)}</li>`)
              .join('');
            return items ? `<ul>${items}</ul>` : '';
          }
          case 'image':
            return block.media
              ? `<figure><img src="${encodeUrlForXml(block.media)}" alt="${escapeHtml(block.alt || '')}" /></figure>`
              : '';
          default:
            // 'video' / 'youtube' — не конвертируются на Этапе 1
            return '';
        }
      } catch (err) {
        console.error(`Ошибка обработки блока новости (type=${block.type}):`, err);
        return '';
      }
    })
    .filter(Boolean)
    .join('');
};

export const buildNewsItem = (news, baseUrl) => {
  const title = escapeXml(news.metaTitle || news.title);
  const link = `${baseUrl}/news/${news.slug}`;
  const bodyHtml =
    buildContentBlocksHtml(news.contentBlocks) || `<p>${escapeHtml(news.excerpt || '')}</p>`;
  const coverHtml = news.featuredImage
    ? `<figure><img src="${encodeUrlForXml(news.featuredImage)}" /></figure>`
    : '';
  const contentHtml = `<header>${coverHtml}<h1>${escapeHtml(news.title)}</h1></header>${bodyHtml}`;
  const pubDate = new Date(news.publishedAt || news.createdAt || Date.now()).toUTCString();
  const encodedLink = encodeUrlForXml(link);

  return (
    `<item turbo="true">` +
    `<title>${title}</title>` +
    `<link>${encodedLink}</link>` +
    `<pubDate>${pubDate}</pubDate>` +
    `<guid>${encodedLink}</guid>` +
    `<turbo:content>${wrapCdata(contentHtml)}</turbo:content>` +
    `</item>`
  );
};
```

- [ ] **Step 2: Verify manually**

Run (ESM, matching this repo's `"type": "module"` — see Task 1):
```bash
node --input-type=module -e "
import { buildNewsItem, buildContentBlocksHtml } from './src/app/api/turbo-feed/route.js';

const blocksHtml = buildContentBlocksHtml([
  { type: 'heading', content: 'Заголовок', position: 0 },
  { type: 'text', content: 'Абзац текста', position: 1 },
  { type: 'list', content: 'Пункт один\nПункт два', position: 2 },
  { type: 'video', content: 'ignored', position: 3 },
]);
console.log('blocksHtml:', blocksHtml);
console.log('Has h2:', blocksHtml.includes('<h2>Заголовок</h2>'));
console.log('Has list items:', blocksHtml.includes('<li>Пункт один</li>') && blocksHtml.includes('<li>Пункт два</li>'));
console.log('Video skipped:', !blocksHtml.includes('ignored'));

const item = buildNewsItem(
  { title: 'Новость', slug: 'novost-test', excerpt: 'Анонс', contentBlocks: [], publishedAt: new Date('2026-01-01') },
  'https://servicebox35.ru'
);
console.log('Fallback to excerpt:', item.includes('<p>Анонс</p>'));
"
```

Expected: all four boolean checks print `true`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/turbo-feed/route.js
git commit -m "feat: add Turbo feed news content-block mapper and item builder"
```

---

### Task 3: GET handler — wire up DB fetch, cache, and error handling

**Files:**
- Modify: `src/app/api/turbo-feed/route.js`

**Interfaces:**
- Consumes: `buildServiceItem`, `buildNewsItem` from Tasks 1-2 (same file). `dbConnect` (default export) from `@/lib/db`. `Service` (default export) from `@/models/Service`. `News` (default export) from `@/models/News`. `BASE_URL`, `BUSINESS`, `SEO_DEFAULTS` (named exports) from `@/lib/constants`.
- Produces: `GET(request)` — the Route Handler Next.js calls for `/api/turbo-feed`.

This step adds real imports at the top of the file and the `GET` handler at the bottom, turning the file into a proper Next.js Route Handler (the existing `export const` helpers from Tasks 1-2 stay as-is in the middle).

- [ ] **Step 1: Strip `export` from every helper, add imports at the top, and add the `GET` handler at the bottom**

First, remove the `export` keyword from every helper defined in Tasks 1-2 (`escapeXml`, `escapeHtml`, `encodeUrlForXml`, `wrapCdata`, `buildServiceItem`, `buildContentBlocksHtml`, `buildNewsItem`) — they become plain `const name = ...`, not `export const name = ...`. This is required (see Global Constraints) — leaving them exported makes the dev server 500 with no useful error message.

Then add these imports at the very top of `src/app/api/turbo-feed/route.js` (above the existing comment/`escapeXml` declaration):

```javascript
// app/api/turbo-feed/route.js
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import News from '@/models/News';
import { BASE_URL, BUSINESS, SEO_DEFAULTS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const FORM_EMAIL = 's89062960353@yandex.ru';

let cache = { data: null, timestamp: 0, ttl: 5 * 60 * 1000 };
```

At the very end of the file, add:

```javascript
const emptyFeedXml = (baseUrl) =>
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">` +
  `<channel><title>${escapeXml(BUSINESS.shortName)}</title><link>${baseUrl}</link><description>${escapeXml(SEO_DEFAULTS.description)}</description><language>ru</language></channel>` +
  `</rss>`;

export async function GET(request) {
  const baseUrl = BASE_URL;
  try {
    const forceRefresh = request.url.includes('refresh');
    const now = Date.now();

    if (!forceRefresh && cache.data && now - cache.timestamp < cache.ttl) {
      return new Response(cache.data, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
      });
    }

    await dbConnect();

    const [services, news] = await Promise.all([
      Service.find({}).lean(),
      News.find({ isPublished: true }).lean(),
    ]);

    let itemsXml = '';
    services.forEach((service) => {
      if (!service.name || !service.slug) {
        console.warn(`Пропущена услуга без name/slug: ${service._id}`);
        return;
      }
      try {
        itemsXml += buildServiceItem(service, baseUrl, FORM_EMAIL);
      } catch (err) {
        console.error(`Ошибка обработки услуги ${service.name}:`, err);
      }
    });
    news.forEach((item) => {
      if (!item.title || !item.slug) {
        console.warn(`Пропущена новость без title/slug: ${item._id}`);
        return;
      }
      try {
        itemsXml += buildNewsItem(item, baseUrl);
      } catch (err) {
        console.error(`Ошибка обработки новости ${item.title}:`, err);
      }
    });

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">` +
      `<channel>` +
      `<title>${escapeXml(BUSINESS.shortName)}</title>` +
      `<link>${baseUrl}</link>` +
      `<description>${escapeXml(SEO_DEFAULTS.description)}</description>` +
      `<language>ru</language>` +
      itemsXml +
      `</channel>` +
      `</rss>`;

    cache = { data: xml, timestamp: now, ttl: cache.ttl };

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('❌ Критическая ошибка Turbo-фида:', error);
    return new Response(emptyFeedXml(baseUrl), {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  }
}
```

- [ ] **Step 2: Start the dev server and verify with curl**

Run: `npm run dev` (in one terminal, leave running)

In another terminal:
```bash
curl -s http://localhost:3000/api/turbo-feed -o /tmp/turbo-feed.xml
head -c 500 /tmp/turbo-feed.xml
python3 -c "import xml.dom.minidom; xml.dom.minidom.parse('/tmp/turbo-feed.xml'); print('XML is well-formed')"
python3 -c "
import re
content = open('/tmp/turbo-feed.xml').read()
print('item count:', len(re.findall(r'<item turbo=\"true\">', content)))
print('has form widget:', 'data-type=\"callback\"' in content)
guids = re.findall(r'<guid>(.*?)</guid>', content)
print('guid count:', len(guids), 'unique:', len(set(guids)))
"
```

Expected: `XML is well-formed` prints with no exception, `has form widget: True`, `has undefined link: False`, and guid count equals item count with no duplicates. Note: this repo's local `.env.local`/`.env.production` both point `MONGODB_URI` at `127.0.0.1:27017` — this machine's own local MongoDB, NOT the real production database — so the local item count will NOT be 123+4; whatever real (possibly smaller, possibly containing malformed documents missing `name`/`slug`) data exists locally is fine for this check. The real 123-service, 4-news count is verified against the actual live site in Task 4.

If the dev server returns a plain-text `Internal Server Error` (not this route's own XML fallback) with no matching `console.error`/`console.warn` line in the terminal, and no `✓ Compiled /api/turbo-feed` line ever appears in the dev server log even after waiting — check that no helper function in this file still has an `export` keyword (see Global Constraints); that failure mode is silent and doesn't print a webpack/syntax error.

- [ ] **Step 3: Stop the dev server, commit**

```bash
git add src/app/api/turbo-feed/route.js
git commit -m "feat: wire up Turbo feed GET handler with DB fetch, cache, and error handling"
```

---

### Task 4: Production build, deploy, and connect in Yandex Webmaster

**Files:** none (verification and manual configuration only)

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: build completes with no errors related to `src/app/api/turbo-feed/route.js`.

- [ ] **Step 2: Deploy**

Follow the established deploy process (see project memory `deployment.md`): push to `origin/main`, `git pull` + `npm run build` + `pm2 restart servicebox-repair` on the production server.

- [ ] **Step 3: Verify the live feed**

Run: `curl -s https://servicebox35.ru/api/turbo-feed | head -c 500`
Expected: valid XML output, same shape as the dev-server check in Task 3.

- [ ] **Step 4: Connect the feed in Yandex Webmaster**

Open Яндекс.Вебмастер → «Турбо-страницы» → добавить RSS-фид → введите `https://servicebox35.ru/api/turbo-feed` → «Добавить».

Wait for Yandex's own validation to run (may take a few minutes) and note any warnings it reports — Yandex's own Turbo validator is the final source of truth beyond what this plan can check locally.

No commit needed for this task — it's deployment and external configuration only.
