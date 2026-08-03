// src/lib/parts/getCategoryTree.js
import OptfmCategory from '../../models/OptfmCategory.js';

/**
 * Возвращает всё дерево категорий (259 узлов — маленькое, грузим целиком
 * и строим дерево в памяти, без пагинации самого дерева).
 */
export async function getCategoryTree() {
  const all = await OptfmCategory.find({}).select('name slug parentId sort').sort({ sort: 1, name: 1 }).lean();

  const byId = new Map(all.map((c) => [String(c._id), { ...c, children: [] }]));
  const roots = [];

  for (const category of byId.values()) {
    if (category.parentId && byId.has(String(category.parentId))) {
      byId.get(String(category.parentId)).children.push(category);
    } else {
      roots.push(category);
    }
  }

  return roots;
}
