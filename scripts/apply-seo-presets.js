#!/usr/bin/env node
// scripts/apply-seo-presets.js
// Применяет SEO-пресеты к базе через /api/admin/seo/bulk-update
// Использование: ADMIN_TOKEN=xxx node scripts/apply-seo-presets.js

import { SEO_PRESETS } from '../src/lib/seo-generator.js';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN = process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error('❌ Укажите ADMIN_TOKEN в env');
  process.exit(1);
}

async function run() {
  console.log(`📤 Отправляем ${SEO_PRESETS.length} пресетов на ${BASE_URL}/api/admin/seo/bulk-update`);

  const res = await fetch(`${BASE_URL}/api/admin/seo/bulk-update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${TOKEN}`,
    },
    body: JSON.stringify({ items: SEO_PRESETS }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ Ошибка:', json);
    process.exit(1);
  }

  console.log('✅ Результат:');
  console.log(`  Обновлено: ${json.report.updated}`);
  console.log(`  Пропущено: ${json.report.skipped}`);
  console.log(`  Ошибок:    ${json.report.errors}`);

  if (json.details?.skipped?.length) {
    console.log('\n⚠️  Пропущенные slug:');
    json.details.skipped.forEach(s => console.log(`  - ${s.slug}: ${s.reason}`));
  }
}

run().catch(err => {
  console.error('❌ Необработанная ошибка:', err);
  process.exit(1);
});
