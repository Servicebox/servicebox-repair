# Переделка /parts под каталог поставщика — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переделать `/parts` из клиентской страницы «загрузить все товары и отфильтровать в браузере» в серверный, пагинированный каталог с деревом категорий поставщика OPTFM, удобный и читаемый на любом размере экрана.

**Architecture:** Серверный catch-all маршрут `/parts/[...categoryPath]` (по образцу уже переделанного в этой же сессии `/services/[...slug]`) — товары запрашиваются напрямую из MongoDB с пагинацией на сервере. Товары вложенных подкатегорий находятся через `$graphLookup` по дереву `OptfmCategory`. Интерактивные элементы (фильтры, добавление в корзину) — в отдельных клиентских компонентах, переиспользующих уже существующие `Item` (карточка товара) и `ShopContext.addToCart`.

**Tech Stack:** Next.js (App Router, серверные компоненты), Mongoose/MongoDB (`$graphLookup`), Tailwind CSS (адаптивная сетка).

## Global Constraints

- Одна публичная страница для всех — без отдельного вида для персонала (решено в брейнсторминге).
- Дерево категорий: минимум 3 уровня вложенности, 259 узлов — см. [спеку синхронизации](../specs/2026-08-03-optfm-supplier-integration-design.md).
- Красивые URL категорий (`/parts/slug1/slug2`), не query-параметры.
- Постраничная навигация, не бесконечная лента.
- Сортировка + фильтр по цене — из v1, фасетных фильтров сверх этого не добавлять (YAGNI).
- В проекте нет тестового фреймворка — проверка через реальные запросы к живым данным на проде, как и в предыдущем этапе этой сессии.
- Не трогать общий `/api/search` — поиск в каталоге отдельный.
- Существующий `Item` (карточка товара, `src/components/Item/Item.js`) и `ShopContext.addToCart(slug)` переиспользуются как есть, не переписываются.

---

### Task 1: `slug` у категорий поставщика

**Files:**
- Modify: `src/models/OptfmCategory.js`
- Modify: `src/lib/optfm/syncCategories.js`
- Create: `scripts/backfill-optfm-category-slugs.mjs`

**Interfaces:**
- Produces: `OptfmCategory.slug` (String, unique, обязателен у новых записей) — читается в Task 4 (`resolveCategoryPath`).

- [ ] **Step 1: Добавить поле slug в модель**

В файле `src/models/OptfmCategory.js` найти:

```js
  // Id раздела в системе поставщика — ключ для идемпотентного upsert
  supplierSectionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
```

Добавить сразу после:

```js
  // Id раздела в системе поставщика — ключ для идемпотентного upsert
  supplierSectionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
```

`sparse: true` — чтобы уникальный индекс не мешал уже существующим записям без slug до бэкафилла (Step 3).

- [ ] **Step 2: Генерировать slug при синхронизации новых категорий**

В файле `src/lib/optfm/syncCategories.js` найти:

```js
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
```

Заменить на:

```js
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
```

Добавить импорт в начало файла (после существующих импортов):

```js
import { generateUniqueSlug } from '../slugify.js';
```

- [ ] **Step 3: Проверить синтаксис**

```bash
node --check src/models/OptfmCategory.js
node --check src/lib/optfm/syncCategories.js
```

Expected: без вывода.

- [ ] **Step 4: Написать скрипт бэкафилла для уже существующих 259 категорий**

```js
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
```

- [ ] **Step 5: Проверить синтаксис и задеплоить**

```bash
node --check scripts/backfill-optfm-category-slugs.mjs
git add src/models/OptfmCategory.js src/lib/optfm/syncCategories.js scripts/backfill-optfm-category-slugs.mjs
git commit -m "feat: add slug field to OptfmCategory, backfill script for existing categories"
git push origin main
```

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -10"
```

Expected: сборка без ошибок.

- [ ] **Step 6: Запустить бэкафилл на проде и проверить**

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node scripts/backfill-optfm-category-slugs.mjs"
```

Expected: `Категорий без slug: 259`, далее 259 строк вида `✅ <имя> → <slug>`, в конце `Готово`.

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const OptfmCategory = mongoose.connection.collection('optfmcategories');
  const withoutSlug = await OptfmCategory.countDocuments({ slug: { \\\$exists: false } });
  const sample = await OptfmCategory.findOne({ slug: { \\\$exists: true } });
  console.log('Без slug осталось:', withoutSlug, '| пример:', sample.name, '→', sample.slug);
  await mongoose.disconnect();
})();
\""
```

Expected: `Без slug осталось: 0`.

- [ ] **Step 7: Перезапустить pm2 и закоммитить (уже закоммичено в Step 5, здесь только restart)**

```bash
ssh root@185.221.215.248 "pm2 restart servicebox-repair --update-env && sleep 4 && curl -s http://localhost:3000/health"
```

Expected: `{"status":"healthy",...}`.

---

### Task 2: Функция поиска товаров и категорий с пагинацией

**Files:**
- Create: `src/lib/parts/queryProducts.js`

**Interfaces:**
- Consumes: `Product` (существующий), `OptfmCategory` (Task 1).
- Produces: `resolveCategoryDescendantIds(categoryId): Promise<ObjectId[]>` (сама категория + все вложенные, любой глубины), `queryProducts(params): Promise<{ items: Product[], total: number, page: number, pages: number }>` где `params = { categoryId?: ObjectId, search?: string, minPrice?: number, maxPrice?: number, sort?: 'price_asc'|'price_desc'|'default', page?: number }`.

- [ ] **Step 1: Написать модуль запроса товаров**

```js
// src/lib/parts/queryProducts.js
import Product from '../../models/Product.js';
import OptfmCategory from '../../models/OptfmCategory.js';

const PAGE_SIZE = 24;

/**
 * Возвращает id категории и всех её потомков любой глубины одним запросом
 * ($graphLookup по дереву parentId) — нужно, чтобы при просмотре широкой
 * категории показывались товары из всех вложенных подкатегорий, а не
 * только напрямую привязанные к ней. Дерево маленькое (259 узлов),
 * запрос дешёвый — материализованный путь не нужен (YAGNI).
 */
export async function resolveCategoryDescendantIds(categoryId) {
  const result = await OptfmCategory.aggregate([
    { $match: { _id: categoryId } },
    {
      $graphLookup: {
        from: 'optfmcategories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
      },
    },
    { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
  ]);

  return result[0]?.ids || [categoryId];
}

export async function queryProducts({ categoryId, search, minPrice, maxPrice, sort, page = 1 } = {}) {
  const query = { isActive: true, isDeleted: false };

  if (categoryId) {
    const categoryIds = await resolveCategoryDescendantIds(categoryId);
    query.categoryId = { $in: categoryIds };
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (minPrice != null || maxPrice != null) {
    query.new_price = {};
    if (minPrice != null) query.new_price.$gte = minPrice;
    if (maxPrice != null) query.new_price.$lte = maxPrice;
  }

  const sortSpec =
    sort === 'price_asc' ? { new_price: 1 } : sort === 'price_desc' ? { new_price: -1 } : { createdAt: -1 };

  const safePage = Math.max(1, Number(page) || 1);
  const total = await Product.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const items = await Product.find(query)
    .select('name slug images new_price old_price category subcategory quantity')
    .sort(sortSpec)
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return { items, total, page: safePage, pages };
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/parts/queryProducts.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/parts/queryProducts.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/parts/queryProducts.js
ssh root@185.221.215.248 "mkdir -p /var/www/servicebox-repair/src/lib/parts"
scp src/lib/parts/queryProducts.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/parts/queryProducts.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { queryProducts } = await import('./src/lib/parts/queryProducts.js');
  const result = await queryProducts({ page: 1 });
  console.log('Всего товаров:', result.total, 'страниц:', result.pages, 'на странице:', result.items.length);
  console.log('Пример:', result.items[0]?.name, result.items[0]?.new_price);

  const priceFiltered = await queryProducts({ minPrice: 100, maxPrice: 200, sort: 'price_asc' });
  console.log('С фильтром цены 100-200, сортировка по возрастанию:', priceFiltered.total, 'товаров, первый:', priceFiltered.items[0]?.new_price);
  await mongoose.disconnect();
})();
\""
```

Expected: `Всего товаров: 4284 страниц: 179 на странице: 24`, у отфильтрованной выборки все цены в диапазоне 100–200, первая — наименьшая.

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/parts/queryProducts.js
git commit -m "feat: add paginated product query with category subtree resolution"
```

---

### Task 3: Разрешение пути категории и хлебных крошек

**Files:**
- Create: `src/lib/parts/resolveCategoryPath.js`

**Interfaces:**
- Consumes: `OptfmCategory` (Task 1).
- Produces: `resolveCategoryPath(segments: string[]): Promise<{ category: OptfmCategory, breadcrumbs: Array<{name: string, slug: string}> } | null>`.

- [ ] **Step 1: Написать модуль разрешения пути**

```js
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
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/parts/resolveCategoryPath.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/parts/resolveCategoryPath.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/parts/resolveCategoryPath.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const OptfmCategory = mongoose.connection.collection('optfmcategories');
  const sample = await OptfmCategory.findOne({ parentId: { \\\$ne: null } });
  const { resolveCategoryPath } = await import('./src/lib/parts/resolveCategoryPath.js');
  const result = await resolveCategoryPath([sample.slug]);
  console.log('Категория:', result.category.name);
  console.log('Хлебные крошки:', result.breadcrumbs.map(b => b.name).join(' → '));
  await mongoose.disconnect();
})();
\""
```

Expected: находит категорию, хлебные крошки — минимум 2 уровня (корень → категория), без ошибок.

- [ ] **Step 4: Закоммитить**

```bash
git add src/lib/parts/resolveCategoryPath.js
git commit -m "feat: add category URL path resolution with breadcrumbs"
```

---

### Task 4: Сетка товаров и пагинация (переиспользуемые компоненты)

**Files:**
- Create: `src/app/parts/ProductGrid.js`
- Create: `src/app/parts/Pagination.js`

**Interfaces:**
- Consumes: `Item` (существующий, `src/components/Item/Item.js`), `ShopContext` (существующий, `src/components/ShopContext/ShopContext.js`), результат `queryProducts` (Task 2).
- Produces: `<ProductGrid items={items} />`, `<Pagination page={page} pages={pages} basePath={basePath} searchParams={searchParams} />`.

**Важно:** существующий `Item` — только карточка со ссылкой на страницу товара, кнопки «В корзину» на ней нет. Спека явно требует добавление в корзину прямо с карточки без перехода на страницу товара — добавляем свою кнопку поверх `Item`, не трогая сам компонент (используется в других местах сайта, изменять его рискованно и не нужно).

**Готча с импортом `ShopContext`, обнаруженная при подготовке плана:** в нескольких существующих файлах (`Product.js` и др.) `ShopContext` импортируется через `import ShopContext from '../ShopContext/ShopContext'` (default import) — это не совпадает с реальным экспортом файла (`export const ShopContext = createContext(null)` — именованный, `export default ShopContextProvider` — совсем другое значение). Похоже, это существующий баг вне рамок этой задачи — не трогаем его. В новом коде используем правильный именованный импорт: `import { ShopContext } from '@/components/ShopContext/ShopContext'`.

- [ ] **Step 1: Написать сетку товаров с кнопкой «В корзину»**

```js
// src/app/parts/ProductGrid.js
'use client';
import { useContext, useState } from 'react';
import Item from '@/components/Item/Item';
import { ShopContext } from '@/components/ShopContext/ShopContext';

function AddToCartButton({ slug }) {
  const { addToCart } = useContext(ShopContext);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    await addToCart(slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full mt-2 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition"
    >
      {added ? 'Добавлено ✓' : 'В корзину'}
    </button>
  );
}

export default function ProductGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Товары не найдены</p>
        <p className="text-sm mt-2">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <div key={item._id}>
          <Item
            slug={item.slug}
            name={item.name}
            images={item.images}
            new_price={item.new_price}
            old_price={item.old_price}
            quantity={item.quantity}
            category={item.category}
            subcategory={item.subcategory}
          />
          <AddToCartButton slug={item.slug} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Написать пагинацию**

```js
// src/app/parts/Pagination.js
import Link from 'next/link';

function buildPageUrl(basePath, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function Pagination({ page, pages, basePath, searchParams }) {
  if (pages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-3 mt-8" aria-label="Страницы">
      <Link
        href={buildPageUrl(basePath, searchParams, page - 1)}
        aria-disabled={prevDisabled}
        className={`px-3 py-2 rounded-lg border text-sm ${prevDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface'}`}
      >
        ← Назад
      </Link>
      <span className="text-sm text-muted whitespace-nowrap">
        {page} из {pages}
      </span>
      <Link
        href={buildPageUrl(basePath, searchParams, page + 1)}
        aria-disabled={nextDisabled}
        className={`px-3 py-2 rounded-lg border text-sm ${nextDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface'}`}
      >
        Далее →
      </Link>
    </nav>
  );
}
```

- [ ] **Step 3: Проверить синтаксис**

```bash
npm run build 2>&1 | tail -20
```

Expected: сборка без ошибок (эти компоненты пока нигде не подключены, но должны компилироваться как валидный JSX).

- [ ] **Step 4: Закоммитить**

```bash
git add src/app/parts/ProductGrid.js src/app/parts/Pagination.js
git commit -m "feat: add reusable product grid and pagination components"
```

---

### Task 5: Панель фильтров (сортировка, цена, поиск)

**Files:**
- Create: `src/app/parts/PartsFilters.js`

**Interfaces:**
- Produces: `<PartsFilters basePath={string} initialSort={string} initialMinPrice={string} initialMaxPrice={string} initialSearch={string} />` — клиентский компонент, при изменении обновляет URL через `router.push`.

- [ ] **Step 1: Написать компонент фильтров**

```js
// src/app/parts/PartsFilters.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartsFilters({ basePath, initialSort, initialMinPrice, initialMaxPrice, initialSearch }) {
  const router = useRouter();
  const [sort, setSort] = useState(initialSort || 'default');
  const [minPrice, setMinPrice] = useState(initialMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '');
  const [search, setSearch] = useState(initialSearch || '');
  const [open, setOpen] = useState(false);

  const apply = (overrides = {}) => {
    const values = {
      sort,
      minPrice,
      maxPrice,
      q: search,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (values.sort && values.sort !== 'default') params.set('sort', values.sort);
    if (values.minPrice) params.set('minPrice', values.minPrice);
    if (values.maxPrice) params.set('maxPrice', values.maxPrice);
    if (values.q) params.set('q', values.q);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden w-full mb-3 px-4 py-2 border rounded-lg text-sm font-medium flex items-center justify-between"
      >
        Фильтры {open ? '▲' : '▼'}
      </button>

      <div className={`${open ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center`}>
        <form
          onSubmit={(e) => { e.preventDefault(); apply(); }}
          className="flex-1 min-w-[180px]"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </form>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="default">По умолчанию</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Цена от"
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="до"
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => apply()}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm whitespace-nowrap"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверить синтаксис**

```bash
npm run build 2>&1 | tail -20
```

Expected: сборка без ошибок.

- [ ] **Step 3: Закоммитить**

```bash
git add src/app/parts/PartsFilters.js
git commit -m "feat: add responsive parts filter panel (sort, price, search)"
```

---

### Task 6: Дерево категорий (навигация)

**Files:**
- Create: `src/lib/parts/getCategoryTree.js`
- Create: `src/app/parts/CategoryTree.js`

**Interfaces:**
- Consumes: `OptfmCategory` (Task 1).
- Produces: `getCategoryTree(): Promise<CategoryNode[]>` где `CategoryNode = { _id, name, slug, children: CategoryNode[] }` (полное дерево, для рендера в сайдбаре), `<CategoryTree tree={CategoryNode[]} activeCategoryId={string} />`.

- [ ] **Step 1: Написать построение дерева**

```js
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
```

- [ ] **Step 2: Проверить синтаксис**

```bash
node --check src/lib/parts/getCategoryTree.js
```

Expected: без вывода.

- [ ] **Step 3: Проверить вживую на проде**

```bash
scp src/lib/parts/getCategoryTree.js root@185.221.215.248:/var/www/servicebox-repair/src/lib/parts/getCategoryTree.js
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { getCategoryTree } = await import('./src/lib/parts/getCategoryTree.js');
  const tree = await getCategoryTree();
  console.log('Корневых категорий:', tree.length);
  console.log('У первой корневой', tree[0].name, 'подкатегорий:', tree[0].children.length);
  await mongoose.disconnect();
})();
\""
```

Expected: `Корневых категорий: 16` (совпадает с проверкой при синхронизации категорий), у первой корневой есть дочерние.

- [ ] **Step 4: Написать клиентский компонент дерева**

```js
// src/app/parts/CategoryTree.js
'use client';
import { useState } from 'react';
import Link from 'next/link';

function CategoryNode({ node, depth, activeCategoryId }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.length > 0;
  const isActive = String(node._id) === activeCategoryId;

  return (
    <li>
      <div className="flex items-center">
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-muted shrink-0"
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        <Link
          href={`/parts/${node.slug}`}
          className={`flex-1 py-1.5 px-1 text-sm rounded ${isActive ? 'font-semibold text-primary' : 'hover:text-primary'}`}
          style={{ marginLeft: hasChildren ? 0 : 20 }}
        >
          {node.name}
        </Link>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4 border-l pl-2">
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} depth={depth + 1} activeCategoryId={activeCategoryId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoryTree({ tree, activeCategoryId }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden w-full mb-4 px-4 py-2 border rounded-lg text-sm font-medium"
      >
        📂 Категории
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-bg h-full w-4/5 max-w-sm p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setMobileOpen(false)} className="mb-4 text-muted">
              ✕ Закрыть
            </button>
            <ul>
              {tree.map((node) => (
                <CategoryNode key={node._id} node={node} depth={0} activeCategoryId={activeCategoryId} />
              ))}
            </ul>
          </div>
        </div>
      )}

      <nav className="hidden lg:block w-64 shrink-0">
        <ul>
          {tree.map((node) => (
            <CategoryNode key={node._id} node={node} depth={0} activeCategoryId={activeCategoryId} />
          ))}
        </ul>
      </nav>
    </>
  );
}
```

- [ ] **Step 5: Проверить синтаксис**

```bash
npm run build 2>&1 | tail -20
```

Expected: сборка без ошибок.

- [ ] **Step 6: Закоммитить**

```bash
git add src/lib/parts/getCategoryTree.js src/app/parts/CategoryTree.js
git commit -m "feat: add category tree navigation (desktop sidebar + mobile drawer)"
```

---

### Task 7: Страница категории `/parts/[...categoryPath]`

**Files:**
- Create: `src/app/parts/[...categoryPath]/page.js`

**Interfaces:**
- Consumes: `resolveCategoryPath` (Task 3), `queryProducts` (Task 2), `getCategoryTree` (Task 6), `ProductGrid` (Task 4), `Pagination` (Task 4), `PartsFilters` (Task 5), `CategoryTree` (Task 6).

- [ ] **Step 1: Написать серверную страницу категории**

```js
// src/app/parts/[...categoryPath]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BASE_URL, BUSINESS } from '@/lib/constants';
import { resolveCategoryPath } from '@/lib/parts/resolveCategoryPath';
import { queryProducts } from '@/lib/parts/queryProducts';
import { getCategoryTree } from '@/lib/parts/getCategoryTree';
import ProductGrid from '../ProductGrid';
import Pagination from '../Pagination';
import PartsFilters from '../PartsFilters';
import CategoryTree from '../CategoryTree';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { categoryPath } = await params;
  const resolved = await resolveCategoryPath(categoryPath);
  if (!resolved) return { title: 'Категория не найдена | ServiceBox' };

  const title = `${resolved.category.name} — купить в Вологде | ServiceBox`;
  const description =
    resolved.category.description ||
    `${resolved.category.name}: каталог с ценами в сервисном центре ServiceBox, Вологда.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/parts/${resolved.category.slug}` },
    openGraph: { title, description, type: 'website', siteName: BUSINESS.shortName },
  };
}

export default async function PartsCategoryPage({ params, searchParams }) {
  const { categoryPath } = await params;
  const sp = await searchParams;

  const resolved = await resolveCategoryPath(categoryPath);
  if (!resolved) notFound();

  const { category, breadcrumbs } = resolved;

  const result = await queryProducts({
    categoryId: category._id,
    search: sp.q,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: sp.sort,
    page: sp.page,
  });

  const tree = await getCategoryTree();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-muted mb-4 flex flex-wrap gap-1" aria-label="Хлебные крошки">
        <Link href="/parts" className="hover:text-primary">Каталог</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.slug}>
            {' / '}
            <Link href={`/parts/${crumb.slug}`} className="hover:text-primary">{crumb.name}</Link>
          </span>
        ))}
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{category.name}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <CategoryTree tree={tree} activeCategoryId={String(category._id)} />

        <div className="flex-1 min-w-0">
          <PartsFilters
            basePath={`/parts/${category.slug}`}
            initialSort={sp.sort}
            initialMinPrice={sp.minPrice}
            initialMaxPrice={sp.maxPrice}
            initialSearch={sp.q}
          />

          <p className="text-sm text-muted mb-4">Найдено товаров: {result.total}</p>

          <ProductGrid items={result.items} />

          <Pagination
            page={result.page}
            pages={result.pages}
            basePath={`/parts/${category.slug}`}
            searchParams={sp}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверить синтаксис и собрать проект**

```bash
node --check src/app/parts/\[...categoryPath\]/page.js 2>&1 || echo "JSX — синтаксис проверяется сборкой ниже"
npm run build 2>&1 | tail -20
```

Expected: сборка без ошибок, в списке роутов присутствует `/parts/[...categoryPath]`.

- [ ] **Step 3: Задеплоить и проверить вживую**

```bash
git add "src/app/parts/[...categoryPath]/page.js"
git commit -m "feat: add server-rendered category catalog page"
git push origin main
```

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -10 && pm2 restart servicebox-repair --update-env && sleep 4 && curl -s http://localhost:3000/health"
```

Expected: `{"status":"healthy",...}`.

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && node -e \"
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const OptfmCategory = mongoose.connection.collection('optfmcategories');
  const sample = await OptfmCategory.findOne({ parentId: { \\\$ne: null } });
  console.log('Тестовая категория:', sample.slug);
  await mongoose.disconnect();
})();
\""
```

Скопировать полученный slug и открыть в браузере `https://servicebox35.ru/parts/<slug>` — убедиться, что видна сетка товаров, хлебные крошки, дерево категорий слева (на десктопе) или кнопка «Категории» (на мобильном — проверить через инструменты разработчика с шириной экрана 375px), фильтры сворачиваются в кнопку на мобильном.

---

### Task 8: Корневая страница `/parts` (топ-категории + поиск)

**Files:**
- Modify: `src/app/parts/page.js` (полная замена содержимого)

**Interfaces:**
- Consumes: `getCategoryTree` (Task 6), `queryProducts` (Task 2) — для случая поиска без выбранной категории.

- [ ] **Step 1: Прочитать текущий файл перед заменой**

Файл `src/app/parts/page.js` (468 строк) — полностью клиентский, грузит все товары через `/api/allproducts`. Заменяется целиком серверным компонентом.

- [ ] **Step 2: Написать новую корневую страницу**

```js
// src/app/parts/page.js
import Link from 'next/link';
import { BASE_URL, BUSINESS } from '@/lib/constants';
import { getCategoryTree } from '@/lib/parts/getCategoryTree';
import { queryProducts } from '@/lib/parts/queryProducts';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import PartsFilters from './PartsFilters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Каталог запчастей для техники в Вологде | ServiceBox35',
  description: 'Каталог оригинальных и совместимых запчастей для ноутбуков, телефонов, планшетов, видеокарт и приставок. Наличие и цены в сервисном центре ServiceBox35, Вологда.',
  alternates: { canonical: `${BASE_URL}/parts` },
  openGraph: {
    title: 'Каталог запчастей — ServiceBox35',
    description: 'Оригинальные и совместимые запчасти для ремонта техники в наличии в Вологде.',
    type: 'website',
    siteName: BUSINESS.shortName,
  },
};

export default async function PartsRootPage({ searchParams }) {
  const sp = await searchParams;
  const tree = await getCategoryTree();

  const isSearching = Boolean(sp.q || sp.minPrice || sp.maxPrice || sp.sort);
  const result = isSearching
    ? await queryProducts({
        search: sp.q,
        minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
        sort: sp.sort,
        page: sp.page,
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Каталог запчастей</h1>
      <p className="text-muted mb-6">Выберите категорию или воспользуйтесь поиском</p>

      <PartsFilters
        basePath="/parts"
        initialSort={sp.sort}
        initialMinPrice={sp.minPrice}
        initialMaxPrice={sp.maxPrice}
        initialSearch={sp.q}
      />

      {isSearching ? (
        <>
          <p className="text-sm text-muted mb-4">Найдено товаров: {result.total}</p>
          <ProductGrid items={result.items} />
          <Pagination page={result.page} pages={result.pages} basePath="/parts" searchParams={sp} />
        </>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tree.map((category) => (
            <Link
              key={category._id}
              href={`/parts/${category.slug}`}
              className="block p-4 border rounded-xl hover:border-primary hover:shadow-md transition-all text-center"
            >
              <div className="font-medium">{category.name}</div>
              {category.children.length > 0 && (
                <div className="text-xs text-muted mt-1">{category.children.length} подкатегорий</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Удалить неиспользуемый старый CSS-модуль**

Старый `src/app/parts/Parts.module.css` (1228 строк) больше не импортируется новой страницей — удалить файл:

```bash
rm src/app/parts/Parts.module.css
```

- [ ] **Step 4: Собрать проект**

```bash
npm run build 2>&1 | tail -20
```

Expected: сборка без ошибок (проверить, что ничего другого не импортирует удалённый `Parts.module.css`):

```bash
grep -rl "Parts.module.css" src --include="*.js" | grep -v node_modules
```

Expected: пусто (ничего не найдено) — если что-то найдётся, разобраться перед удалением файла.

- [ ] **Step 5: Задеплоить и проверить вживую**

```bash
git add src/app/parts/page.js
git rm src/app/parts/Parts.module.css
git commit -m "feat: replace /parts with server-rendered category grid + search"
git push origin main
```

```bash
ssh root@185.221.215.248 "cd /var/www/servicebox-repair && git pull origin main && npm run build 2>&1 | tail -10 && pm2 restart servicebox-repair --update-env && sleep 4 && curl -s http://localhost:3000/health"
```

Expected: `{"status":"healthy",...}`.

Открыть `https://servicebox35.ru/parts` в браузере — должна показаться сетка из 16 корневых категорий. Ввести что-нибудь в поиск (например «клей») — должна показаться пагинированная сетка найденных товаров.

---

### Task 9: Проверка адаптивности на всех разрешениях

**Files:** нет изменений кода — только проверка.

- [ ] **Step 1: Проверить на реальных ширинах экрана через инструменты разработчика браузера**

Открыть `https://servicebox35.ru/parts` и `https://servicebox35.ru/parts/<любой-slug-категории>`, для каждой ширины проверить:

| Ширина | Что проверить |
|---|---|
| 375px (телефон) | Сетка товаров — 1 колонка (на `/parts` — 2 колонки категорий), кнопка «Категории» вместо сайдбара, кнопка «Фильтры» сворачивает панель, текст не обрезается и не вылезает за экран |
| 768px (планшет) | Сетка товаров — 2–3 колонки, дерево категорий по-прежнему в виде кнопки (до `lg:` брейкпоинта — 1024px) |
| 1024px (маленький десктоп) | Сетка категорий — 3–4 колонки, слева уже виден постоянный сайдбар с деревом категорий |
| 1440px+ (десктоп) | Сетка товаров — 4 колонки, всё содержимое ограничено `max-w-7xl`, не растягивается на всю ширину монитора |

Expected: на каждой ширине нет горизontальной прокрутки страницы, весь текст читаем, кнопки не перекрывают друг друга.

- [ ] **Step 2: Проверить пагинацию и фильтры целиком**

Зайти в категорию с большим числом товаров, перейти на страницу 2 через кнопку «Далее», применить фильтр цены — URL должен обновляться (`?minPrice=...&maxPrice=...`), при обновлении страницы (F5) фильтры должны сохраняться (значения читаются из `searchParams` на сервере).

- [ ] **Step 3: Проверить добавление в корзину**

Нажать кнопку/ссылку на карточке товара, перейти на страницу товара, добавить в корзину — убедиться, что корзина обновляется (переиспользуется существующий `ShopContext`, не переписывался).

- [ ] **Step 4: Финальная проверка сборки**

```bash
npm run build 2>&1 | tail -5
```

Expected: сборка проходит без ошибок и предупреждений о неиспользуемых импортах.
