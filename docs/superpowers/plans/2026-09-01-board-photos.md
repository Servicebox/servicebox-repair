# Фото плат с замерами — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Раздел «Фото плат» в депозитарии: админ грузит фото платы с замерами (нанесены на снимок) + название; каждое фото — отдельная индексируемая страница `/platy/[slug]`.

**Architecture:** Новая модель `BoardPhoto` (Mongoose). Файлы webp пишутся `sharp`-ом в `uploads/board-photos/` (корень репо, вне `public/`) и отдаются через route handler `readFile` — потому что прод-сервер (`src/server.js`, `NODE_ENV=production`) снимает список `public/` один раз при старте и не видит файлы, залитые позже. Публичные страницы `/platy` и `/platy/[slug]` — `force-static` + `dynamicParams=true` + ISR, актуальность между сборками держится `revalidatePath()` из админских мутаций. Админские мутации — под `/api/admin/board-photos` (middleware `/api/admin/*` + явная проверка роли).

**Tech Stack:** Next.js 15.5 App Router (JS), React 19, Mongoose/MongoDB, `sharp` 0.34, JWT-cookie auth (`@/lib/session`), кастомный Node-сервер.

**Spec:** `docs/superpowers/specs/2026-09-01-board-photos-design.md` (ревизия 2)

## Global Constraints

- **Нет тест-раннера.** В `package.json` нет `test`-скрипта. «Тест» в этом плане = сборка + локальный прод-сервер (`PORT=3123 npm start`, реальная БД из `.env.production`) + `curl`/`node -e` проверки. TDD в классическом виде неприменим; каждая задача заканчивается конкретной проверкой поведения.
- **Язык:** код и комментарии — **на русском** (правило репозитория `servicebox-repair`). UI-тексты — русские.
- **Бренд в текстах:** только «СЕРВИС БОКС» (кириллица). Латинское «ServiceBox» — запрещено в видимом тексте.
- **`BASE_URL`:** всегда `import { BASE_URL } from '@/lib/constants'`. Не писать локальные `getBaseUrl()`.
- **Next 15:** в route handlers и страницах `params` — Promise: `const { slug } = await params;`.
- **Хранилище фото:** `path.join(process.cwd(), 'uploads', 'board-photos')`. Файлы в git НЕ коммитить (untracked, переживают `git pull`). `next/image` для этих фото НЕ использовать — только `<img>` с явными `width`/`height`.
- **`sharp`:** всегда `.rotate()` перед `.resize()` (EXIF-ориентация телефонных фото). Размеры файла брать из `.toBuffer({ resolveWithObject: true })` → `info.width/info.height`, НЕ из `.metadata()`.
- **Админ-гейт (идиома репозитория, `src/app/api/admin/pricing-matrix/route.js:10-14`):**
  ```js
  async function requireAdmin(request) {
    const session = await getServerSession(request);
    if (!session || session.role !== 'admin') return null;
    return session;
  }
  ```
- **Модель-паттерн:** `export default mongoose.models.BoardPhoto || mongoose.model('BoardPhoto', schema)`.
- **Коммиты:** частые, по завершении каждой задачи. Пейлоад коммита — только файлы задачи (явный pathspec, не `git add -A` — в индексе репо всегда посторонний мусор).
- **Каждая задача перед коммитом:** `npm run build` зелёный.
- **Перед деплоем всего раздела:** независимый аудит кода (правило Toma), затем деплой по стандартной процедуре (push → ssh → `git pull && npm run build && pm2 restart`), затем проверка живых URL.

---

## Обзор файлов

**Создаются:**

| Файл | Ответственность |
|---|---|
| `src/models/BoardPhoto.js` | Mongoose-схема `BoardPhoto` |
| `src/lib/boardPhotos.js` | Чистые хелперы: RU-лейблы `deviceType`, карта `deviceType → URL услуги`, генерация description/JSON-LD |
| `src/app/api/board-photos/route.js` | `GET` список (публичный) |
| `src/app/api/board-photos/[slug]/route.js` | `GET` одна запись по slug (публичный) |
| `src/app/api/board-photos/[slug]/image/route.js` | `GET` байты webp (публичный, `readFile`) |
| `src/app/api/admin/board-photos/route.js` | `POST` загрузка (админ) |
| `src/app/api/admin/board-photos/[id]/route.js` | `PATCH`, `DELETE` (админ) |
| `src/app/platy/page.js` | Раздел-коллекция `/platy` |
| `src/app/platy/platy.module.css` | Стили раздела и карточек |
| `src/app/platy/[slug]/page.js` | Страница одного фото `/platy/[slug]` |
| `src/app/platy/[slug]/boardPhoto.module.css` | Стили страницы фото |
| `src/components/BoardPhotos/BoardPhotoGrid.js` | Клиентская сетка карточек (используют `/platy` и вкладка депозитария) |
| `src/components/BoardPhotos/BoardPhotoGrid.module.css` | Стили сетки |
| `src/components/depository/BoardPhotoUpload.js` | Админ-форма загрузки |
| `src/components/depository/BoardPhotoUpload.module.css` | — |
| `src/components/depository/BoardPhotoAdminList.js` | Админ-список с правкой/удалением |
| `src/components/depository/BoardPhotoAdminList.module.css` | — |

**Изменяются:**

| Файл | Что |
|---|---|
| `src/components/DepositoryPublic/DepositoryPublic.js` | Переключатель вкладок «Файлы»/«Платы»; вкладка «Платы» рендерит `BoardPhotoGrid` |
| `src/app/admin-panel/depository/page.js` | 4-я вкладка «Платы» |
| `src/app/sitemap.js` | `/platy` + URL всех активных плат |
| `src/app/robots.js` | `/platy/` и `/api/board-photos/` в allow-списке AI-краулеров |

---

## Task 1: Модель `BoardPhoto` + хелперы `boardPhotos.js`

**Files:**
- Create: `src/models/BoardPhoto.js`
- Create: `src/lib/boardPhotos.js`

**Interfaces:**
- Produces:
  - `BoardPhoto` (default export, Mongoose model). Поля: `title:String`, `slug:String unique`, `deviceType:enum`, `chip:String`, `description:String`, `imageName:String unique`, `imageWidth:Number`, `imageHeight:Number`, `isActive:Boolean`, `viewCount:Number`, `createdAt/updatedAt`.
  - `DEVICE_TYPES: string[]` — `['videocard','laptop','motherboard','phone','tablet','console','tv','other']`
  - `deviceTypeLabel(type: string): string` — RU-лейбл («Видеокарта», «Ноутбук», …; неизвестный → «Плата»)
  - `deviceTypeServiceUrl(type: string): string` — `/services/videocards` и т.п.; `motherboard|other|unknown` → `/services`
  - `boardPhotoDescription({ title, chip, description, deviceType }): string` — берёт `description` (обрезка до 160) либо генерит авто-текст
  - `BOARD_PHOTOS_DIR: string` — `path.join(process.cwd(), 'uploads', 'board-photos')`

- [ ] **Step 1: Создать `src/lib/boardPhotos.js`**

```js
// src/lib/boardPhotos.js
// Чистые хелперы раздела «Фото плат». Никаких обращений к БД/ФС на импорте.
import path from 'path';

export const BOARD_PHOTOS_DIR = path.join(process.cwd(), 'uploads', 'board-photos');

export const DEVICE_TYPES = [
  'videocard', 'laptop', 'motherboard', 'phone', 'tablet', 'console', 'tv', 'other',
];

const LABELS = {
  videocard: 'Видеокарта',
  laptop: 'Ноутбук',
  motherboard: 'Материнская плата',
  phone: 'Телефон',
  tablet: 'Планшет',
  console: 'Игровая приставка',
  tv: 'Телевизор',
  other: 'Плата',
};

const SERVICE_URLS = {
  videocard: '/services/videocards',
  laptop: '/services/laptops',
  phone: '/services/phones',
  tablet: '/services/tablets',
  console: '/services/consoles',
  tv: '/services/tv',
};

export function deviceTypeLabel(type) {
  return LABELS[type] || 'Плата';
}

export function deviceTypeServiceUrl(type) {
  return SERVICE_URLS[type] || '/services';
}

// Родительный падеж для авто-описания: «ремонт видеокарт в Вологде»
const GENITIVE = {
  videocard: 'видеокарт',
  laptop: 'ноутбуков',
  motherboard: 'материнских плат',
  phone: 'телефонов',
  tablet: 'планшетов',
  console: 'игровых приставок',
  tv: 'телевизоров',
  other: 'техники',
};

export function boardPhotoDescription({ title, chip, description, deviceType }) {
  if (description && description.trim()) {
    const t = description.trim();
    return t.length > 160 ? t.slice(0, 157).trimEnd() + '…' : t;
  }
  const chipPart = chip && chip.trim() ? `, чип ${chip.trim()}` : '';
  return `Фото платы ${title}${chipPart} с точками замера сопротивления. `
    + `Диагностика и ремонт ${GENITIVE[deviceType] || 'техники'} в Вологде — СЕРВИС БОКС.`;
}
```

- [ ] **Step 2: Проверить хелперы через `node -e`**

Run:
```bash
node --input-type=module -e "
import { deviceTypeLabel, deviceTypeServiceUrl, boardPhotoDescription, DEVICE_TYPES } from './src/lib/boardPhotos.js';
console.log(DEVICE_TYPES.length === 8);
console.log(deviceTypeLabel('videocard') === 'Видеакарта' ? 'BAD' : deviceTypeLabel('videocard'));
console.log(deviceTypeServiceUrl('phone') === '/services/phones');
console.log(deviceTypeServiceUrl('motherboard') === '/services');
console.log(boardPhotoDescription({ title: 'Palit GTX 1060', chip: 'GP106-401-A1', description: '', deviceType: 'videocard' }));
console.log(boardPhotoDescription({ title: 'X', chip: '', description: '  свой текст  ', deviceType: 'other' }) === 'свой текст');
"
```
Expected: `true`, `Видеокарта`, `true`, `true`, авто-строка про замеры, `true`.

- [ ] **Step 3: Создать `src/models/BoardPhoto.js`**

```js
// src/models/BoardPhoto.js
import mongoose from 'mongoose';
import { DEVICE_TYPES } from '@/lib/boardPhotos';

const BoardPhotoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    deviceType: { type: String, enum: DEVICE_TYPES, default: 'other', index: true },
    chip: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    imageName: { type: String, required: true, unique: true }, // <uuid>.webp на диске
    imageWidth: { type: Number, required: true },
    imageHeight: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BoardPhotoSchema.index({ title: 'text', chip: 'text', description: 'text' });

export default mongoose.models.BoardPhoto || mongoose.model('BoardPhoto', BoardPhotoSchema);
```

- [ ] **Step 4: Проверить, что модель импортируется и `npm run build` зелёный**

Run:
```bash
node --input-type=module -e "import('./src/models/BoardPhoto.js').then(m => console.log(typeof m.default))" 2>&1 | tail -3
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
```
Expected: `function` (или предупреждение mongoose про отсутствие подключения — это ок, главное без синтаксической ошибки), `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add src/models/BoardPhoto.js src/lib/boardPhotos.js
git commit -m "feat(platy): модель BoardPhoto + хелперы boardPhotos"
```

---

## Task 2: Админская загрузка `POST /api/admin/board-photos`

**Files:**
- Create: `src/app/api/admin/board-photos/route.js`

**Interfaces:**
- Consumes: `BoardPhoto` (Task 1), `BOARD_PHOTOS_DIR` + `DEVICE_TYPES` (Task 1), `generateUniqueSlug` (`@/lib/slugify`), `getServerSession` (`@/lib/session`), `dbConnect` (`@/lib/db`).
- Produces: `POST /api/admin/board-photos` — multipart `image, title, deviceType, chip?, description?`. Успех → `201 { success: true, boardPhoto: { _id, slug, title, deviceType, chip, description, imageName, imageWidth, imageHeight, isActive } }`. Файл `<uuid>.webp` в `uploads/board-photos/`.

- [ ] **Step 1: Написать route**

```js
// src/app/api/admin/board-photos/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { generateUniqueSlug } from '@/lib/slugify';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR, DEVICE_TYPES } from '@/lib/boardPhotos';

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function POST(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Ожидается multipart/form-data' }, { status: 400 });
  }

  const file = form.get('image');
  const title = (form.get('title') || '').toString().trim();
  const deviceTypeRaw = (form.get('deviceType') || 'other').toString();
  const deviceType = DEVICE_TYPES.includes(deviceTypeRaw) ? deviceTypeRaw : 'other';
  const chip = (form.get('chip') || '').toString().trim();
  const description = (form.get('description') || '').toString().trim();

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Допустимы JPEG, PNG или WebP' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файл больше 15 МБ' }, { status: 400 });
  }
  if (title.length < 3) {
    return NextResponse.json({ error: 'Название платы — минимум 3 символа' }, { status: 400 });
  }

  let webp, info;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const out = await sharp(buf)
      .rotate() // применить EXIF-ориентацию
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    webp = out.data;
    info = out.info; // info.width / info.height — реальные размеры результата
  } catch (e) {
    console.error('[board-photos] sharp:', e.message);
    return NextResponse.json({ error: 'Не удалось обработать изображение' }, { status: 400 });
  }

  await dbConnect();
  const slug = await generateUniqueSlug(BoardPhoto, title);
  const imageName = `${randomUUID()}.webp`;

  await mkdir(BOARD_PHOTOS_DIR, { recursive: true });
  await writeFile(path.join(BOARD_PHOTOS_DIR, imageName), webp);

  const doc = await BoardPhoto.create({
    title, slug, deviceType, chip, description,
    imageName, imageWidth: info.width, imageHeight: info.height,
  });

  revalidatePath('/platy');

  return NextResponse.json({
    success: true,
    boardPhoto: {
      _id: doc._id.toString(), slug: doc.slug, title: doc.title,
      deviceType: doc.deviceType, chip: doc.chip, description: doc.description,
      imageName: doc.imageName, imageWidth: doc.imageWidth, imageHeight: doc.imageHeight,
      isActive: doc.isActive,
    },
  }, { status: 201 });
}
```

- [ ] **Step 2: Собрать и запустить прод-сервер**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1
(PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do curl -s -o /dev/null -w "" http://127.0.0.1:3123/ && sleep 1; c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
```

- [ ] **Step 3: Проверить гейт без сессии**

Run:
```bash
curl -s -o /dev/null -w "no-auth POST: %{http_code}\n" -X POST http://127.0.0.1:3123/api/admin/board-photos -F "title=Тест" -F "image=@/Users/tom/Desktop/IMG_0024.jpg"
```
Expected: `no-auth POST: 401`

- [ ] **Step 4: Получить админ-cookie (JWT) для дальнейших шагов**

Run:
```bash
ADMIN_ID=$(node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.production' });
const U = mongoose.model('U', new mongoose.Schema({}, { strict: false }), 'users');
await mongoose.connect(process.env.MONGODB_URI);
const a = await U.findOne({ role: 'admin' }, { _id: 1 }).lean();
console.log(a?._id?.toString() || 'NONE');
await mongoose.disconnect();
" 2>&1 | tail -1)
echo "admin id: $ADMIN_ID"
TOKEN=$(node -e "require('dotenv').config({path:'.env.production'}); console.log(require('jsonwebtoken').sign({ userId: '$ADMIN_ID' }, process.env.JWT_SECRET, { expiresIn: '1h' }))")
echo "token len: ${#TOKEN}"
```
Expected: непустой `admin id` (24 hex), непустой токен. Если админов нет — создать тестового через существующий механизм или временно повысить роль своего аккаунта в БД (вернуть после теста).

- [ ] **Step 5: Загрузить портретное фото (проверка `.rotate()` и размеров)**

Run:
```bash
curl -s -X POST http://127.0.0.1:3123/api/admin/board-photos \
  -H "Cookie: token=$TOKEN" \
  -F "title=Palit GTX 1060 6ГБ, чип GP106-401-A1" \
  -F "deviceType=videocard" \
  -F "chip=GP106-401-A1" \
  -F "image=@/Users/tom/Desktop/IMG_0024.jpg" | python3 -m json.tool
ls -la uploads/board-photos/
```
Expected: `201`, JSON с `slug: "palit-gtx-1060-6gb-chip-gp106-401-a1"`, `imageWidth` и `imageHeight` заданы, `imageWidth <= 1600`. Для `IMG_0024.jpg` (портрет) — `imageHeight > imageWidth`. Файл `<uuid>.webp` появился на диске.

- [ ] **Step 6: Загрузить второе фото (ландшафт, для следующих задач)**

Run:
```bash
curl -s -X POST http://127.0.0.1:3123/api/admin/board-photos \
  -H "Cookie: token=$TOKEN" \
  -F "title=SR3YY / n18e-g2-a1 материнская плата ASUS ROG" \
  -F "deviceType=laptop" -F "chip=n18e-g2-a1" \
  -F "image=@/Users/tom/Desktop/IMG_0006.JPG" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['boardPhoto']['slug'], d['boardPhoto']['imageWidth'],'x',d['boardPhoto']['imageHeight'])"
```
Expected: slug + размеры; для ландшафта `imageWidth > imageHeight`, `imageWidth == 1600` (исходник шире 1600).

- [ ] **Step 7: Проверить валидацию**

Run:
```bash
curl -s -o /dev/null -w "no-file: %{http_code}\n" -X POST http://127.0.0.1:3123/api/admin/board-photos -H "Cookie: token=$TOKEN" -F "title=Только текст"
curl -s -o /dev/null -w "short-title: %{http_code}\n" -X POST http://127.0.0.1:3123/api/admin/board-photos -H "Cookie: token=$TOKEN" -F "title=X" -F "image=@/Users/tom/Desktop/IMG_0006.JPG"
```
Expected: `no-file: 400`, `short-title: 400`.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/admin/board-photos/route.js
git commit -m "feat(platy): POST /api/admin/board-photos — загрузка фото платы"
```

---

## Task 3: Публичное чтение `GET /api/board-photos` и `GET /api/board-photos/[slug]`

**Files:**
- Create: `src/app/api/board-photos/route.js`
- Create: `src/app/api/board-photos/[slug]/route.js`

**Interfaces:**
- Consumes: `BoardPhoto` (Task 1), `dbConnect`.
- Produces:
  - `GET /api/board-photos?deviceType=&q=` → `200 { boardPhotos: Array<{_id, slug, title, deviceType, chip, description, imageWidth, imageHeight, createdAt}> }`, только `isActive:true`, сорт `createdAt: -1`.
  - `GET /api/board-photos/[slug]` → `200 { boardPhoto: {...тот же набор + description} }` или `404 { error }` если нет/не активна.

- [ ] **Step 1: Написать список-роут**

```js
// src/app/api/board-photos/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { DEVICE_TYPES } from '@/lib/boardPhotos';

const PUBLIC_FIELDS = 'slug title deviceType chip description imageWidth imageHeight createdAt';

export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);
  const deviceType = url.searchParams.get('deviceType');
  const q = (url.searchParams.get('q') || '').trim();

  const filter = { isActive: true };
  if (deviceType && DEVICE_TYPES.includes(deviceType)) filter.deviceType = deviceType;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { chip: rx }];
  }

  const docs = await BoardPhoto.find(filter, PUBLIC_FIELDS).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    boardPhotos: docs.map(d => ({ ...d, _id: d._id.toString() })),
  });
}
```

- [ ] **Step 2: Написать роут одной записи**

```js
// src/app/api/board-photos/[slug]/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';

export async function GET(request, { params }) {
  const { slug } = await params;
  await dbConnect();
  const doc = await BoardPhoto.findOne(
    { slug, isActive: true },
    'slug title deviceType chip description imageWidth imageHeight createdAt'
  ).lean();
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json({ boardPhoto: { ...doc, _id: doc._id.toString() } });
}
```

- [ ] **Step 3: Собрать, перезапустить сервер, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
curl -s "http://127.0.0.1:3123/api/board-photos" | python3 -c "import sys,json;d=json.load(sys.stdin);print('count', len(d['boardPhotos']))"
curl -s "http://127.0.0.1:3123/api/board-photos?deviceType=videocard" | python3 -c "import sys,json;d=json.load(sys.stdin);print('videocard', len(d['boardPhotos']))"
curl -s "http://127.0.0.1:3123/api/board-photos?q=gp106" | python3 -c "import sys,json;d=json.load(sys.stdin);print('q=gp106', len(d['boardPhotos']))"
curl -s -o /dev/null -w "one: %{http_code}\n" "http://127.0.0.1:3123/api/board-photos/palit-gtx-1060-6gb-chip-gp106-401-a1"
curl -s -o /dev/null -w "missing: %{http_code}\n" "http://127.0.0.1:3123/api/board-photos/no-such-slug"
```
Expected: `count 2`, `videocard 1`, `q=gp106 1`, `one: 200`, `missing: 404`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/board-photos/route.js src/app/api/board-photos/[slug]/route.js
git commit -m "feat(platy): публичное чтение GET /api/board-photos[/slug]"
```

---

## Task 4: Отдача файла `GET /api/board-photos/[slug]/image`

**Files:**
- Create: `src/app/api/board-photos/[slug]/image/route.js`

**Interfaces:**
- Consumes: `BoardPhoto`, `BOARD_PHOTOS_DIR`, `dbConnect`.
- Produces: `GET /api/board-photos/[slug]/image` → `200` тело = webp, `Content-Type: image/webp`, `Cache-Control: public, max-age=31536000, immutable`, `Content-Disposition: inline`. `404` если записи или файла нет.

- [ ] **Step 1: Написать роут**

```js
// src/app/api/board-photos/[slug]/image/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR } from '@/lib/boardPhotos';

export async function GET(request, { params }) {
  const { slug } = await params;
  await dbConnect();
  const doc = await BoardPhoto.findOne({ slug, isActive: true }, 'imageName').lean();
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  let bytes;
  try {
    bytes = await readFile(path.join(BOARD_PHOTOS_DIR, doc.imageName));
  } catch {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
  }

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(bytes.length),
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

- [ ] **Step 2: Собрать, перезапустить, проверить БЕЗ рестарта после загрузки нового фото (ключевой тест B1)**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up

# существующее фото
curl -s -o /dev/null -w "existing image: %{http_code} %{content_type}\n" "http://127.0.0.1:3123/api/board-photos/palit-gtx-1060-6gb-chip-gp106-401-a1/image"

# загрузить НОВОЕ фото и сразу запросить его картинку — без рестарта сервера
TOKEN=$(node -e "require('dotenv').config({path:'.env.production'}); const id=process.env._AID; console.log(require('jsonwebtoken').sign({userId: id}, process.env.JWT_SECRET, {expiresIn:'1h'}))" _AID="$ADMIN_ID")
NEW_SLUG=$(curl -s -X POST http://127.0.0.1:3123/api/admin/board-photos -H "Cookie: token=$TOKEN" -F "title=Тест отдачи без рестарта" -F "deviceType=phone" -F "image=@/Users/tom/Desktop/IMG_0006.JPG" | python3 -c "import sys,json;print(json.load(sys.stdin)['boardPhoto']['slug'])")
curl -s -o /dev/null -w "fresh image (no restart): %{http_code} %{content_type}\n" "http://127.0.0.1:3123/api/board-photos/$NEW_SLUG/image"

# удалить тестовую запись руками из БД перед следующими задачами (или оставить, DELETE появится в Task 6)
```
Expected: `existing image: 200 image/webp`, `fresh image (no restart): 200 image/webp` — **картинка отдаётся сразу, без перезапуска сервера**.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/board-photos/[slug]/image/route.js
git commit -m "feat(platy): отдача webp через GET /api/board-photos/[slug]/image"
```

---

## Task 5: Страница фото `/platy/[slug]`

**Files:**
- Create: `src/app/platy/[slug]/page.js`
- Create: `src/app/platy/[slug]/boardPhoto.module.css`

**Interfaces:**
- Consumes: `BoardPhoto`, `dbConnect`, `BASE_URL` (`@/lib/constants`), `deviceTypeLabel`/`deviceTypeServiceUrl`/`boardPhotoDescription` (Task 1), `createBreadcrumbList` (`@/lib/seo-helpers`).
- Produces: статическая (ISR) страница `/platy/[slug]` с `<h1>`, `<img>`, JSON-LD, CTA, крошками.

- [ ] **Step 1: Написать страницу**

```jsx
// src/app/platy/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { BASE_URL } from '@/lib/constants';
import { createBreadcrumbList } from '@/lib/seo-helpers';
import { deviceTypeLabel, deviceTypeServiceUrl, boardPhotoDescription } from '@/lib/boardPhotos';
import styles from './boardPhoto.module.css';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400;

async function getDoc(slug) {
  await dbConnect();
  return BoardPhoto.findOne(
    { slug, isActive: true },
    'slug title deviceType chip description imageWidth imageHeight createdAt'
  ).lean();
}

export async function generateStaticParams() {
  await dbConnect();
  const docs = await BoardPhoto.find({ isActive: true }, 'slug').lean();
  return docs.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) return { title: 'Плата не найдена' };
  const desc = boardPhotoDescription(doc);
  const imageUrl = `${BASE_URL}/api/board-photos/${slug}/image`;
  return {
    title: `${doc.title} — фото платы с замерами | СЕРВИС БОКС`,
    description: desc,
    alternates: { canonical: `${BASE_URL}/platy/${slug}` },
    keywords: `${doc.title}, ${doc.chip}, замеры платы, сопротивление, распиновка, ремонт ${deviceTypeLabel(doc.deviceType).toLowerCase()} Вологда, СЕРВИС БОКС`,
    openGraph: {
      title: `${doc.title} — фото платы с замерами`,
      description: desc,
      url: `${BASE_URL}/platy/${slug}`,
      siteName: 'СЕРВИС БОКС Вологда',
      locale: 'ru_RU',
      type: 'article',
      images: [{ url: imageUrl, width: doc.imageWidth, height: doc.imageHeight, alt: doc.title }],
    },
    twitter: { card: 'summary_large_image', title: doc.title, description: desc, images: [imageUrl] },
  };
}

export default async function BoardPhotoPage({ params }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) notFound();

  const imageUrl = `${BASE_URL}/api/board-photos/${slug}/image`;
  const desc = boardPhotoDescription(doc);
  const typeLabel = deviceTypeLabel(doc.deviceType);
  const serviceUrl = deviceTypeServiceUrl(doc.deviceType);
  const dateStr = new Date(doc.createdAt).toLocaleDateString('ru-RU');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageObject',
        contentUrl: imageUrl,
        url: `${BASE_URL}/platy/${slug}`,
        width: doc.imageWidth,
        height: doc.imageHeight,
        caption: doc.title,
        name: `${doc.title} — фото платы с замерами`,
        description: desc,
        creator: { '@id': `${BASE_URL}#business` },
        copyrightHolder: { '@id': `${BASE_URL}#business` },
        representativeOfPage: true,
        datePublished: new Date(doc.createdAt).toISOString(),
      },
      createBreadcrumbList([
        { name: 'Главная', url: BASE_URL },
        { name: 'Депозитарий', url: `${BASE_URL}/depository-public` },
        { name: 'Платы', url: `${BASE_URL}/platy` },
        { name: doc.title, url: `${BASE_URL}/platy/${slug}` },
      ]),
    ],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className={styles.crumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link> ·{' '}
        <Link href="/depository-public">Депозитарий</Link> ·{' '}
        <Link href="/platy">Платы</Link> · <span>{doc.title}</span>
      </nav>

      <h1 className={styles.title}>{doc.title}</h1>

      <div className={styles.meta}>
        <span className={styles.badge}>{typeLabel}</span>
        {doc.chip && <span className={styles.chip}>Чип: {doc.chip}</span>}
        <span className={styles.date}>{dateStr}</span>
      </div>

      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className={styles.photoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          width={doc.imageWidth}
          height={doc.imageHeight}
          alt={`${doc.title} — фото платы с точками замера`}
          className={styles.photo}
          fetchPriority="high"
        />
      </a>

      {doc.description && <p className={styles.description}>{doc.description}</p>}

      <div className={styles.cta}>
        <p>Нужен ремонт этой платы? Бесплатная диагностика, замеры под микроскопом.</p>
        <Link href={serviceUrl} className={styles.ctaBtn}>Ремонт {typeLabel.toLowerCase()} в Вологде →</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Написать CSS**

```css
/* src/app/platy/[slug]/boardPhoto.module.css */
.page { max-width: 900px; margin: 0 auto; padding: 24px 16px 64px; }
.crumbs { font-size: 14px; color: var(--color-text-muted, #6b7280); margin-bottom: 16px; }
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { text-decoration: underline; }
.title { font-size: clamp(1.5rem, 1rem + 2vw, 2.25rem); font-weight: 800; margin: 0 0 12px; color: var(--color-primary-dark, #0a1929); }
.meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px; font-size: 14px; }
.badge { background: #0a1929; color: #fff; padding: 4px 12px; border-radius: 999px; font-weight: 600; }
.chip { background: #eef2f7; color: #0a1929; padding: 4px 12px; border-radius: 999px; font-weight: 600; }
.date { color: var(--color-text-muted, #6b7280); }
.photoWrap { display: block; background: #0d2033; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a5f; }
.photo { display: block; width: 100%; height: auto; }
.description { margin: 20px 0; line-height: 1.6; color: var(--color-text, #1f2937); white-space: pre-wrap; }
.cta { margin-top: 32px; padding: 20px; background: #f5f8fc; border: 1px solid #e2e8f0; border-radius: 16px; }
.cta p { margin: 0 0 12px; }
.ctaBtn { display: inline-block; background: #0a1929; color: #fff; padding: 12px 20px; border-radius: 12px; font-weight: 700; text-decoration: none; }
.ctaBtn:hover { background: #12293f; }
```

- [ ] **Step 3: Собрать, перезапустить, проверить SSR-разметку**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:|/platy"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
H=$(curl -s "http://127.0.0.1:3123/platy/palit-gtx-1060-6gb-chip-gp106-401-a1")
echo "$H" | grep -oE "<h1[^>]*>[^<]*" | head -1
echo "$H" | grep -oE '<link rel="canonical" href="[^"]*"'
echo "$H" | grep -oE '<meta property="og:image" content="[^"]*"'
echo "$H" | grep -c 'application/ld+json'
echo "$H" | grep -oE '"@type":"ImageObject"|"@type":"BreadcrumbList"'
curl -s -o /dev/null -w "bad slug: %{http_code}\n" "http://127.0.0.1:3123/platy/no-such"
```
Expected: `<h1 ...>Palit GTX 1060...`, canonical `.../platy/palit-...`, og:image `.../api/board-photos/palit-.../image`, `≥1` ld+json блок, обе `@type` строки, `bad slug: 404`.

- [ ] **Step 4: Commit**

```bash
git add src/app/platy/[slug]/page.js src/app/platy/[slug]/boardPhoto.module.css
git commit -m "feat(platy): страница /platy/[slug] с SEO-метаданными и JSON-LD"
```

---

## Task 6: Админские `PATCH` / `DELETE` `/api/admin/board-photos/[id]`

**Files:**
- Create: `src/app/api/admin/board-photos/[id]/route.js`

**Interfaces:**
- Consumes: `BoardPhoto`, `BOARD_PHOTOS_DIR`, `getServerSession`, `dbConnect`, `DEVICE_TYPES`, `isValidObjectId` (`@/lib/slugify`), `revalidatePath`.
- Produces:
  - `PATCH /api/admin/board-photos/[id]` — body JSON, поля `title?, slug?, deviceType?, chip?, description?, isActive?`. → `200 { success, boardPhoto }`.
  - `DELETE /api/admin/board-photos/[id]` → `200 { success }`, удаляет файл и запись.

- [ ] **Step 1: Написать роут**

```js
// src/app/api/admin/board-photos/[id]/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { isValidObjectId } from '@/lib/slugify';
import BoardPhoto from '@/models/BoardPhoto';
import { BOARD_PHOTOS_DIR, DEVICE_TYPES } from '@/lib/boardPhotos';

async function requireAdmin(request) {
  const session = await getServerSession(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function PATCH(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const patch = {};
  if (typeof body.title === 'string' && body.title.trim().length >= 3) patch.title = body.title.trim();
  if (typeof body.slug === 'string' && body.slug.trim()) patch.slug = body.slug.trim();
  if (typeof body.chip === 'string') patch.chip = body.chip.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (DEVICE_TYPES.includes(body.deviceType)) patch.deviceType = body.deviceType;
  if (typeof body.isActive === 'boolean') patch.isActive = body.isActive;

  await dbConnect();
  let doc;
  try {
    doc = await BoardPhoto.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось сохранить: ' + e.message }, { status: 400 });
  }
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  revalidatePath('/platy');
  revalidatePath(`/platy/${doc.slug}`);
  return NextResponse.json({
    success: true,
    boardPhoto: {
      _id: doc._id.toString(), slug: doc.slug, title: doc.title, deviceType: doc.deviceType,
      chip: doc.chip, description: doc.description, isActive: doc.isActive,
      imageWidth: doc.imageWidth, imageHeight: doc.imageHeight,
    },
  });
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Требуются права администратора' }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });

  await dbConnect();
  const doc = await BoardPhoto.findById(id);
  if (!doc) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  const slug = doc.slug;
  try {
    await unlink(path.join(BOARD_PHOTOS_DIR, doc.imageName));
  } catch (e) {
    console.warn('[board-photos] unlink:', e.message); // файла нет — не роняем
  }
  await doc.deleteOne();

  revalidatePath('/platy');
  revalidatePath(`/platy/${slug}`);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Собрать, перезапустить, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
TOKEN=$(node -e "require('dotenv').config({path:'.env.production'}); console.log(require('jsonwebtoken').sign({userId: process.env._AID}, process.env.JWT_SECRET, {expiresIn:'1h'}))" _AID="$ADMIN_ID")

# id второй записи (n18e-g2-a1)
PID=$(curl -s "http://127.0.0.1:3123/api/board-photos" | python3 -c "import sys,json;d=json.load(sys.stdin);print([p for p in d['boardPhotos'] if 'n18e' in p['slug']][0]['_id'])")

# гейты
curl -s -o /dev/null -w "PATCH no-auth: %{http_code}\n" -X PATCH "http://127.0.0.1:3123/api/admin/board-photos/$PID" -H 'Content-Type: application/json' -d '{"isActive":false}'
curl -s -o /dev/null -w "PATCH bad-role: %{http_code}\n" -X PATCH "http://127.0.0.1:3123/api/admin/board-photos/$PID" -H "Cookie: token=$(node -e "require('dotenv').config({path:'.env.production'}); console.log(require('jsonwebtoken').sign({userId:'ffffffffffffffffffffffff'}, process.env.JWT_SECRET))")" -H 'Content-Type: application/json' -d '{"isActive":false}'

# деактивация
curl -s -X PATCH "http://127.0.0.1:3123/api/admin/board-photos/$PID" -H "Cookie: token=$TOKEN" -H 'Content-Type: application/json' -d '{"isActive":false}' -w "\n[%{http_code}]\n"
curl -s -o /dev/null -w "list after deactivate: " "http://127.0.0.1:3123/api/board-photos" ; curl -s "http://127.0.0.1:3123/api/board-photos" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['boardPhotos']))"
curl -s -o /dev/null -w "page after deactivate: %{http_code}\n" "http://127.0.0.1:3123/platy/sr3yy-n18e-g2-a1-materinskaya-plata-asus-rog"

# вернуть активной, затем удалить
curl -s -X PATCH "http://127.0.0.1:3123/api/admin/board-photos/$PID" -H "Cookie: token=$TOKEN" -H 'Content-Type: application/json' -d '{"isActive":true}' -o /dev/null -w "reactivate: %{http_code}\n"
curl -s -X DELETE "http://127.0.0.1:3123/api/admin/board-photos/$PID" -H "Cookie: token=$TOKEN" -w "delete: %{http_code}\n" -o /dev/null
curl -s "http://127.0.0.1:3123/api/board-photos" | python3 -c "import sys,json;print('count after delete', len(json.load(sys.stdin)['boardPhotos']))"
```
Expected: `PATCH no-auth: 401`, `PATCH bad-role: 401`, деактивация `[200]`, список после деактивации `1`, страница после деактивации `404` (revalidatePath сработал), `reactivate: 200`, `delete: 200`, `count after delete 1`.

Затем повторно залить n18e-фото (Task 2 Step 6) для следующих задач.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/board-photos/[id]/route.js
git commit -m "feat(platy): PATCH/DELETE /api/admin/board-photos/[id]"
```

---

## Task 7: Компонент `BoardPhotoGrid` + раздел `/platy`

**Files:**
- Create: `src/components/BoardPhotos/BoardPhotoGrid.js`
- Create: `src/components/BoardPhotos/BoardPhotoGrid.module.css`
- Create: `src/app/platy/page.js`
- Create: `src/app/platy/platy.module.css`

**Interfaces:**
- Consumes: `GET /api/board-photos` (Task 3), `deviceTypeLabel` + `DEVICE_TYPES` (Task 1), `BASE_URL`.
- Produces:
  - `<BoardPhotoGrid />` (client) — сам грузит `/api/board-photos`, показывает фильтр по типу + поиск + сетку карточек-ссылок на `/platy/[slug]`.
  - страница `/platy` (server, ISR) — заголовок + `<BoardPhotoGrid />` + JSON-LD `CollectionPage`.

- [ ] **Step 1: Написать `BoardPhotoGrid.js`**

```jsx
// src/components/BoardPhotos/BoardPhotoGrid.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoGrid.module.css';

export default function BoardPhotoGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceType, setDeviceType] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (deviceType) params.set('deviceType', deviceType);
    if (q.trim()) params.set('q', q.trim());
    setLoading(true);
    fetch(`/api/board-photos?${params}`)
      .then(r => r.ok ? r.json() : { boardPhotos: [] })
      .then(d => setItems(d.boardPhotos || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [deviceType, q]);

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          placeholder="Поиск по названию платы или чипу…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${deviceType === '' ? styles.chipActive : ''}`}
            onClick={() => setDeviceType('')}
          >Все</button>
          {DEVICE_TYPES.filter(t => t !== 'other').map(t => (
            <button
              key={t}
              className={`${styles.chip} ${deviceType === t ? styles.chipActive : ''}`}
              onClick={() => setDeviceType(t)}
            >{deviceTypeLabel(t)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={styles.state}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.state}>Пока нет фотографий плат по этому запросу.</p>
      ) : (
        <ul className={styles.grid}>
          {items.map(p => (
            <li key={p.slug} className={styles.card}>
              <Link href={`/platy/${p.slug}`} className={styles.cardLink}>
                <span className={styles.thumbWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/board-photos/${p.slug}/image`}
                    width={p.imageWidth}
                    height={p.imageHeight}
                    alt={p.title}
                    className={styles.thumb}
                    loading="lazy"
                  />
                </span>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardMeta}>
                  <span className={styles.cardBadge}>{deviceTypeLabel(p.deviceType)}</span>
                  {p.chip && <span className={styles.cardChip}>{p.chip}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Написать `BoardPhotoGrid.module.css`**

```css
/* src/components/BoardPhotos/BoardPhotoGrid.module.css */
.wrap { width: 100%; }
.filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.search { width: 100%; padding: 10px 14px; border: 1px solid #d1d9e6; border-radius: 12px; font-size: 15px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 6px 14px; border-radius: 999px; border: 1px solid #d1d9e6; background: #fff; font-size: 14px; cursor: pointer; }
.chip:hover { border-color: #0a1929; }
.chipActive { background: #0a1929; color: #fff; border-color: #0a1929; }
.state { color: #6b7280; padding: 24px 0; }
.grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.card { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #fff; transition: box-shadow .15s, transform .15s; }
.card:hover { box-shadow: 0 8px 24px rgba(10,25,41,.12); transform: translateY(-2px); }
.cardLink { display: flex; flex-direction: column; text-decoration: none; color: inherit; height: 100%; }
.thumbWrap { display: block; background: #0d2033; aspect-ratio: 4 / 3; overflow: hidden; }
.thumb { width: 100%; height: 100%; object-fit: contain; }
.cardTitle { padding: 12px 14px 4px; font-weight: 700; font-size: 15px; line-height: 1.35; color: #0a1929; }
.cardMeta { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 14px 14px; }
.cardBadge { background: #0a1929; color: #fff; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.cardChip { background: #eef2f7; color: #0a1929; padding: 3px 10px; border-radius: 999px; font-size: 12px; }
```

- [ ] **Step 3: Написать `/platy/page.js`**

```jsx
// src/app/platy/page.js
import BoardPhotoGrid from '@/components/BoardPhotos/BoardPhotoGrid';
import { BASE_URL } from '@/lib/constants';
import styles from './platy.module.css';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata = {
  title: 'Фото плат с замерами — видеокарты, ноутбуки, телефоны | СЕРВИС БОКС',
  description:
    'Фотографии плат с нанесёнными точками замера сопротивления: видеокарты, материнские платы ноутбуков, телефоны. Справочник сервисного центра СЕРВИС БОКС в Вологде.',
  alternates: { canonical: `${BASE_URL}/platy` },
  keywords: 'фото плат, замеры сопротивления, распиновка платы, ремонт видеокарт, ремонт материнских плат, СЕРВИС БОКС Вологда',
  openGraph: {
    title: 'Фото плат с замерами | СЕРВИС БОКС',
    description: 'Справочник фотографий плат с точками замера — видеокарты, ноутбуки, телефоны.',
    url: `${BASE_URL}/platy`,
    siteName: 'СЕРВИС БОКС Вологда',
    locale: 'ru_RU',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${BASE_URL}/platy`,
  url: `${BASE_URL}/platy`,
  name: 'Фото плат с замерами',
  description: 'Фотографии плат с точками замера сопротивления.',
  about: { '@id': `${BASE_URL}#business` },
  isPartOf: { '@id': `${BASE_URL}#website` },
};

export default function PlatyPage() {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={styles.header}>
        <h1 className={styles.title}>Фото плат с замерами</h1>
        <p className={styles.subtitle}>
          Снимки плат с нанесёнными точками замера сопротивления — видеокарты, материнские
          платы ноутбуков, телефоны. Пополняется мастерами СЕРВИС БОКС.
        </p>
      </header>
      <BoardPhotoGrid />
    </main>
  );
}
```

- [ ] **Step 4: Написать `platy.module.css`**

```css
/* src/app/platy/platy.module.css */
.page { max-width: 1100px; margin: 0 auto; padding: 24px 16px 64px; }
.header { margin-bottom: 24px; }
.title { font-size: clamp(1.6rem, 1rem + 2.5vw, 2.5rem); font-weight: 800; margin: 0 0 8px; color: var(--color-primary-dark, #0a1929); }
.subtitle { margin: 0; color: var(--color-text-muted, #6b7280); max-width: 640px; line-height: 1.55; }
```

- [ ] **Step 5: Собрать, перезапустить, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:|/platy"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
H=$(curl -s "http://127.0.0.1:3123/platy")
echo "$H" | grep -oE "<h1[^>]*>[^<]*"
echo "$H" | grep -oE '"@type":"CollectionPage"'
echo "$H" | grep -oE '<link rel="canonical" href="[^"]*"'
echo "status: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3123/platy)"
```
Expected: `<h1 ...>Фото плат с замерами`, `"@type":"CollectionPage"`, canonical `.../platy`, `status: 200`. Карточки грузятся клиентом (в SSR-HTML их может не быть — это ок, `BoardPhotoGrid` клиентский).

- [ ] **Step 6: Commit**

```bash
git add src/components/BoardPhotos/BoardPhotoGrid.js src/components/BoardPhotos/BoardPhotoGrid.module.css src/app/platy/page.js src/app/platy/platy.module.css
git commit -m "feat(platy): раздел /platy + компонент BoardPhotoGrid"
```

---

## Task 8: Вкладка «Платы» на `/depository-public`

**Files:**
- Modify: `src/components/DepositoryPublic/DepositoryPublic.js`

**Interfaces:**
- Consumes: `<BoardPhotoGrid />` (Task 7).
- Produces: на `/depository-public` — переключатель «Файлы» / «Платы»; на «Платы» рендерится `BoardPhotoGrid` + ссылка «Открыть раздел `/platy`».

- [ ] **Step 1: Прочитать текущий `DepositoryPublic.js` целиком** (он менялся в пункте B — важен актуальный вид `return`).

- [ ] **Step 2: Добавить импорт и стейт вкладки**

В начало файла — импорт:
```js
import Link from 'next/link';
import BoardPhotoGrid from '@/components/BoardPhotos/BoardPhotoGrid';
```
После `const { user, loading: authLoading } = useAuth();`:
```js
    const [activeTab, setActiveTab] = useState('files'); // 'files' | 'boards'
```

- [ ] **Step 3: Обернуть текущий контент во вкладку и добавить вторую**

Найти в `return (...)` блок после `<div className={styles.header}>…</div>` (заголовок «Депозитарий файлов»). Сразу под ним вставить переключатель, а весь существующий блок с фильтрами + списком файлов (от `<div className={styles.filters}>` до закрывающего его региона) обернуть в `{activeTab === 'files' && ( … )}`. Добавить блок вкладки «Платы»:

```jsx
      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'files' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('files')}
        >Файлы</button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'boards' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('boards')}
        >Фото плат</button>
      </div>

      {activeTab === 'boards' && (
        <div>
          <p className={styles.boardsIntro}>
            Фото плат с точками замера сопротивления.{' '}
            <Link href="/platy">Открыть весь раздел →</Link>
          </p>
          <BoardPhotoGrid />
        </div>
      )}

      {activeTab === 'files' && (
        <>
          {/* ← сюда переносится ВЕСЬ текущий блок фильтров + таблицы/карточек файлов */}
        </>
      )}
```

- [ ] **Step 4: Добавить стили вкладок в `DepositoryPublic.module.css`**

```css
.tabs { display: flex; gap: 8px; margin: 16px 0 20px; border-bottom: 1px solid #e2e8f0; }
.tabBtn { padding: 10px 18px; border: none; background: none; font-size: 15px; font-weight: 600; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; }
.tabBtn:hover { color: #0a1929; }
.tabBtnActive { color: #0a1929; border-bottom-color: #0a1929; }
.boardsIntro { margin: 0 0 16px; color: #6b7280; }
.boardsIntro a { color: #0a1929; font-weight: 600; }
```

- [ ] **Step 5: Собрать, перезапустить, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
curl -s "http://127.0.0.1:3123/depository-public" | grep -oE 'Фото плат|Файлы' | sort -u
curl -s -o /dev/null -w "depository-public: %{http_code}\n" "http://127.0.0.1:3123/depository-public"
```
Expected: обе метки вкладок в HTML, `depository-public: 200`. Визуально (если есть браузер-инструмент) — переключение вкладок, на «Фото плат» видна сетка, гостю доступно.

- [ ] **Step 6: Commit**

```bash
git add src/components/DepositoryPublic/DepositoryPublic.js src/components/DepositoryPublic/DepositoryPublic.module.css
git commit -m "feat(platy): вкладка «Фото плат» на /depository-public"
```

---

## Task 9: Админская вкладка «Платы» в `/admin-panel/depository`

**Files:**
- Create: `src/components/depository/BoardPhotoUpload.js`
- Create: `src/components/depository/BoardPhotoUpload.module.css`
- Create: `src/components/depository/BoardPhotoAdminList.js`
- Create: `src/components/depository/BoardPhotoAdminList.module.css`
- Modify: `src/app/admin-panel/depository/page.js`

**Interfaces:**
- Consumes: `POST /api/admin/board-photos` (Task 2), `PATCH`/`DELETE /api/admin/board-photos/[id]` (Task 6), `GET /api/board-photos` (Task 3), `DEVICE_TYPES` + `deviceTypeLabel` (Task 1).
- Produces: 4-я вкладка «Платы» в админ-панели депозитария.

- [ ] **Step 1: `BoardPhotoUpload.js`**

```jsx
// src/components/depository/BoardPhotoUpload.js
'use client';
import { useRef, useState } from 'react';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoUpload.module.css';

export default function BoardPhotoUpload({ onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [deviceType, setDeviceType] = useState('videocard');
  const [chip, setChip] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { setMsg({ type: 'err', text: 'Файл больше 15 МБ' }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setMsg({ type: 'err', text: 'Выберите фото' }); return; }
    if (title.trim().length < 3) { setMsg({ type: 'err', text: 'Название — минимум 3 символа' }); return; }
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title.trim());
      fd.append('deviceType', deviceType);
      fd.append('chip', chip.trim());
      fd.append('description', description.trim());
      const res = await fetch('/api/admin/board-photos', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      setMsg({ type: 'ok', text: 'Загружено: ' + data.boardPhoto.slug });
      setFile(null); setPreview(''); setTitle(''); setChip(''); setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded?.();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label}>Фото платы (JPEG/PNG/WebP, до 15 МБ)</label>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className={styles.file} />
      {preview && <img src={preview} alt="Предпросмотр" className={styles.preview} />}

      <label className={styles.label}>Название платы *</label>
      <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Palit GTX 1060 6ГБ, чип GP106-401-A1" />

      <label className={styles.label}>Тип устройства</label>
      <select className={styles.input} value={deviceType} onChange={e => setDeviceType(e.target.value)}>
        {DEVICE_TYPES.map(t => <option key={t} value={t}>{deviceTypeLabel(t)}</option>)}
      </select>

      <label className={styles.label}>Чип (опц.)</label>
      <input className={styles.input} value={chip} onChange={e => setChip(e.target.value)} placeholder="GP106-401-A1" />

      <label className={styles.label}>Описание (опц.)</label>
      <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} rows={3} />

      <button className={styles.submit} disabled={busy}>{busy ? 'Загрузка…' : 'Загрузить'}</button>
      {msg && <p className={msg.type === 'ok' ? styles.ok : styles.err}>{msg.text}</p>}
    </form>
  );
}
```

- [ ] **Step 2: `BoardPhotoUpload.module.css`**

```css
/* src/components/depository/BoardPhotoUpload.module.css */
.form { display: flex; flex-direction: column; gap: 8px; max-width: 520px; }
.label { font-weight: 600; font-size: 14px; margin-top: 8px; }
.file { padding: 8px 0; }
.preview { max-width: 320px; border-radius: 12px; border: 1px solid #e2e8f0; }
.input { padding: 9px 12px; border: 1px solid #d1d9e6; border-radius: 10px; font-size: 14px; }
.textarea { padding: 9px 12px; border: 1px solid #d1d9e6; border-radius: 10px; font-size: 14px; resize: vertical; }
.submit { margin-top: 12px; padding: 11px 20px; background: #0a1929; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
.submit:disabled { opacity: .6; cursor: default; }
.ok { color: #067647; }
.err { color: #b42318; }
```

- [ ] **Step 3: `BoardPhotoAdminList.js`**

```jsx
// src/components/depository/BoardPhotoAdminList.js
'use client';
import { useEffect, useState, useCallback } from 'react';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoAdminList.module.css';

export default function BoardPhotoAdminList({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});

  const load = useCallback(() => {
    fetch('/api/board-photos')
      .then(r => r.json())
      .then(d => setItems(d.boardPhotos || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const startEdit = (p) => { setEditId(p._id); setDraft({ ...p }); };
  const save = async () => {
    const res = await fetch(`/api/admin/board-photos/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title, slug: draft.slug, deviceType: draft.deviceType,
        chip: draft.chip, description: draft.description, isActive: draft.isActive,
      }),
    });
    if (res.ok) { setEditId(null); load(); }
    else alert((await res.json()).error || 'Ошибка');
  };
  const remove = async (id) => {
    if (!confirm('Удалить фото платы?')) return;
    const res = await fetch(`/api/admin/board-photos/${id}`, { method: 'DELETE' });
    if (res.ok) load(); else alert('Ошибка удаления');
  };

  return (
    <div className={styles.list}>
      {items.length === 0 && <p>Пока нет фотографий плат.</p>}
      {items.map(p => (
        <div key={p._id} className={styles.row}>
          <img src={`/api/board-photos/${p.slug}/image`} alt="" className={styles.thumb} loading="lazy" />
          {editId === p._id ? (
            <div className={styles.editBox}>
              <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
              <input value={draft.slug} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} placeholder="slug" />
              <select value={draft.deviceType} onChange={e => setDraft(d => ({ ...d, deviceType: e.target.value }))}>
                {DEVICE_TYPES.map(t => <option key={t} value={t}>{deviceTypeLabel(t)}</option>)}
              </select>
              <input value={draft.chip || ''} onChange={e => setDraft(d => ({ ...d, chip: e.target.value }))} placeholder="чип" />
              <textarea value={draft.description || ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={2} />
              <label><input type="checkbox" checked={!!draft.isActive} onChange={e => setDraft(d => ({ ...d, isActive: e.target.checked }))} /> Активна</label>
              <div className={styles.btns}>
                <button onClick={save}>Сохранить</button>
                <button onClick={() => setEditId(null)}>Отмена</button>
              </div>
            </div>
          ) : (
            <div className={styles.info}>
              <strong>{p.title}</strong>
              <span>{deviceTypeLabel(p.deviceType)}{p.chip ? ` · ${p.chip}` : ''}</span>
              <div className={styles.btns}>
                <a href={`/platy/${p.slug}`} target="_blank" rel="noreferrer">Открыть</a>
                <button onClick={() => startEdit(p)}>Править</button>
                <button onClick={() => remove(p._id)}>Удалить</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

Примечание: `GET /api/board-photos` отдаёт только `isActive:true` — деактивированные в админ-списке не видны. Для v1 это приемлемо (деактивация = «скрыть»); если нужно управлять скрытыми, добавить `?all=1` в Task 3 позже. **Зафиксировать это ограничение в описании задачи, не расширять.**

- [ ] **Step 4: `BoardPhotoAdminList.module.css`**

```css
/* src/components/depository/BoardPhotoAdminList.module.css */
.list { display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; gap: 14px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; }
.thumb { width: 120px; height: 90px; object-fit: contain; background: #0d2033; border-radius: 8px; flex-shrink: 0; }
.info { display: flex; flex-direction: column; gap: 4px; }
.editBox { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.editBox input, .editBox select, .editBox textarea { padding: 6px 10px; border: 1px solid #d1d9e6; border-radius: 8px; }
.btns { display: flex; gap: 10px; margin-top: 6px; }
.btns button, .btns a { padding: 5px 12px; border: 1px solid #d1d9e6; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; text-decoration: none; color: #0a1929; }
```

- [ ] **Step 5: Подключить 4-ю вкладку в `src/app/admin-panel/depository/page.js`**

Импорты:
```js
import BoardPhotoUpload from '@/components/depository/BoardPhotoUpload';
import BoardPhotoAdminList from '@/components/depository/BoardPhotoAdminList';
```
В блок `<div className={styles.tabs}>` добавить кнопку:
```jsx
        <button
          className={`${styles.tab} ${activeTab === 'boards' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('boards')}
        >
          Платы
        </button>
```
В `<div className={styles.content}>` добавить:
```jsx
        {activeTab === 'boards' && (
          <div>
            <BoardPhotoUpload onUploaded={handleFileUploaded} />
            <hr style={{ margin: '24px 0' }} />
            <BoardPhotoAdminList refreshKey={refreshKey} />
          </div>
        )}
```

- [ ] **Step 6: Собрать, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
```
Expected: `Compiled successfully`. Функциональная проверка формы — вручную под админом в браузере (загрузка → фото появляется в списке и на `/platy`).

- [ ] **Step 7: Commit**

```bash
git add src/components/depository/BoardPhotoUpload.js src/components/depository/BoardPhotoUpload.module.css src/components/depository/BoardPhotoAdminList.js src/components/depository/BoardPhotoAdminList.module.css src/app/admin-panel/depository/page.js
git commit -m "feat(platy): админская вкладка «Платы» (загрузка + список)"
```

---

## Task 10: Sitemap и robots

**Files:**
- Modify: `src/app/sitemap.js`
- Modify: `src/app/robots.js`

**Interfaces:**
- Consumes: `BoardPhoto` (Task 1).
- Produces: `/platy` и `/platy/<slug>` в `sitemap.xml`; `/platy/` в `robots.txt`.

- [ ] **Step 1: `sitemap.js` — добавить статический URL**

В массив `staticUrls` (там, где `['/gallery', 0.7, 'monthly']` и т.п.) добавить строку:
```js
    ['/platy', 0.6, 'monthly'],
```

- [ ] **Step 2: `sitemap.js` — добавить запрос и записи**

В деструктуризацию `Promise.all([...])` добавить (импортировав модель вверху файла: `import BoardPhoto from '@/models/BoardPhoto';`):
```js
      BoardPhoto.find({ isActive: true }, { slug: 1, updatedAt: 1 }).lean(),
```
и соответствующую переменную `boardPhotos` в список слева от `= await Promise.all`.

В формирование `dbUrls` добавить:
```js
      ...boardPhotos.filter(b => b.slug).map(b => createEntry(`/platy/${encodeURIComponent(b.slug)}`, 0.7, 'monthly', b.updatedAt)),
```

- [ ] **Step 3: `robots.js` — добавить в allow-список AI-краулеров**

Во втором правиле (userAgent-массив AI-ботов), в `allow: [...]`, добавить:
```js
          '/platy/', '/api/board-photos/',
```

- [ ] **Step 4: Собрать, перезапустить, проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
pkill -f "src/server.js"; sleep 1; (PORT=3123 npm start > /tmp/sb-srv.log 2>&1 &)
for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3123/); [ "$c" = "200" ] && break; sleep 4; done; echo up
curl -s "http://127.0.0.1:3123/sitemap.xml" | grep -oE "<loc>[^<]*/platy[^<]*</loc>" | head
curl -s "http://127.0.0.1:3123/robots.txt" | grep -E "/platy/|/api/board-photos/"
```
Expected: `<loc>…/platy</loc>` + по строке на каждое активное фото; robots содержит `/platy/`.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.js src/app/robots.js
git commit -m "feat(platy): /platy и фото плат в sitemap.xml + robots.txt"
```

---

## Task 11: Визуальная доводка (ui-ux-pro-max)

**Files:**
- Modify: `src/app/platy/[slug]/boardPhoto.module.css`
- Modify: `src/app/platy/platy.module.css`
- Modify: `src/components/BoardPhotos/BoardPhotoGrid.module.css`
- Modify (при необходимости): `src/app/platy/[slug]/page.js`, `src/components/BoardPhotos/BoardPhotoGrid.js` (разметка под новые стили, без изменения логики)

**Interfaces:** без изменений — только визуал.

- [ ] **Step 1: Вызвать навык `ui-ux-pro-max`** для раздела «Фото плат» с контекстом: тёмный технический лук (синий мат стола на реальных снимках плат), консистентность с текущим сайтом (`--color-primary-dark: #0a1929`, шрифты Inter/Inter Tight из `layout.js`), 3 поверхности — сетка карточек, страница фото, вкладка на `/depository-public`. Референс-фото: `~/Desktop/IMG_0024.jpg`, `~/Desktop/IMG_0006.JPG`.

- [ ] **Step 2: Применить рекомендации** к трём `*.module.css` (и точечно к разметке), сохраняя: `<img width height>` без `next/image`, семантику (`<h1>` один на странице фото, `<nav>` крошки), контраст ≥ 4.5:1, отзывчивость 320/768/1024/1440 без горизонтального скролла.

- [ ] **Step 3: Проверить**

```bash
npm run build 2>&1 | grep -E "Compiled successfully|Failed|Error:"
```
Плюс визуально (браузер-инструмент, если доступен): скриншоты `/platy`, `/platy/<slug>`, вкладка на `/depository-public` на 375 и 1280.

- [ ] **Step 4: Commit**

```bash
git add src/app/platy src/components/BoardPhotos
git commit -m "style(platy): визуальная доводка раздела «Фото плат»"
```

---

## Финализация раздела

- [ ] **Прогнать полный тест-план из спеки** (`docs/superpowers/specs/2026-09-01-board-photos-design.md`, §Тест-план, пункты 1–13) на локальном прод-сервере.
- [ ] **Удалить тестовые записи**, залитые в ходе разработки (оставить только 2 реальных: Palit GTX 1060 и SR3YY/n18e-g2-a1), либо решить с Toma, что публикуем.
- [ ] **Независимый аудит кода** всего раздела (отдельный ревьюер, чистый контекст): модель, все 5 роутов, 2 страницы, 3 клиентских компонента, изменения в sitemap/robots/DepositoryPublic. Проверить: гейты админских роутов, отсутствие обхода отдачи файла, `revalidatePath` вызывается во всех мутациях, `await params` везде, нет `console.log` с PII, нет латинского «ServiceBox» в текстах, XSS в `dangerouslySetInnerHTML` (только `JSON.stringify` объекта — ок).
- [ ] **Исправить findings** аудита, при необходимости — повторный аудит изменённых мест.
- [ ] **Деплой:** `git push origin main` → `ssh root@185.221.215.248` → `cd /var/www/servicebox-repair && git status` (дрифт — только `public/uploads/`) → `git pull && npm run build && pm2 restart servicebox-repair`.
- [ ] **Проверка прода:** `curl` — `/platy` 200, `/platy/<slug>` SSR c h1/canonical/og/JSON-LD, `/api/board-photos/<slug>/image` 200 `image/webp`, `/sitemap.xml` содержит URL, `/robots.txt` содержит `/platy/`, `/depository-public` показывает вкладку «Фото плат» гостю.
- [ ] **Загрузить 2 реальных фото через прод-админку** (если не мигрировали данные), проверить что страницы отдаются без рестарта pm2.
- [ ] В Яндекс.Вебмастере / GSC — добавить `/platy` на переобход.

---

## Self-Review (выполнено автором плана)

**Покрытие спеки:**
- Модель `BoardPhoto` → Task 1 ✓
- Хелперы (labels, service map, description) → Task 1 ✓
- `POST /api/admin/board-photos` (sharp .rotate, resolveWithObject, slug, revalidatePath, гейт) → Task 2 ✓
- `GET /api/board-photos` + `/[slug]` → Task 3 ✓
- `GET /api/board-photos/[slug]/image` (readFile, immutable cache, B1) → Task 4 ✓
- `/platy/[slug]` (force-static, dynamicParams, generateStaticParams из БД, generateMetadata, JSON-LD ImageObject+BreadcrumbList, CTA, крошки, await params) → Task 5 ✓
- `PATCH`/`DELETE /api/admin/board-photos/[id]` (revalidatePath обоих путей, unlink не роняет, гейт, isValidObjectId) → Task 6 ✓
- `/platy` + `BoardPhotoGrid` (фильтр в deps useEffect — G из аудита) → Task 7 ✓
- Вкладка на `/depository-public` (не ломая пункт B) → Task 8 ✓
- Админ-вкладка (upload + list) → Task 9 ✓
- sitemap + robots → Task 10 ✓
- Стиль ui-ux-pro-max → Task 11 ✓
- Независимый аудит + деплой + проверка прода → Финализация ✓
- Побочная находка (открытая загрузка `/api/depository/files`) → вынесена в спеку как отдельная задача, в этот план НЕ входит ✓

**Плейсхолдеры:** нет «TBD/TODO/добавить обработку ошибок» — все обработчики ошибок с кодом и статусами. Тест-шаги — с реальными `curl`.

**Консистентность типов/имён:** `imageName` (не `filename`/`filePath`) везде — модель, POST, image-роут, DELETE. `deviceType` enum из `DEVICE_TYPES` — модель, POST-валидация, PATCH, grid, форма. `slug` не меняется автоматически при PATCH title (спека) — в Task 6 `patch.slug` только из явного `body.slug`. `BOARD_PHOTOS_DIR` — один источник в `boardPhotos.js`, импортируется в Task 2/4/6. `boardPhotoDescription(doc)` принимает объект с `{title, chip, description, deviceType}` — вызовы в Task 5 (`generateMetadata`, page) передают `doc` целиком ✓.
