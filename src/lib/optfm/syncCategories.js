// src/lib/optfm/syncCategories.js
import OptfmCategory from '../../models/OptfmCategory.js';
import { optfmRequest } from './client.js';

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
    await OptfmCategory.updateOne(
      { supplierSectionId: String(section.id) },
      {
        $set: {
          name: section.name,
          depthLevel: Number(section.depth_level),
          sort: Number(section.sort ?? 0),
          description: section.description || '',
        },
      },
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
