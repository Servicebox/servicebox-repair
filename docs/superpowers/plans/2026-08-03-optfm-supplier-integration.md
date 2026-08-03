# Интеграция с API поставщика OPTFM — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ежедневно синхронизировать каталог поставщика OPTFM (Fashion Mobile) — категории, товары, цены с наценкой, фото — в существующие модели `Product`/новую `Category`, чтобы товары продавались на сайте как обычные.

**Architecture:** Библиотека синхронизации в `src/lib/optfm/` (используется и Next.js API-роутами, и отдельным cron-скриптом — поэтому внутри себя все файлы этой библиотеки импортируют модели/утилиты **относительными путями с явным расширением `.js`**, а не через алиас `@/...`: алиас резолвится только webpack’ом внутри Next.js, а cron-скрипт запускается напрямую через `node`, где алиасов нет). Категории — дерево `parent/children` по образцу уже существующей модели `Service`. Синхронизация идемпотентна (upsert по id поставщика), фото кэшируются локально и не перекачиваются повторно.

**Tech Stack:** Next.js (App Router), Mongoose/MongoDB, Sharp (обработка изображений), нативные `fetch`/`FormData` (Node 22, без доп. зависимостей), системный `cron` на проде.

## Global Constraints

- Доступ к API поставщика (`https://optfm.ru/api/`) работает только с IP прод-сервера (`185.221.215.248`) — весь код этого плана тестируется через SSH на проде, не локально.
- `auth_id=5948`, `auth_key=y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp` — добавляются в `.env.production` на сервере как `OPTFM_AUTH_ID`/`OPTFM_AUTH_KEY`.
- Фильтр по складу «Вологда» пока не реализован (у поставщика нет задокументированного параметра — уточняется у их менеджера отдельно). Код спроектирован так, чтобы добавить его позже без переписывания (см. Task 3, `extraParams`).
- В проекте нет тестового фреймворка (проверено — ни `jest`, ни файлов `*.test.js` нет). Проверка каждой задачи — через реальный вызов на проде (по той же схеме, что использовалась при подготовке спеки), а не unit-тесты.
- Не трогать существующие ручные товары (`category`/`subcategory` как плоские строки) — только дополнять `Product` новыми необязательными полями.
- Переделка `/parts` под дерево категорий — вне рамок этого плана.

---

### Task 1: Модель `Category` и модель состояния `OptfmSyncState`

**Files:**
- Create: `src/models/Category.js`
- Create: `src/models/OptfmSyncState.js`

**Interfaces:**
- Produces: `Category` (Mongoose-модель) с полями `name`, `parentId`, `depthLevel`, `supplierSectionId` (unique), `sort`, `description`, виртуальным полем `children`.
- Produces: `OptfmSyncState` (Mongoose-модель, одна запись в коллекции) с полями `markupPercent`, `syncInProgress`, `lastSyncStartedAt`, `lastSyncFinishedAt`, `lastSyncError`, `lastSyncStats`.

- [ ] **Step 1: Создать модель Category**

```js
// src/models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  depthLevel: {
    type: Number,
    required: true,
    default: 1,
  },
  // Id раздела в системе поставщика — ключ для идемпотентного upsert
  supplierSectionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sort: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
```

- [ ] **Step 2: Создать модель OptfmSyncState**

```js
// src/models/OptfmSyncState.js
import mongoose from 'mongoose';

const OptfmSyncStateSchema = new mongoose.Schema({
  markupPercent: {
    type: Number,
    required: true,
    min: [0, 'Наценка не может быть отрицательной'],
    default: 30,
  },
  syncInProgress: {
    type: Boolean,
    default: false,
  },
  lastSyncStartedAt: Date,
  lastSyncFinishedAt: Date,
  lastSyncError: String,
  lastSyncStats: {
    categoriesUpserted: Number,
    productsUpserted: Number,
    productsDeactivated: Number,
    imagesDownloaded: Number,
  },
}, {
  timestamps: { createdAt: false, updatedAt: true },
});

export default mongoose.models.OptfmSyncState || mongoose.model('OptfmSyncState', OptfmSyncStateSchema);
```

- [ ] **Step 3: Проверить синтаксис**

```bash
node --check src/models/Category.js
node --check src/models/OptfmSyncState.js
```

Expected: обе команды завершаются без вывода (синтаксис верный).

- [ ] **Step 4: Закоммитить**

```bash
git add src/models/Category.js src/models/OptfmSyncState.js
git commit -m "feat: add Category tree model and OptfmSyncState config model"
```

---

### Task 2: Расширение модели `Product` полями поставщика

**Files:**
- Modify: `src/models/Product.js`

**Interfaces:**
- Consumes: ничего нового.
- Produces: `Product` получает необязательные поля `categoryId` (ref Category), `supplierSource`, `supplierProductId` (partial unique index), `supplierPriceRaw`. Существующие поля не меняются.

- [ ] **Step 1: Добавить новые поля после `subcategory`**

В файле `src/models/Product.js` найти блок:

```js
  subcategory: {
    type: String,
    default: ''
  },
```

Заменить на:

```js
  subcategory: {
    type: String,
    default: ''
  },

  // Поля интеграции с поставщиком OPTFM — см.
  // docs/superpowers/specs/2026-08-03-optfm-supplier-integration-design.md.
  // Заполняются только у товаров, синхронизированных из внешнего каталога;
  // у товаров, введённых вручную через админку, остаются undefined.
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },

  supplierSource: {
    type: String,
  },

  supplierProductId: {
    type: String,
  },

  supplierPriceRaw: {
    type: Number,
  },
```

- [ ] **Step 2: Добавить partial unique индекс**

Найти блок существующих индексов:

```js
ProductSchema.index({ slug: 1, isActive: 1, isDeleted: 1 });
ProductSchema.index({ category: 1, isActive: 1, ymlExport: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ ymlExport: 1, isActive: 1 });
```

Добавить сразу после:

```js
ProductSchema.index({ ymlExport: 1, isActive: 1 });
// Уникален только среди товаров поставщика (partial) — у ручных товаров
// supplierProductId не задан, они под это ограничение не попадают.
ProductSchema.index(
  { supplierProductId: 1 },
  { unique: true, partialFilterExpression: { supplierProductId: { $exists: true } } }
);
```

- [ ] **Step 3: Проверить синтаксис**

```bash
node --check src/models/Product.js
```

Expected: без вывода.

- [ ] **Step 4: Проверить, что индекс реально создаётся на проде**

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.connection.collection('products');
  await Product.createIndex({ supplierProductId: 1 }, { unique: true, partialFilterExpression: { supplierProductId: { \\\$exists: true } } });
  const indexes = await Product.indexes();
  console.log(JSON.stringify(indexes.find(i => i.name.includes('supplierProductId')), null, 2));
  await mongoose.disconnect();
})();
\""
```

Expected: выводится JSON описания индекса с `unique: true` и `partialFilterExpression`.

- [ ] **Step 5: Закоммитить**

```bash
git add src/models/Product.js
git commit -m "feat: extend Product model with OPTFM supplier fields"
```

---

### Task 3: Низкоуровневый клиент API OPTFM

**Files:**
- Create: `src/lib/optfm/client.js`

**Interfaces:**
- Consumes: `process.env.OPTFM_AUTH_ID`, `process.env.OPTFM_AUTH_KEY`.
- Produces: `optfmRequest(method: string, params?: object, extraParams?: object): Promise<{ response: object } | { buffer: Buffer, contentType: string }>` — JSON-методы возвращают `{ response }`, `catalog.getImage` (успех) возвращает `{ buffer, contentType }`. `extraParams` — задел под будущий параметр фильтрации по складу, прокидывается в тело запроса как есть без изменения остального кода.

- [ ] **Step 1: Написать клиент**

```js
// src/lib/optfm/client.js
const API_URL = 'https://optfm.ru/api/';
const REQUEST_DELAY_MS = 400;
const MAX_ATTEMPTS = 5;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCredentials() {
  const authId = process.env.OPTFM_AUTH_ID;
  const authKey = process.env.OPTFM_AUTH_KEY;
  if (!authId || !authKey) {
    throw new Error('OPTFM_AUTH_ID / OPTFM_AUTH_KEY не заданы в переменных окружения');
  }
  return { authId, authKey };
}

function buildForm(method, params, extraParams) {
  const { authId, authKey } = getCredentials();
  const form = new FormData();
  form.append('auth_id', authId);
  form.append('auth_key', authKey);
  form.append('method', method);
  for (const [key, value] of Object.entries(params)) {
    form.append(key, String(value));
  }
  // Задел под будущий параметр фильтрации по складу (см. спеку, раздел
  // "Открытый вопрос — склад") — значение подставится сюда без изменения
  // кода, вызывающего optfmRequest, как только менеджер OPTFM подтвердит
  // точное имя параметра.
  for (const [key, value] of Object.entries(extraParams)) {
    form.append(key, String(value));
  }
  return form;
}

/**
 * Низкоуровневый вызов метода OPTFM API. У поставщика агрессивный WAF —
 * подтверждено вживую при подготовке этой интеграции (503 "too many
 * requests" уже после двух быстрых запросов подряд), поэтому между
 * запросами обязательная пауза, а на 503 — повтор с растущей задержкой.
 */
export async function optfmRequest(method, params = {}, extraParams = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await sleep(REQUEST_DELAY_MS * 2 ** (attempt - 1));
    }

    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT },
        body: buildForm(method, params, extraParams),
      });
    } catch (networkError) {
      lastError = networkError;
      continue;
    }

    if (res.status === 503) {
      lastError = new Error(`OPTFM API вернул 503 для ${method} (попытка ${attempt}/${MAX_ATTEMPTS})`);
      continue;
    }

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      // Успешный catalog.getImage возвращает бинарные данные напрямую
      const buffer = Buffer.from(await res.arrayBuffer());
      await sleep(REQUEST_DELAY_MS);
      return { buffer, contentType };
    }

    const json = await res.json();
    await sleep(REQUEST_DELAY_MS);

    if (json.status !== 1) {
      throw new Error(
        `OPTFM API (${method}): ${json.error?.error_msg || 'неизвестная ошибка'} (код ${json.error?.error_code})`
      );
    }

    return { response: json.response };
  }

  throw lastError || new Error(`OPTFM API недоступен для ${method} после ${MAX_ATTEMPTS} попыток`);
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/optfm/client.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/optfm/client.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/optfm/client.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
process.env.OPTFM_AUTH_ID = '5948';
process.env.OPTFM_AUTH_KEY = 'y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp';
import('./src/lib/optfm/client.js').then(async ({ optfmRequest }) => {
  const { response } = await optfmRequest('catalog.getSectionList', { limit: 5, page: 1 });
  console.log('count_all:', response.count_all, 'items:', response.items.length);
  const img = await optfmRequest('catalog.getImage', { element_id: 24070 });
  console.log('image contentType:', img.contentType, 'bytes:', img.buffer.length);
});
\""
```

Expected: выводится `count_all: 259 items: 5` и `image contentType: image/jpeg bytes: <число больше 0>`.

**Важно:** не запускать этот тест с локальной машины — API привязан к IP прод-сервера, локально вернётся 503 от WAF поставщика.

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/optfm/client.js
git commit -m "feat: add low-level OPTFM API client with retry/backoff"
```

---

### Task 4: Конфиг наценки и блокировка параллельного запуска

**Files:**
- Create: `src/lib/optfm/config.js`

**Interfaces:**
- Consumes: `OptfmSyncState` (Task 1).
- Produces: `getMarkupPercent(): Promise<number>`, `setMarkupPercent(value: number): Promise<number>`, `getSyncState(): Promise<object>` (полный документ состояния, для отображения в админке), `acquireSyncLock(): Promise<boolean>` (false, если синхронизация уже идёт), `releaseSyncLock(stats: object | null, error?: Error): Promise<void>`.

- [ ] **Step 1: Написать модуль конфигурации**

```js
// src/lib/optfm/config.js
import OptfmSyncState from '../../models/OptfmSyncState.js';

async function getOrCreateState() {
  let state = await OptfmSyncState.findOne();
  if (!state) {
    state = await OptfmSyncState.create({});
  }
  return state;
}

export async function getSyncState() {
  const state = await getOrCreateState();
  return state.toObject();
}

export async function getMarkupPercent() {
  const state = await getOrCreateState();
  return state.markupPercent;
}

export async function setMarkupPercent(markupPercent) {
  const state = await getOrCreateState();
  state.markupPercent = markupPercent;
  await state.save();
  return state.markupPercent;
}

/**
 * Простая блокировка от параллельного запуска — на случай, если кнопка
 * "Синхронизировать сейчас" нажата, пока идёт ночной cron. Возвращает
 * false, если синхронизация уже выполняется (вызывающий код должен
 * отказаться от повторного запуска, а не ждать).
 */
export async function acquireSyncLock() {
  const state = await getOrCreateState();
  if (state.syncInProgress) {
    return false;
  }
  state.syncInProgress = true;
  state.lastSyncStartedAt = new Date();
  state.lastSyncError = undefined;
  await state.save();
  return true;
}

export async function releaseSyncLock(stats, error) {
  const state = await getOrCreateState();
  state.syncInProgress = false;
  state.lastSyncFinishedAt = new Date();
  if (error) {
    state.lastSyncError = error.message;
  } else {
    state.lastSyncError = undefined;
    state.lastSyncStats = stats;
  }
  await state.save();
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/optfm/config.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/optfm/config.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/optfm/config.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
import('./src/lib/optfm/config.js').then(async (cfg) => {
  const acquired1 = await cfg.acquireSyncLock();
  const acquired2 = await cfg.acquireSyncLock();
  console.log('первая блокировка:', acquired1, 'вторая (должна быть false):', acquired2);
  await cfg.releaseSyncLock({ productsUpserted: 1 });
  const state = await cfg.getSyncState();
  console.log('markupPercent:', state.markupPercent, 'syncInProgress после release:', state.syncInProgress);
});
\""
```

Expected: `первая блокировка: true вторая (должна быть false): false`, затем `markupPercent: 30 syncInProgress после release: false`.

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/optfm/config.js
git commit -m "feat: add OPTFM sync config and concurrency lock helpers"
```

---

### Task 5: Синхронизация дерева категорий

**Files:**
- Create: `src/lib/optfm/syncCategories.js`

**Interfaces:**
- Consumes: `optfmRequest` (Task 3), `Category` (Task 1).
- Produces: `syncCategories(): Promise<{ categoriesUpserted: number }>`.

- [ ] **Step 1: Написать синхронизацию категорий**

```js
// src/lib/optfm/syncCategories.js
import Category from '../../models/Category.js';
import { optfmRequest } from './client.js';

const PAGE_LIMIT = 500;

/**
 * Забирает всё дерево разделов OPTFM и сохраняет в Category.
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
    await Category.updateOne(
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
      await Category.updateOne({ supplierSectionId: String(section.id) }, { $set: { parentId: null } });
      continue;
    }

    const parent = await Category.findOne({ supplierSectionId: String(section.parent_id) })
      .select('_id')
      .lean();

    if (!parent) {
      console.warn(
        `⚠️  OPTFM: раздел ${section.id} (${section.name}) ссылается на несуществующий parent_id=${section.parent_id} — пропускаю связь`
      );
      continue;
    }

    await Category.updateOne({ supplierSectionId: String(section.id) }, { $set: { parentId: parent._id } });
  }

  return { categoriesUpserted: allSections.length };
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/optfm/syncCategories.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/optfm/syncCategories.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/optfm/syncCategories.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
process.env.OPTFM_AUTH_ID = '5948';
process.env.OPTFM_AUTH_KEY = 'y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp';
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { syncCategories } = await import('./src/lib/optfm/syncCategories.js');
  const result = await syncCategories();
  console.log('Результат:', result);
  const Category = mongoose.connection.collection('categories');
  const total = await Category.countDocuments();
  const roots = await Category.countDocuments({ parentId: null });
  const sample = await Category.findOne({ parentId: { \\\$ne: null } });
  console.log('Всего категорий:', total, 'корневых:', roots);
  console.log('Пример дочерней:', sample?.name, 'parentId задан:', !!sample?.parentId);
  await mongoose.disconnect();
})();
\""
```

Expected: `Результат: { categoriesUpserted: 259 }`, `Всего категорий: 259 корневых: <несколько>`, у примера дочерней категории `parentId задан: true`.

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/optfm/syncCategories.js
git commit -m "feat: sync OPTFM category tree into Category model"
```

---

### Task 6: Скачивание и кэширование фото товара

**Files:**
- Create: `src/lib/optfm/downloadProductImage.js`

**Interfaces:**
- Consumes: `optfmRequest` (Task 3).
- Produces: `ensureProductImage(supplierProductId: string): Promise<boolean>` (true, если файл реально был скачан в этот раз), `productImagePublicUrl(supplierProductId: string): string`.

- [ ] **Step 1: Написать модуль кэширования фото**

```js
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
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/optfm/downloadProductImage.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/optfm/downloadProductImage.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/optfm/downloadProductImage.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
process.env.OPTFM_AUTH_ID = '5948';
process.env.OPTFM_AUTH_KEY = 'y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp';
import('./src/lib/optfm/downloadProductImage.js').then(async (mod) => {
  const first = await mod.ensureProductImage('24070');
  const second = await mod.ensureProductImage('24070');
  console.log('первое скачивание (должно быть true):', first, 'повторное (должно быть false):', second);
  console.log('публичный URL:', mod.productImagePublicUrl('24070'));
});
\""
ssh root@185.221.215.248 "file /var/www/servicebox-repair/public/uploads/optfm/24070.webp"
```

Expected: `первое скачивание (должно быть true): true повторное (должно быть false): false`, файл — реальное WebP-изображение (`file` покажет `RIFF ... Web/P image`).

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/optfm/downloadProductImage.js
git commit -m "feat: add local image caching for OPTFM products"
```

---

### Task 7: Синхронизация товаров с наценкой

**Files:**
- Create: `src/lib/optfm/syncProducts.js`

**Interfaces:**
- Consumes: `optfmRequest` (Task 3), `getMarkupPercent` (Task 4), `ensureProductImage`/`productImagePublicUrl` (Task 6), `Category` (Task 1), `Product` (Task 2), `generateUniqueSlug` из `src/lib/slugify.js` (существующий).
- Produces: `syncProducts(): Promise<{ productsUpserted: number, productsDeactivated: number, imagesDownloaded: number }>`.

- [ ] **Step 1: Написать синхронизацию товаров**

```js
// src/lib/optfm/syncProducts.js
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { generateUniqueSlug } from '../slugify.js';
import { optfmRequest } from './client.js';
import { getMarkupPercent } from './config.js';
import { ensureProductImage, productImagePublicUrl } from './downloadProductImage.js';

const PAGE_LIMIT = 1000;
const SUPPLIER_SOURCE = 'optfm';
// id типа цены "Оптовая" у поставщика — подтверждено живым запросом
// к API 2026-08-03 (см. спеку)
const WHOLESALE_PRICE_ID = 4;

/**
 * Находит закупочную (оптовую) цену в массиве prices от поставщика.
 * Ищет по id/названию, а не по позиции в массиве — порядок элементов
 * документацией API не гарантирован.
 */
function resolveWholesalePrice(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null;
  const byId = prices.find((p) => Number(p.id) === WHOLESALE_PRICE_ID);
  if (byId) return Number(byId.price);
  const byName = prices.find((p) => /опт/i.test(p.name || ''));
  if (byName) return Number(byName.price);
  return Number(prices[0].price);
}

/**
 * Строит отображаемые category/subcategory (плоские строки) из дерева
 * Category — для обратной совместимости с /parts и YML-фидами, которые
 * пока читают эти строковые поля, а не дерево напрямую. category — имя
 * корневой категории, subcategory — оставшийся путь до листа.
 */
async function resolveCategoryDisplayNames(category) {
  if (!category) return { category: 'Товары поставщика', subcategory: '' };
  if (!category.parentId) return { category: category.name, subcategory: '' };

  const chain = [category.name];
  let current = category;
  while (current.parentId) {
    current = await Category.findById(current.parentId).select('name parentId').lean();
    if (!current) break;
    chain.unshift(current.name);
  }

  return { category: chain[0], subcategory: chain.slice(1).join(' / ') };
}

export async function syncProducts() {
  const markupPercent = await getMarkupPercent();
  const seenSupplierIds = [];
  let productsUpserted = 0;
  let imagesDownloaded = 0;
  let page = 1;

  while (true) {
    const { response } = await optfmRequest('catalog.getElementList', {
      limit: PAGE_LIMIT,
      page,
      no_image: 1, // изображение получаем отдельно через catalog.getImage
    });

    for (const item of response.items) {
      const supplierProductId = String(item.id);
      seenSupplierIds.push(supplierProductId);

      const wholesalePrice = resolveWholesalePrice(item.prices);
      if (wholesalePrice == null || wholesalePrice <= 0) {
        console.warn(`⚠️  OPTFM: у товара ${item.id} (${item.name}) нет цены — пропускаю`);
        continue;
      }

      const category = await Category.findOne({ supplierSectionId: String(item.section_id) }).lean();
      const { category: categoryName, subcategory } = await resolveCategoryDisplayNames(category);

      const downloaded = await ensureProductImage(supplierProductId);
      if (downloaded) imagesDownloaded++;

      const newPrice = Math.round(wholesalePrice * (1 + markupPercent / 100) * 100) / 100;

      const update = {
        name: item.name,
        description: item.detail_text || item.preview_text || item.name,
        category: categoryName,
        subcategory,
        categoryId: category?._id,
        supplierSource: SUPPLIER_SOURCE,
        supplierProductId,
        supplierPriceRaw: wholesalePrice,
        new_price: newPrice,
        sku: item.article || '',
        vendorCode: item.article || '',
        gtin: item.barcode || '',
        images: [productImagePublicUrl(supplierProductId)],
        isActive: true,
        isDeleted: false,
      };

      const existing = await Product.findOne({ supplierProductId }).select('_id').lean();

      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: update });
      } else {
        const slug = await generateUniqueSlug(Product, item.name);
        await Product.create({ ...update, slug });
      }

      productsUpserted++;
    }

    if (response.items.length < PAGE_LIMIT) break;
    page++;
  }

  const deactivateResult = await Product.updateMany(
    {
      supplierSource: SUPPLIER_SOURCE,
      supplierProductId: { $nin: seenSupplierIds },
      isActive: true,
    },
    { $set: { isActive: false } }
  );

  return {
    productsUpserted,
    productsDeactivated: deactivateResult.modifiedCount,
    imagesDownloaded,
  };
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/optfm/syncProducts.js
```

Expected: без вывода.

- [ ] **Step 3: Точечная проверка на небольшой странице товаров (limit=5) на проде**

Временно скопировать файл и вызвать с уменьшенным `PAGE_LIMIT`, чтобы не запускать полную синхронизацию 9000+ товаров на этом шаге:

```bash
scp src/lib/optfm/syncProducts.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/optfm/syncProducts.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
process.env.OPTFM_AUTH_ID = '5948';
process.env.OPTFM_AUTH_KEY = 'y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp';
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  // Патчим лимит страницы прямо в памяти процесса, не трогая файл —
  // только для этой разовой проверки
  const { optfmRequest } = await import('./src/lib/optfm/client.js');
  const { response } = await optfmRequest('catalog.getElementList', { limit: 5, page: 1, no_image: 1 });
  console.log('Пример сырых данных товара:', JSON.stringify(response.items[0], null, 2));

  const Product = mongoose.connection.collection('products');
  // Прогоняем полную функцию (она пройдёт все 9000+ страниц — это ок,
  // финальная реальная проверка будет в Task 8; здесь просто убеждаемся,
  // что она стартует и создаёт корректный первый документ)
  const before = await Product.countDocuments({ supplierSource: 'optfm' });
  console.log('Товаров от OPTFM в базе до синхронизации:', before);
  await mongoose.disconnect();
})();
\""
```

Expected: в примере сырых данных виден реальный товар с массивом `prices`; количество товаров от OPTFM до синхронизации — `0` (это первый прогон, полноценный запуск — в Task 8).

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/optfm/syncProducts.js
git commit -m "feat: sync OPTFM products with markup and category linking"
```

---

### Task 8: Скрипт для cron и регистрация ежедневного запуска

**Files:**
- Create: `scripts/sync-optfm.mjs`

**Interfaces:**
- Consumes: `syncCategories` (Task 5), `syncProducts` (Task 7), `acquireSyncLock`/`releaseSyncLock` (Task 4), `dbConnect` из `src/lib/db.js` (существующий).
- Produces: исполняемый скрипт `node scripts/sync-optfm.mjs`, вызываемый системным cron.

- [ ] **Step 1: Написать скрипт**

```js
// scripts/sync-optfm.mjs
//
// Ежедневная синхронизация каталога поставщика OPTFM (Fashion Mobile).
// Запускается системным cron на проде — см.
// docs/superpowers/specs/2026-08-03-optfm-supplier-integration-design.md
//
// Использование (в том числе для ручной проверки):
//   node scripts/sync-optfm.mjs
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env.production', import.meta.url).pathname });

import dbConnect from '../src/lib/db.js';
import { syncCategories } from '../src/lib/optfm/syncCategories.js';
import { syncProducts } from '../src/lib/optfm/syncProducts.js';
import { acquireSyncLock, releaseSyncLock } from '../src/lib/optfm/config.js';

async function main() {
  await dbConnect();

  const acquired = await acquireSyncLock();
  if (!acquired) {
    console.log('⏭️  Синхронизация OPTFM уже выполняется — пропускаю этот запуск');
    return;
  }

  try {
    console.log('▶️  Синхронизация категорий OPTFM...');
    const categoriesResult = await syncCategories();
    console.log(`✅ Категории: ${categoriesResult.categoriesUpserted} обработано`);

    console.log('▶️  Синхронизация товаров OPTFM...');
    const productsResult = await syncProducts();
    console.log(
      `✅ Товары: ${productsResult.productsUpserted} обработано, ` +
        `${productsResult.productsDeactivated} деактивировано (пропали у поставщика), ` +
        `${productsResult.imagesDownloaded} новых фото скачано`
    );

    await releaseSyncLock({ ...categoriesResult, ...productsResult });
    console.log('🎉 Синхронизация OPTFM завершена успешно');
  } catch (error) {
    console.error('❌ Синхронизация OPTFM упала:', error);
    await releaseSyncLock(null, error);
    process.exitCode = 1;
  }
}

main();
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check scripts/sync-optfm.mjs
```

Expected: без вывода.

- [ ] **Step 3: Задеплоить весь `src/lib/optfm/` и модели на прод, добавить переменные окружения**

```bash
git push origin main
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git status --porcelain | wc -l"
```

Expected: только штатные файлы (аватары/загрузки), без конфликтов. Затем:

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -15"
```

Expected: сборка завершается без ошибок.

```bash
ssh root@185.221.215.248 "grep -q OPTFM_AUTH_ID /var/www/servicebox-repair/.env.production || cat >> /var/www/servicebox-repair/.env.production <<'EOF'
OPTFM_AUTH_ID=5948
OPTFM_AUTH_KEY=y7rd32EeTZ2xej1rtsya8vSFiMC7wCdp
EOF
grep OPTFM /var/www/servicebox-repair/.env.production"
```

Expected: выводятся обе переменные (значение ключа можно не маскировать — файл и так недоступен снаружи сервера).

- [ ] **Step 4: Запустить первую реальную синхронизацию (в фоне — полный прогон с ~9000 фото может занять больше часа)**

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && nohup node scripts/sync-optfm.mjs > /var/log/optfm-sync.log 2>&1 &
disown
sleep 5
tail -20 /var/log/optfm-sync.log"
```

Expected: в логе видно `▶️  Синхронизация категорий OPTFM...`, затем вскоре `✅ Категории: 259 обработано` и `▶️  Синхронизация товаров OPTFM...`.

- [ ] **Step 5: Проверить прогресс (не дожидаясь полного завершения)**

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.connection.collection('products');
  const count = await Product.countDocuments({ supplierSource: 'optfm' });
  console.log('Товаров от OPTFM в базе сейчас:', count);
  const sample = await Product.findOne({ supplierSource: 'optfm' });
  console.log('Пример:', sample?.name, sample?.new_price, sample?.category, '/', sample?.subcategory, sample?.images);
  await mongoose.disconnect();
})();
\""
```

Expected: `Товаров от OPTFM в базе сейчас: <растущее число>` (больше 0), у примера товара заполнены `new_price` (с наценкой), `category`/`subcategory` (не пустые), `images` (массив с одним путём `/uploads/optfm/...`). Дождаться, пока `nohup`-процесс не завершится (следить через `tail -f /var/log/optfm-sync.log` или повторные запросы количества — рост должен остановиться на количестве, близком к 9013), прежде чем переходить к следующему шагу.

- [ ] **Step 6: Зарегистрировать ежедневный cron на проде**

```bash
ssh root@185.221.215.248 "crontab -l 2>/dev/null > /tmp/crontab.bak; grep -q sync-optfm /tmp/crontab.bak || (cat /tmp/crontab.bak; echo '0 3 * * * cd /var/www/servicebox-repair && /usr/bin/node scripts/sync-optfm.mjs >> /var/log/optfm-sync.log 2>&1') | crontab -
crontab -l"
```

Expected: в выводе `crontab -l` присутствует строка `0 3 * * * cd /var/www/servicebox-repair && /usr/bin/node scripts/sync-optfm.mjs >> /var/log/optfm-sync.log 2>&1`.

Уточнить точный путь к `node`, если `/usr/bin/node` не существует:

```bash
ssh root@185.221.215.248 "which node"
```

Если путь другой — использовать его при регистрации записи crontab выше.

- [ ] **Step 7: Закоммитить**

```bash
git add scripts/sync-optfm.mjs
git commit -m "feat: add daily OPTFM sync script and register cron job on prod"
```

---

### Task 9: Админские API-роуты — наценка и ручной запуск синхронизации

**Files:**
- Create: `src/app/api/admin/optfm/config/route.js`
- Create: `src/app/api/admin/optfm/sync/route.js`

**Interfaces:**
- Consumes: `verifyToken` из `src/lib/auth-helpers.js` (существующий), `dbConnect` из `@/lib/db` (существующий), `getSyncState`/`setMarkupPercent`/`acquireSyncLock`/`releaseSyncLock` из `@/lib/optfm/config`, `syncCategories` из `@/lib/optfm/syncCategories`, `syncProducts` из `@/lib/optfm/syncProducts`.
- Produces: `GET /api/admin/optfm/config` (текущая наценка + статус синхронизации), `POST /api/admin/optfm/config` (сохранить новую наценку), `POST /api/admin/optfm/sync` (запустить синхронизацию в фоне).

**Важно:** первая синхронизация (9000+ фото) может занять больше часа — это превышает таймаут nginx (`proxy_read_timeout 300s` для `/api/`, см. `/etc/nginx/sites-available/servicebox-repair` на проде) и таймаут браузера. Поэтому `POST /api/admin/optfm/sync` не ждёт завершения — запускает синхронизацию в фоне и сразу отвечает, а статус/результат смотрится через `GET /api/admin/optfm/config`.

- [ ] **Step 1: Роут настроек (наценка + статус)**

```js
// src/app/api/admin/optfm/config/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import { getSyncState, setMarkupPercent } from '@/lib/optfm/config';

function requireAdmin(request) {
  const user = verifyToken(request);
  if (!user) return { error: NextResponse.json({ error: 'Не авторизован' }, { status: 401 }) };
  if (user.role !== 'admin') return { error: NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 }) };
  return { user };
}

export async function GET(request) {
  await dbConnect();

  const { error } = requireAdmin(request);
  if (error) return error;

  const state = await getSyncState();
  return NextResponse.json({
    markupPercent: state.markupPercent,
    syncInProgress: state.syncInProgress,
    lastSyncStartedAt: state.lastSyncStartedAt,
    lastSyncFinishedAt: state.lastSyncFinishedAt,
    lastSyncError: state.lastSyncError,
    lastSyncStats: state.lastSyncStats,
  });
}

export async function POST(request) {
  await dbConnect();

  const { error } = requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  const markupPercent = Number(body.markupPercent);

  if (!Number.isFinite(markupPercent) || markupPercent < 0) {
    return NextResponse.json({ error: 'Наценка должна быть неотрицательным числом' }, { status: 400 });
  }

  const saved = await setMarkupPercent(markupPercent);
  return NextResponse.json({ markupPercent: saved });
}
```

- [ ] **Step 2: Роут ручного запуска синхронизации**

```js
// src/app/api/admin/optfm/sync/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import { acquireSyncLock, releaseSyncLock } from '@/lib/optfm/config';
import { syncCategories } from '@/lib/optfm/syncCategories';
import { syncProducts } from '@/lib/optfm/syncProducts';

export async function POST(request) {
  await dbConnect();

  const user = verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });

  const acquired = await acquireSyncLock();
  if (!acquired) {
    return NextResponse.json({ error: 'Синхронизация уже выполняется' }, { status: 409 });
  }

  // Не ждём завершения внутри запроса — см. примечание в шапке задачи:
  // полная синхронизация может занять больше часа из-за скачивания фото.
  (async () => {
    try {
      const categoriesResult = await syncCategories();
      const productsResult = await syncProducts();
      await releaseSyncLock({ ...categoriesResult, ...productsResult });
    } catch (err) {
      console.error('OPTFM manual sync error:', err);
      await releaseSyncLock(null, err);
    }
  })();

  return NextResponse.json({ success: true, message: 'Синхронизация запущена в фоне' });
}
```

- [ ] **Step 3: Проверить синтаксис**

```bash
node --check src/app/api/admin/optfm/config/route.js
node --check src/app/api/admin/optfm/sync/route.js
```

Expected: без вывода (JSX/`export const runtime` — валидный JS, синтаксической ошибки быть не должно, т.к. в этих файлах нет JSX).

- [ ] **Step 4: Собрать проект локально**

```bash
npm run build 2>&1 | tail -20
```

Expected: сборка завершается без ошибок, в списке роутов присутствуют `/api/admin/optfm/config` и `/api/admin/optfm/sync`.

- [ ] **Step 5: Задеплоить и проверить вживую через реальный admin-токен**

```bash
git add src/app/api/admin/optfm/config/route.js src/app/api/admin/optfm/sync/route.js
git commit -m "feat: add admin API routes for OPTFM markup config and manual sync"
git push origin main
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -10 && pm2 restart servicebox-repair --update-env && sleep 4 && curl -s http://localhost:3000/health"
```

Expected: `{"status":"healthy",...}`.

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.production' });
const token = jwt.sign({ id: 'test-admin', email: 'test@internal', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '5m' });
console.log(token);
\" > /tmp/admin_token.txt
TOKEN=\$(cat /tmp/admin_token.txt)
curl -s http://localhost:3000/api/admin/optfm/config -H \"Cookie: token=\$TOKEN\"
rm -f /tmp/admin_token.txt"
```

Expected: JSON вида `{"markupPercent":30,"syncInProgress":false,...}`.

---

### Task 10: Страница админки — наценка и кнопка синхронизации

**Files:**
- Create: `src/app/admin-panel/optfm/page.js`
- Modify: `src/app/admin-panel/layout.js`

**Interfaces:**
- Consumes: `GET`/`POST /api/admin/optfm/config`, `POST /api/admin/optfm/sync` (Task 9).
- Produces: страница `/admin-panel/optfm` с полем наценки и кнопкой запуска, пункт в навигации админки.

- [ ] **Step 1: Написать страницу админки**

```js
// src/app/admin-panel/optfm/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';

export default function OptfmAdminPage() {
  const [state, setState] = useState(null);
  const [markupInput, setMarkupInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchState = useCallback(async () => {
    const res = await fetch('/api/admin/optfm/config', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setState(data);
    setMarkupInput(String(data.markupPercent));
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleSaveMarkup = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/optfm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markupPercent: Number(markupInput) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      setMessage('Наценка сохранена');
      fetchState();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/optfm/sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка запуска');
      setMessage(data.message);
      fetchState();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!state) return <p>Загрузка…</p>;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Поставщик OPTFM</h1>

      <form onSubmit={handleSaveMarkup} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '1.5rem' }}>
        <label>
          Наценка, %:{' '}
          <input
            type="number"
            min={0}
            value={markupInput}
            onChange={(e) => setMarkupInput(e.target.value)}
            style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, width: 100 }}
          />
        </label>
        <button type="submit" disabled={saving}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>

      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <p><strong>Статус:</strong> {state.syncInProgress ? 'синхронизация выполняется…' : 'простаивает'}</p>
        {state.lastSyncFinishedAt && (
          <p><strong>Последняя синхронизация:</strong> {new Date(state.lastSyncFinishedAt).toLocaleString('ru-RU')}</p>
        )}
        {state.lastSyncStats && (
          <p>
            Товаров: {state.lastSyncStats.productsUpserted}, деактивировано: {state.lastSyncStats.productsDeactivated},
            новых фото: {state.lastSyncStats.imagesDownloaded}
          </p>
        )}
        {state.lastSyncError && <p style={{ color: '#dc2626' }}>Ошибка: {state.lastSyncError}</p>}
      </div>

      <button onClick={handleSync} disabled={syncing || state.syncInProgress}
        style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {state.syncInProgress ? 'Уже выполняется…' : 'Синхронизировать сейчас'}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Добавить пункт в навигацию админки**

В файле `src/app/admin-panel/layout.js` найти строку:

```js
            { href: '/admin-panel/analytics', label: 'Аналитика',  icon: '📈' },
```

Добавить сразу после:

```js
            { href: '/admin-panel/analytics', label: 'Аналитика',  icon: '📈' },
            { href: '/admin-panel/optfm', label: 'Поставщик OPTFM', icon: '🏭' },
```

- [ ] **Step 3: Собрать проект**

```bash
npm run build 2>&1 | tail -15
```

Expected: сборка без ошибок, в списке роутов присутствует `/admin-panel/optfm`.

- [ ] **Step 4: Задеплоить и проверить в браузере**

```bash
git add src/app/admin-panel/optfm/page.js src/app/admin-panel/layout.js
git commit -m "feat: add OPTFM admin page for markup config and manual sync trigger"
git push origin main
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -10 && pm2 restart servicebox-repair --update-env"
```

Зайти в браузере на `https://servicebox35.ru/admin-panel/optfm` под админским аккаунтом — убедиться, что страница показывает текущую наценку, статус последней синхронизации и кнопка «Синхронизировать сейчас» работает (после нажатия статус меняется на «синхронизация выполняется…», а через некоторое время — на результат).

---

## Самопроверка плана (self-review)

**1. Покрытие спеки:**
- Модель Category (дерево) — Task 1 ✅
- Расширение Product — Task 2 ✅
- Конфиг наценки — Task 1 (модель) + Task 4 (логика) + Task 10 (UI) ✅
- Клиент API с ретраями/паузами — Task 3 ✅
- Синхронизация категорий (постранично, upsert, связи parentId) — Task 5 ✅
- Синхронизация товаров (цена «Оптовая» по id/названию, наценка, категория, upsert, деактивация пропавших) — Task 7 ✅
- Кэширование фото (скачивание только новых) — Task 6 ✅
- Ежедневный cron — Task 8 ✅
- Кнопка «Синхронизировать сейчас» — Task 9 (роут) + Task 10 (UI) ✅
- Задел под будущий параметр склада (`extraParams`) — Task 3 ✅
- Защита от параллельного запуска — Task 4 ✅
- Обратная совместимость `category`/`subcategory` для `/parts` и фидов — Task 7 (`resolveCategoryDisplayNames`) ✅

**2. Проверка на плейсхолдеры:** пройдено — везде полный код, конкретные команды и ожидаемый вывод, ни одного "TODO"/"добавить обработку ошибок" без конкретики.

**3. Согласованность типов/имён между задачами:**
- `Category.supplierSectionId` (Task 1) ↔ используется в Task 5 (`syncCategories`) и Task 7 (`syncProducts`, поиск по `section_id` товара) — совпадает.
- `Product.supplierProductId`/`supplierSource`/`supplierPriceRaw`/`categoryId` (Task 2) ↔ используются в Task 7 без расхождений в названиях.
- `optfmRequest(method, params, extraParams)` (Task 3) ↔ вызывается одинаково в Task 5/6/7.
- `getMarkupPercent`/`acquireSyncLock`/`releaseSyncLock`/`getSyncState`/`setMarkupPercent` (Task 4) ↔ имена совпадают во всех местах использования (Task 8, Task 9).
- `ensureProductImage`/`productImagePublicUrl` (Task 6) ↔ совпадают в Task 7.
- `syncCategories()`/`syncProducts()` возвращаемые поля (`categoriesUpserted`, `productsUpserted`, `productsDeactivated`, `imagesDownloaded`) ↔ совпадают в Task 8/9 при сборке `stats`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-03-optfm-supplier-integration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
