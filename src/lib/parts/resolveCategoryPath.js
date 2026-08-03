// src/lib/parts/resolveCategoryPath.js
import OptfmCategory from '../../models/OptfmCategory.js';

/**
 * Находит категорию по последнему сегменту URL (/parts/a/b/c → ищем по
 * "c") и строит хлебные крошки, поднимаясь по parentId до корня.
 * Ведущие сегменты пути (a, b) не валидируются на точное соответствие
 * реальной цепочке предков — это сделано намеренно, по тому же принципу,
 * что уже используется у /services/[...slug] в этом проекте: slug
 * категории уникален глобально, поэтому находим её однозначно по
 * последнему сегменту, а остальная часть URL — это SEO-путь для
 * читаемости, не строгий контракт.
 */
export async function resolveCategoryPath(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return null;

  const targetSlug = segments[segments.length - 1];
  const category = await OptfmCategory.findOne({ slug: targetSlug }).lean();
  if (!category) return null;

  const breadcrumbs = [{ name: category.name, slug: category.slug }];
  let current = category;
  while (current.parentId) {
    current = await OptfmCategory.findById(current.parentId).select('name slug parentId').lean();
    if (!current) break;
    breadcrumbs.unshift({ name: current.name, slug: current.slug });
  }

  return { category, breadcrumbs };
}
