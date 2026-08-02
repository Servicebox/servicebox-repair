// app/api/turbo-feed/route.js
// Форма-заявка (data-type="callback") доставляет письма на email,
// а не через вебхук — см. docs/superpowers/specs/2026-07-25-turbo-pages-feed-design.md
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import News from '@/models/News';
import { BASE_URL, BUSINESS, SEO_DEFAULTS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const FORM_EMAIL = 's89062960353@yandex.ru';

let cache = { data: null, timestamp: 0, ttl: 5 * 60 * 1000 };

const escapeXml = (text) => {
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

const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const encodeUrlForXml = (url) => encodeURI(url).replace(/&/g, '&amp;');

const wrapCdata = (html) => `<![CDATA[${html.replace(/]]>/g, ']]&gt;')}]]>`;

const buildServiceItem = (service, baseUrl, formEmail) => {
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

const buildContentBlocksHtml = (blocks) => {
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

const buildNewsItem = (news, baseUrl) => {
  const title = escapeXml(news.metaTitle || news.title);
  const link = `${baseUrl}/news/${news.slug}`;
  const bodyHtml =
    buildContentBlocksHtml(news.contentBlocks) || `<p>${escapeHtml(news.excerpt || '')}</p>`;
  const coverHtml = news.featuredImage
    ? `<figure><img src="${encodeUrlForXml(news.featuredImage)}" alt="${escapeXml(news.title)}" /></figure>`
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
