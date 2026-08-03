// src/lib/optfm/downloadProductImage.js
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { optfmRequest } from './client.js';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'optfm');

function imagePathFor(supplierProductId) {
  return path.join(UPLOAD_DIR, `${supplierProductId}.webp`);
}

export function productImagePublicUrl(supplierProductId) {
  return `/uploads/optfm/${supplierProductId}.webp`;
}

/**
 * Скачивает и кэширует фото товара локально — только если файла ещё нет.
 * Ежедневная синхронизация не должна перекачивать фото уже импортированных
 * товаров: при 9000+ товарах это было бы избыточно и медленно (см. спеку,
 * раздел "Синхронизация товаров"). Возвращает true, если файл реально был
 * скачан в этот раз.
 */
export async function ensureProductImage(supplierProductId) {
  const filePath = imagePathFor(supplierProductId);
  if (existsSync(filePath)) return false;

  const { buffer, contentType } = await optfmRequest('catalog.getImage', {
    element_id: supplierProductId,
  });

  if (!contentType?.startsWith('image/')) {
    console.warn(`⚠️  OPTFM: catalog.getImage для товара ${supplierProductId} не вернул изображение`);
    return false;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const processed = await sharp(buffer)
    .webp({ quality: 80, effort: 4 })
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  await writeFile(filePath, processed);
  return true;
}
