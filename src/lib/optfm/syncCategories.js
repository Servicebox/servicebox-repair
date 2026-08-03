// src/lib/optfm/syncCategories.js
import OptfmCategory from '../../models/OptfmCategory.js';
import { optfmRequest } from './client.js';
import { generateUniqueSlug } from '../slugify.js';

const PAGE_LIMIT = 500;

/**
 * Забирает всё дерево разделов OPTFM и сохраняет в OptfmCategory.
 * Двухпроходный алгоритм: сначала upsert всех узлов по supplierSectionId
 * (без parentId), затем второй проход простраивает parentId — так связи
 * не зависят от порядка, в котором поставщик вернул секции (родитель
 * может прийти после потомка на другой странице).
 */
export async function syncCategories() {
  const allSections = [];
  let page = 1;

  while (true) {
    const { response } = await optfmRequest('catalog.getSectionList', {
      limit: PAGE_LIMIT,
      page,
    });
    allSections.push(...response.items);
    if (response.items.length < PAGE_LIMIT) break;
    page++;
  }

  for (const section of allSections) {
    const existing = await OptfmCategory.findOne({ supplierSectionId: String(section.id) })
      .select('slug')
      .lean();

    const update = {
      name: section.name,
      depthLevel: Number(section.depth_level),
      sort: Number(section.sort ?? 0),
      description: section.description || '',
    };

    // slug генерируется один раз при первом появлении категории — не
    // перегенерируем на каждой синхронизации, иначе уже опубликованные
    // ссылки на категорию будут ломаться при переименовании у поставщика.
    if (!existing?.slug) {
      update.slug = await generateUniqueSlug(OptfmCategory, section.name);
    }

    await OptfmCategory.updateOne(
      { supplierSectionId: String(section.id) },
      { $set: update },
      { upsert: true }
    );
  }

  for (const section of allSections) {
    if (!section.parent_id) {
      await OptfmCategory.updateOne({ supplierSectionId: String(section.id) }, { $set: { parentId: null } });
      continue;
    }

    const parent = await OptfmCategory.findOne({ supplierSectionId: String(section.parent_id) })
      .select('_id')
      .lean();

    if (!parent) {
      console.warn(
        `⚠️  OPTFM: раздел ${section.id} (${section.name}) ссылается на несуществующий parent_id=${section.parent_id} — пропускаю связь`
      );
      continue;
    }

    await OptfmCategory.updateOne({ supplierSectionId: String(section.id) }, { $set: { parentId: parent._id } });
  }

  return { categoriesUpserted: allSections.length };
}
