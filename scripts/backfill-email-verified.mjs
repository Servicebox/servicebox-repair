// scripts/backfill-email-verified.mjs
//
// Phase 1 харденинга авторизации вводит блокировку входа для аккаунтов с
// неподтверждённым email. На момент внедрения в базе НЕТ ни одного
// verified-аккаунта (проверка email никогда не была обязательной), поэтому
// прямое включение гейта заблокировало бы всех, включая администратора.
//
// Этот скрипт "дедовщина" (grandfathering): помечает emailVerified: true
// тем, кто уже хотя бы раз успешно входил (lastLogin != null) — то есть
// проходил аутентификацию по старым правилам. Аккаунты, которые ни разу
// не логинились, остаются неподтверждёнными (реальные владельцы подтвердят
// через /api/auth/resend-verification, тестовые — не жалко).
//
// Запуск на сервере (реальная БД доступна только там):
//   node scripts/backfill-email-verified.mjs           # dry-run, только показать
//   node scripts/backfill-email-verified.mjs --apply   # применить

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const APPLY = process.argv.includes('--apply');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection('users');

  const filter = {
    emailVerified: { $ne: true },
    lastLogin: { $ne: null, $exists: true },
  };

  const affected = await users
    .find(filter, { projection: { email: 1, role: 1, lastLogin: 1 } })
    .toArray();

  console.log(`Найдено аккаунтов под grandfathering: ${affected.length}`);
  for (const u of affected) {
    const masked = (u.email || '').replace(/(.{2}).*(@.*)/, '$1***$2');
    console.log(`  ${u.role || 'user'}  ${masked}  lastLogin=${u.lastLogin?.toISOString?.() || u.lastLogin}`);
  }

  const staying = await users.countDocuments({
    emailVerified: { $ne: true },
    $or: [{ lastLogin: null }, { lastLogin: { $exists: false } }],
  });
  console.log(`Останутся неподтверждёнными (ни разу не входили): ${staying}`);

  if (!APPLY) {
    console.log('\n(dry-run) — ничего не изменено. Повторите с --apply для применения.');
    await mongoose.disconnect();
    return;
  }

  const res = await users.updateMany(filter, {
    $set: { emailVerified: true, emailVerifiedBackfilledAt: new Date() },
  });
  console.log(`\n✅ Применено: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
