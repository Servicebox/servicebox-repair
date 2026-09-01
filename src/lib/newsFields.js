// lib/newsFields.js
// Единый белый список полей новости, которые администратор вправе задать
// при создании/редактировании. Служебные поля (views, likesCount, likedBy,
// _id, createdAt, updatedAt) сюда НЕ входят — защита от mass-assignment:
// клиент не должен иметь возможности накрутить просмотры/лайки или
// переопределить временные метки через тело запроса.

export const NEWS_ALLOWED_FIELDS = [
  'title',
  'slug',
  'contentBlocks',
  'excerpt',
  'featuredImage',
  'metaTitle',
  'metaDescription',
  'keywords',
  'isPublished',
  'publishedAt',
  'author',
  'allowVideos',
];

/**
 * Оставляет в объекте только разрешённые поля новости.
 * @param {Record<string, unknown>} body  распарсенное тело запроса
 * @returns {Record<string, unknown>}
 */
export function pickNewsFields(body) {
  const out = {};
  if (!body || typeof body !== 'object') return out;
  for (const key of NEWS_ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}
