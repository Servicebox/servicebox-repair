# Фото плат с замерами — раздел депозитария

**Дата:** 2026-09-01
**Статус:** согласован (дизайн), ревизия 2 после независимого аудита спеки
**Автор задачи:** Toma

## Проблема

У сервиса накапливаются фотографии плат (видеокарты, материнки ноутбуков,
телефоны) с нанесёнными на снимок точками замера сопротивления / диодной
прозвонки. Пример: Palit GTX 1060, чип GP106-401-A1 — на фото подписаны
номиналы (к0мы, 0.2ом, 80ом, 935ом). Это ценный технический справочник,
которого сейчас нет на сайте. Запросы вида «GP106-401-A1 замеры»,
«n18e-g2-a1 сопротивление» — нишевые, низкоконкурентные, целевые.

Нужен раздел, где админ выкладывает такие фото, каждое фото — отдельная
индексируемая страница, попадающая в поиск.

## Область

**Входит:**

- Новая модель `BoardPhoto` (название платы + файл фото + опц. описание).
- Публичная вкладка «Платы» на `/depository-public` рядом с текущей вкладкой
  «Файлы»: сетка карточек, фильтр по типу устройства, поиск.
- Отдельная индексируемая страница на каждое фото: `/platy/[slug]`.
- Раздел-коллекция `/platy` (список всех плат, `CollectionPage`).
- Публичное API `GET /api/board-photos` (список) и `GET /api/board-photos/[slug]`
  (одна запись); отдача самого файла — `GET /api/board-photos/[slug]/image`.
- Админское API `/api/admin/board-photos` (POST/PATCH/DELETE) — под auth.
- Админский UI: третья вкладка «Платы» в `/admin-panel/depository`
  (форма загрузки + список с правкой/удалением).
- Обработка изображения: `sharp` → авто-поворот по EXIF → resize ширина ≤ 1600
  → webp q82, файлы в `uploads/board-photos/` (корень репо, как
  `uploads/depository/`), отдаются через route handler.
- SEO: `generateMetadata` (title/description/canonical/OG), inline JSON-LD
  (`ImageObject` + `BreadcrumbList`), URL всех плат и раздела `/platy`
  в `sitemap.js`, `/platy/` в `robots.js`.
- Стилистика публичной части — через навык `ui-ux-pro-max`, тёмный
  тех-лук, консистентно с текущим сайтом.

**Не входит (YAGNI):**

- Структурированные таблицы замеров — замеры наносятся на фото заранее.
- Несколько фото на одну плату.
- Лайки, комментарии, версии/история фото.
- Загрузка фото обычными пользователями, модерация.
- Гейт регистрации на просмотр (раздел публичный — иначе не индексируется).
- `viewCount` инкремент на публичной странице (поле в модели оставляем,
  не трогаем в v1 — не усложняем static-страницу).

## Ключевые выводы аудита спеки (что было исправлено)

- **B1.** `public/`-файлы, записанные ПОСЛЕ старта прод-сервера, Next не
  отдаёт (снимок каталога `public/` делается один раз при загрузке;
  `src/server.js` запускается с `NODE_ENV=production` → `dev=false`).
  Существующие `/uploads/gallery/*` работают только потому, что закоммичены
  и попадают в снимок при сборке. → **Фото плат отдаём через route handler
  `readFile`**, файлы вне `public/`, `next/image` для них НЕ используем.
- **B2.** «Админ-гейт как в депозитарии» — такого гейта НЕТ: `POST
  /api/depository/files`, `/api/depository/categories`, `/api/gallery` —
  полностью без авторизации. Реальная идиома — только в `/api/admin/*`:
  `if (!session || session.role !== 'admin') return ...`. → Админские
  мутации кладём в `/api/admin/board-photos` (покрыто middleware для
  `/api/admin/*` + явная проверка роли в каждом обработчике).
- **B3.** `sharp(buf).metadata()` даёт размеры ИСХОДНИКА, не результата.
  → Размеры берём из `.toBuffer({ resolveWithObject: true })` → `info`.
  Плюс `.rotate()` до resize — иначе портретные фото с телефона
  сохранятся боком (баг есть в `api/gallery/route.js`, не копировать).
- **G1/G2.** `dynamicParams` не был указан. → `export const dynamicParams
  = true` (как в `product/[slug]/page.js`); из POST/PATCH/DELETE вызываем
  `revalidatePath('/platy')` и `revalidatePath('/platy/${slug}')` — иначе
  новое фото не видно на `/platy` до 24 ч, а деактивированное живёт 24 ч.
- **G3.** Транслит уже есть: `@/lib/slugify` → `generateSlug(text)` и
  `generateUniqueSlug(Model, title, excludeId)` (суффикс `-1`, `-2`).
  Новую утилиту не пишем.
- **G4.** `BASE_URL` берём из `@/lib/constants`, а НЕ из локального
  `getBaseUrl()` в `problems/[slug]`. `BreadcrumbList` строим через
  `createBreadcrumbList` из `@/lib/seo-helpers`. `@id` `#business` /
  `#website` эмитятся в `layout.js` на каждой странице — ссылаться можно.
- **G6.** Next 15: `const { slug } = await params` во всех
  `[slug]`/`[id]` обработчиках (депозитарные роуты используют старую
  синхронную форму — не копировать).
- **G7.** В репо нет `error.js`/`loading.js` нигде. Свои границы не
  вводим; `notFound()` → глобальный `src/app/not-found.js`.

## Архитектура

Подсистема повторяет проверенные паттерны репозитория:

- **Per-slug SEO-страница, DB-driven** — образец `src/app/product/[slug]/page.js`
  (`dynamic='force-static'`, `dynamicParams=true`, `generateStaticParams`
  из Mongo, `generateMetadata`, `const {slug}=await params`, inline
  `<script type="application/ld+json">`). НЕ `problems/[slug]` — он на
  статическом JS-объекте и не годится как шаблон для БД.
- **Отдача бинарника через route handler** — образец
  `src/app/api/depository/files/[id]/download/route.js` (`readFile` +
  `Content-Type` + заголовки), но без auth и с `Content-Disposition:
  inline` + `Cache-Control: public, max-age=31536000, immutable`.
- **Загрузка+`sharp`** — общий подход из `src/app/api/gallery/route.js`
  (`request.formData()`, `sharp`, `mkdir({recursive:true})`), но:
  `.rotate()` перед resize; `resize({ width: 1600, withoutEnlargement:true })`
  (без cap по высоте — в gallery захардкожено `1200x800`, не копировать);
  размеры из `resolveWithObject`.
- **Админ-гейт** — образец `src/app/api/admin/pricing-matrix/route.js:12`:
  `const session = await getServerSession(request); if (!session ||
  session.role !== 'admin') return 401/403;`. `src/lib/session.js` роль
  возвращает (`role || 'user'`).
- **Sitemap** — `src/app/sitemap.js`: `createEntry(path, priority,
  changeFrequency='monthly', lastmod)`; добавить `BoardPhoto.find` в
  существующий `Promise.all` и записи в `dbUrls`, `try/catch` уже есть.

### Модель `src/models/BoardPhoto.js`

```
{
  title:        { type: String, required: true, trim: true },
  slug:         { type: String, required: true, unique: true, index: true },
  deviceType:   { type: String,
                  enum: ['videocard','laptop','motherboard','phone','tablet','console','tv','other'],
                  default: 'other', index: true },
  chip:         { type: String, trim: true, default: '' },   // «GP106-401-A1»
  description:  { type: String, default: '' },               // свободный текст
  imageName:    { type: String, required: true, unique: true }, // <uuid>.webp на диске
  imageWidth:   { type: Number, required: true },              // из resolveWithObject
  imageHeight:  { type: Number, required: true },
  isActive:     { type: Boolean, default: true, index: true },
  viewCount:    { type: Number, default: 0 },
}
// timestamps: true
// schema.index({ title: 'text', chip: 'text', description: 'text' })
// export default mongoose.models.BoardPhoto || mongoose.model('BoardPhoto', schema)
```

Храним только `imageName` (не полный путь) — путь собирается как
`path.join(process.cwd(), 'uploads', 'board-photos', imageName)`.

### Slug

`generateUniqueSlug(BoardPhoto, title)` из `@/lib/slugify`.
Проверено вручную: `"Palit GTX 1060 6ГБ, чип GP106-401-A1"` →
`palit-gtx-1060-6gb-chip-gp106-401-a1`. При PATCH title slug
**не пересчитываем** (чтобы не ломать индексацию) — правится вручную
отдельным полем формы.

### API

Публичное — `src/app/api/board-photos/`:

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/board-photos` | список `isActive`, query `deviceType`, `q` (поиск по title/chip), сорт. `createdAt desc` |
| GET | `/api/board-photos/[slug]` | одна запись по slug (для клиентских нужд; страница читает Mongo напрямую в RSC) |
| GET | `/api/board-photos/[slug]/image` | сам файл: `readFile(path.join(cwd,'uploads','board-photos',doc.imageName))`, `Content-Type: image/webp`, `Cache-Control: public, max-age=31536000, immutable`, `Content-Disposition: inline`. 404 если записи/файла нет. |

Админское — `src/app/api/admin/board-photos/` (middleware `/api/admin/*`
уже проверяет JWT; плюс явная `session.role !== 'admin'` в каждом):

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/admin/board-photos` | multipart: `image`, `title`, `deviceType`, `chip?`, `description?` → валидация → `sharp().rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true})` → `writeFile(uploads/board-photos/<uuid>.webp)` → `imageWidth/Height` из `info` → `generateUniqueSlug` → `BoardPhoto.create` → `revalidatePath('/platy')` → 201 |
| PATCH | `/api/admin/board-photos/[id]` | правка `title`/`slug`/`deviceType`/`chip`/`description`/`isActive`; `revalidatePath('/platy')` + `revalidatePath('/platy/'+doc.slug)` |
| DELETE | `/api/admin/board-photos/[id]` | `unlink` файла (не роняем, если файла нет) + `deleteOne` + `revalidatePath('/platy')` + `revalidatePath('/platy/'+slug)` |

Все `[id]`/`[slug]` — через `const { id } = await params`.

Валидация загрузки: `image` присутствует, тип `image/jpeg|png|webp`,
размер ≤ 15 МБ, `title` ≥ 3 симв. Ошибки → 400 с текстом. `sharp`
кинул → 400 «Не удалось обработать изображение».

### Публичная вкладка «Платы» на `/depository-public`

`src/components/DepositoryPublic/DepositoryPublic.js` — добавить
`const [activeTab, setActiveTab] = useState('files')` и переключатель
«Файлы» / «Платы» (без роутинга, состояние в URL не выносим). Вкладка
«Платы»:

- `fetch('/api/board-photos?' + params)` — с `deviceType`, `q`;
  **параметры фильтра — в массив зависимостей `useEffect`** (в текущем
  `fetchFiles` deps `[]` при используемом `selectedCategory` — известный
  баг, не повторять).
- сетка карточек: `<img src="/api/board-photos/{slug}/image" width height
  loading="lazy">` (тёмная подложка, `object-fit: contain`), название,
  бейдж `deviceType`, чип.
- клик → `/platy/[slug]`.

Вкладка «Файлы» и гейт скачивания (пункт B) — без изменений.
`src/app/depository-public/page.js` — метаданные уже с canonical,
не трогаем.

### Страница платы `src/app/platy/[slug]/page.js`

```
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  // await dbConnect(); BoardPhoto.find({ isActive: true }, { slug: 1 }).lean()
}
export async function generateMetadata({ params }) { const { slug } = await params; ... }
export default async function BoardPhotoPage({ params }) {
  const { slug } = await params;
  // dbConnect; const doc = await BoardPhoto.findOne({ slug, isActive: true }).lean();
  // if (!doc) notFound();
}
```

Контент:

- `<h1>` = `doc.title`
- крупное фото: `<img src={`/api/board-photos/${slug}/image`}
  width={doc.imageWidth} height={doc.imageHeight} alt={doc.title}
  fetchpriority="high">`; клик → тот же URL в новой вкладке
- мета-строка: `deviceType` (человекочит.), `chip`, дата (`createdAt`)
- `doc.description` (если есть)
- CTA-блок «Нужен ремонт платы? → …» по карте `deviceType`:
  `videocard→/services/videocards`, `laptop→/services/laptops`,
  `phone→/services/phones`, `tablet→/services/tablets`,
  `console→/services/consoles`, `tv→/services/tv`,
  `motherboard|other→/services` (все проверены — существуют)
- хлебные крошки: Главная → Депозитарий (`/depository-public`) →
  Платы (`/platy`) → {title}

### Раздел `src/app/platy/page.js`

```
export const dynamic = 'force-static';
export const revalidate = 86400;
```

Список всех активных плат (сетка карточек, как во вкладке). Актуальность
между сборками держится за счёт `revalidatePath('/platy')` из админских
мутаций. `generateMetadata` + JSON-LD `CollectionPage`. Вкладка на
`/depository-public` — точка входа из навигации; `/platy` — канонический
индексируемый раздел; показывают один и тот же список.

### Админский UI

`src/app/admin-panel/depository/page.js` уже использует
`activeTab`-паттерн на 3 вкладки — добавить 4-ю «Платы». Компоненты по
образцу `src/components/depository/`:

- `BoardPhotoUpload` (по образцу `FileUpload.js`): input файла (drag&drop),
  `title`, `deviceType` (select), `chip`, `description` (textarea),
  превью выбранного фото, `POST` multipart на `/api/admin/board-photos`
- `BoardPhotoList` (по образцу `DepositoryList.js`): карточки с превью
  (`/api/board-photos/{slug}/image`), инлайн-правка
  (title/slug/deviceType/chip/description/isActive), удаление, ссылка
  «открыть на сайте» (`/platy/{slug}`)

### SEO детально

`BASE_URL` — из `@/lib/constants`.

**`generateMetadata` для `/platy/[slug]`:**

- `title`: `{title} — фото платы с замерами | СЕРВИС БОКС`
- `description`: `description` (первые ~160 симв.) или авто:
  `Фото платы {title}{chip ? ", чип "+chip : ""} с точками замера
  сопротивления. Диагностика и ремонт {deviceTypeRu} в Вологде — СЕРВИС БОКС.`
- `alternates.canonical`: `${BASE_URL}/platy/${slug}`
- `keywords`: `{title}, {chip}, замеры платы, сопротивление, распиновка,
  ремонт {deviceTypeRu} Вологда, СЕРВИС БОКС`
- `openGraph`: `type: 'article'`, `images: [{ url:
  `${BASE_URL}/api/board-photos/${slug}/image`, width: imageWidth,
  height: imageHeight, alt: title }]`, `url`, `siteName: 'СЕРВИС БОКС
  Вологда'`, `locale: 'ru_RU'`
- `twitter`: `summary_large_image`, та же картинка

**JSON-LD `@graph` на `/platy/[slug]`:**

```
ImageObject:
  contentUrl:  `${BASE_URL}/api/board-photos/${slug}/image`
  url:         `${BASE_URL}/platy/${slug}`
  width, height
  caption:     title
  name:        `${title} — фото платы с замерами`
  description: (та же, что в meta)
  creator:     { '@id': `${BASE_URL}#business` }
  copyrightHolder: { '@id': `${BASE_URL}#business` }
  representativeOfPage: true
  datePublished: createdAt (ISO)

BreadcrumbList:  createBreadcrumbList([
  { name: 'Главная', url: BASE_URL },
  { name: 'Депозитарий', url: `${BASE_URL}/depository-public` },
  { name: 'Платы', url: `${BASE_URL}/platy` },
  { name: title, url: `${BASE_URL}/platy/${slug}` },
])
```

**`/platy` (раздел):** `generateMetadata` + JSON-LD `CollectionPage`
с `about: { '@id': ${BASE_URL}#business }`.

**`src/app/sitemap.js`:**
- в `staticUrls` — `['/platy', 0.6, 'monthly']`
- в `Promise.all` — `BoardPhoto.find({ isActive: true }, { slug: 1, updatedAt: 1 }).lean()`
- в `dbUrls` — `...boards.filter(b => b.slug).map(b => createEntry(`/platy/${encodeURIComponent(b.slug)}`, 0.7, 'monthly', b.updatedAt))`

**`src/app/robots.js`:** в explicit-allow списке AI-краулеров (там уже
перечислены `/brands/`, `/problems/`, `/gallery/`) добавить `/platy/` и
`/api/board-photos/`.

### Хранилище файлов

`uploads/board-photos/` в **корне репозитория** (как `uploads/depository/`),
НЕ под `public/`. `mkdir({recursive:true})` при первой загрузке. Файлы
runtime-only, в git не коммитим (`git pull` untracked не трогает —
переживают деплой). Отдаются только через
`GET /api/board-photos/[slug]/image` (`readFile`) — поэтому проблема
снимка `public/` при старте прод-сервера не касается. `next/image` для
них не используем (его оптимизатор идёт через тот же снимок + `deviceSizes`
максимум 1200).

## Обработка ошибок

- POST без файла / неверный тип / > 15 МБ / `title` < 3 → 400 с текстом
- Коллизия slug → авто-суффикс `-1`, `-2` (в `generateUniqueSlug`), не ошибка
- `sharp` не смог обработать → 400 «Не удалось обработать изображение»
- GET `/platy/[slug]` для несуществующего/неактивного → `notFound()` → глобальный 404
- GET `/api/board-photos/[slug]/image` — нет записи или файла → 404
- DELETE несуществующего id → 404; `unlink` несуществующего файла — лог + продолжаем
- Все админские без сессии → 401; сессия не-админа → 403
- Свои `error.js`/`loading.js` не вводим (в репо их нет)

## Тест-план

Локальный прод-сервер (`PORT=3123 npm start`, `NODE_ENV=production`),
реальная БД. Через реальный админ-cookie (или временно ослабив гейт для
теста — вернуть перед коммитом):

1. **Загрузка (админ):** POST multipart с `~/Desktop/IMG_0024.jpg`
   (портрет) + title «Palit GTX 1060 6ГБ, чип GP106-401-A1» + deviceType
   `videocard` → 201. На диске `uploads/board-photos/<uuid>.webp`. В БД
   запись, slug `palit-gtx-1060-6gb-chip-gp106-401-a1`, `imageWidth` >
   `imageHeight` (портрет НЕ перевёрнут — проверка `.rotate()`),
   `imageWidth` ≤ 1600.
2. **Второе фото** `~/Desktop/IMG_0006.JPG` (ландшафт), deviceType `laptop`,
   chip `n18e-g2-a1`.
3. **Отдача файла БЕЗ рестарта сервера:** сразу после п.1
   `curl -I http://127.0.0.1:3123/api/board-photos/<slug>/image` → 200
   `image/webp`, `Cache-Control: …immutable`. (Ключевой тест B1 —
   работает без перезапуска.)
4. **Публичный список:** `GET /api/board-photos` без сессии → 200, обе
   записи; `?deviceType=videocard` → одна; `?q=gp106` → одна.
5. **Страница платы:** `curl http://127.0.0.1:3123/platy/<slug>` → в
   SSR-HTML есть `<h1>` с названием, `<link rel="canonical">`,
   `og:image` = `…/api/board-photos/<slug>/image`, один блок
   `application/ld+json` с `ImageObject` + `BreadcrumbList`. Фото —
   `<img>` с `width`/`height` из БД.
6. **Раздел:** `/platy` → 200, обе карточки, JSON-LD `CollectionPage`.
7. **Sitemap:** `/sitemap.xml` содержит `/platy` и оба `/platy/<slug>`.
8. **robots:** `/robots.txt` — `/platy/` в allow AI-краулеров.
9. **Вкладка:** `/depository-public` — переключатель «Файлы»/«Платы»,
   на «Платы» видны карточки, гостю доступно (без входа). Фильтр по
   `deviceType` реально дёргает `fetch` (проверка deps).
10. **Правка (админ):** PATCH `isActive:false` → `revalidatePath` →
    `/platy/<slug>` → 404 сразу (не через 24 ч), пропала из `/platy` и
    из списка API.
11. **Удаление (админ):** DELETE → запись, файл, обе страницы — нет.
12. **Гейт:** POST/PATCH/DELETE на `/api/admin/board-photos` без сессии →
    401; с сессией не-админа → 403.
13. `npm run build` зелёный; в билд-логе `/platy` и `/platy/[slug]`
    присутствуют (SSG/ISR).
14. Независимый аудит кода перед коммитом; деплой; проверка живых URL,
    sitemap, отдачи картинки на проде.

## Открытые вопросы

Нет. URL страницы платы — `/platy/[slug]` (согласовано). Хранилище и
отдача файла — route handler `readFile` (решено по итогам аудита B1).
Админские мутации — `/api/admin/board-photos` под middleware + явная
проверка роли (решено по итогам аудита B2).

## Побочная находка аудита (вне области D — на заметку Toma)

`POST /api/depository/files`, `/api/depository/categories`, `/api/gallery`
сейчас **без какой-либо авторизации** — любой может загрузить файл/фото
в депозитарий и галерею с прода. Пункт B закрыл только скачивание BIOS.
Стоит закрыть загрузку отдельной задачей.
