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
