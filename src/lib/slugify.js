// src/lib/slugify.js
/**
 * Генерация SEO-дружественного слага из строки
 * Пример: "Ремонт ноутбуков в Вологде!" → "remont-noutbukov-v-vologde"
 */
export function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Транслитерация кириллицы
    .replace(/[а-яё]/gi, char => {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char.toLowerCase()] || char;
    })
    // Удаление спецсимволов
    .replace(/[^\w\s-]/g, '')
    // Замена пробелов и подчёркиваний на дефис
    .replace(/[\s_-]+/g, '-')
    // Удаление дефисов по краям
    .replace(/^-+|-+$/g, '')
    // Ограничение длины
    .substring(0, 100);
}

/**
 * Проверка, является ли строка валидным MongoDB ObjectId
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Генерация уникального слага с проверкой в БД
 */
export async function generateUniqueSlug(Model, title, excludeId = null) {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await Model.findOne(query);
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}