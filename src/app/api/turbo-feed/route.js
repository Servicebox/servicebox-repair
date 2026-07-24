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
