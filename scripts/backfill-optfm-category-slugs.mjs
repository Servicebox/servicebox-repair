// scripts/backfill-optfm-category-slugs.mjs
//
// Одноразовый скрипт: генерирует slug для категорий OPTFM, у которых его
// ещё нет (259 категорий, синхронизированных до появления поля slug).
// Использование:
//   node scripts/backfill-optfm-category-slugs.mjs
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env.production', import.meta.url).pathname });

import dbConnect from '../src/lib/db.js';
import OptfmCategory from '../src/models/OptfmCategory.js';
import { generateUniqueSlug } from '../src/lib/slugify.js';

async function main() {
  await dbConnect();

  const withoutSlug = await OptfmCategory.find({ slug: { $exists: false } }).select('_id name');
  console.log(`Категорий без slug: ${withoutSlug.length}`);

  for (const category of withoutSlug) {
    const slug = await generateUniqueSlug(OptfmCategory, category.name);
    await OptfmCategory.updateOne({ _id: category._id }, { $set: { slug } });
    console.log(`✅ ${category.name} → ${slug}`);
  }

  console.log('Готово');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
