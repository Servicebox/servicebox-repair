# Фото плат с замерами — раздел депозитария

**Дата:** 2026-09-01
**Статус:** согласован (дизайн)
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
- API `/api/depository/board-photos` (публичный GET-список и GET-по-slug;
  админские POST/PATCH/DELETE).
- Админский UI: третья вкладка «Платы» в `/admin-panel/depository`
  (форма загрузки + список с правкой/удалением).
- Обработка изображения: `sharp` → webp, ширина ≤ 1600, качество 82,
  файлы в `public/uploads/board-photos/` (веб-доступны, индексируются).
- SEO: `generateMetadata` (title/description/canonical/OG), inline JSON-LD
  (`ImageObject` + `BreadcrumbList`), URL всех плат и раздела `/platy`
  в `sitemap.js`.
- Стилистика публичной части — через навык `ui-ux-pro-max`, тёмный
  тех-лук, консистентно с текущим сайтом.

**Не входит (YAGNI):**

- Структурированные таблицы замеров (точка / номинал / факт) — замеры
  наносятся на само фото заранее.
- Несколько фото на одну плату.
- Лайки, комментарии, версии/история фото.
- Загрузка фото обычными пользователями, модерация.
- Гейт регистрации на просмотр (раздел публичный — иначе не индексируется;
  гейт скачивания BIOS/прошивок из вкладки «Файлы» остаётся как есть).

## Архитектура

Подсистема повторяет уже существующие в репозитории паттерны:

- **Per-slug SEO-страница** — как `src/app/problems/[slug]/page.js`:
  `export const dynamic = 'force-static'`, `revalidate = 86400`,
  `generateStaticParams` (из БД), `generateMetadata`, inline
  `<script type="application/ld+json">`.
- **Загрузка изображения** — как `src/app/api/gallery/route.js`:
  `formData` → `sharp(buffer).webp(...)` → `writeFile` в
  `path.join(process.cwd(), 'public', 'uploads', 'board-photos')`,
  `mkdir({recursive:true})`, имя `${timestamp}-${random}.webp`.
- **Админ-гейт** — как остальной депозитарий: `getServerSession(request)`
  + `session.role === 'admin'`.
- **Sitemap** — добавить массив URL плат в `src/app/sitemap.js` (там уже
  есть DB-запросы за services/products/news/categories).

### Модель `src/models/BoardPhoto.js`

```
{
  title:        { type: String, required: true, trim: true },
  slug:         { type: String, required: true, unique: true, index: true },
  deviceType:   { type: String,
                  enum: ['videocard','laptop','motherboard','phone','console','tv','other'],
                  default: 'other', index: true },
  chip:         { type: String, trim: true, default: '' },   // «GP106-401-A1»
  description:  { type: String, default: '' },               // свободный текст
  imagePath:    { type: String, required: true },            // /uploads/board-photos/<name>.webp
  imageWidth:   { type: Number, required: true },
  imageHeight:  { type: Number, required: true },
  isActive:     { type: Boolean, default: true, index: true },
  viewCount:    { type: Number, default: 0 },
}
// timestamps: true
// index: { title: 'text', chip: 'text', description: 'text' }
```

`imageWidth/imageHeight` снимаются из `sharp(...).metadata()` при загрузке —
нужны для `next/image` без CLS и для `ImageObject`.

### Slug

Авто-транслитерация из `title` (латиница, нижний регистр, дефисы), с
ручной правкой в форме. При коллизии — суффикс `-2`, `-3`. Логику взять
из существующего транслита в репозитории, если есть
(`src/data/slug-migration-plan.json` / `scripts/migrate-service-slugs.mjs`
работают со slug услуг — проверить, есть ли переиспользуемая функция;
иначе — небольшая локальная).

### API `src/app/api/depository/board-photos/`

| Метод | Путь | Доступ | Назначение |
|---|---|---|---|
| GET | `/api/depository/board-photos` | публичный | список `isActive`, query: `deviceType`, `q` (поиск по title/chip), сортировка по `createdAt desc` |
| GET | `/api/depository/board-photos/[slug]` | публичный | одна запись по slug (для клиентских нужд; страница читает БД напрямую в RSC) |
| POST | `/api/depository/board-photos` | админ | multipart: `image`, `title`, `deviceType`, `chip?`, `description?` → sharp→webp, размеры, slug, `BoardPhoto.create` |
| PATCH | `/api/depository/board-photos/[id]` | админ | правка полей (title/deviceType/chip/description/isActive); при смене title slug НЕ меняем автоматически (чтобы не ломать индексацию) — правится вручную |
| DELETE | `/api/depository/board-photos/[id]` | админ | удалить запись + `unlink` файла |

Валидация загрузки: тип `image/jpeg|png|webp`, размер ≤ 15 МБ, `title`
непустой (≥ 3 символа).

### Публичная вкладка «Платы» на `/depository-public`

`src/components/DepositoryPublic/DepositoryPublic.js` получает переключатель
вкладок «Файлы» / «Платы» (локальный `useState`, без роутинга — состояние
вкладки в URL не выносим). Вкладка «Платы»:

- `GET /api/depository/board-photos` (+ `deviceType`, `q`)
- сетка карточек: превью-фото (`object-fit: contain`, тёмная подложка),
  название, бейдж типа устройства, чип
- клик по карточке → `/platy/[slug]`
- фильтр по `deviceType` (кнопки/чипсы), поле поиска

Вкладка «Файлы» — без изменений (включая гейт скачивания из пункта B).

### Страница платы `src/app/platy/[slug]/page.js`

```
export const dynamic = 'force-static';
export const revalidate = 86400;
export async function generateStaticParams()  // BoardPhoto.find({isActive:true}, {slug:1})
export async function generateMetadata({params})
export default async function BoardPhotoPage({params})
```

Контент:

- `<h1>` = `title`
- крупное фото (`next/image`, `imageWidth/imageHeight`, `priority`),
  клик → полноразмерный `imagePath` в новой вкладке / lightbox
- строка мета: тип устройства (человекочит.), чип, дата
- `description` (если есть)
- CTA-блок «Нужен ремонт платы? → соответствующая страница услуг»
  (маппинг `deviceType` → `/services/videocards`, `/services/laptops`,
  `/services/phones`, `/services/consoles`, `/services/tv`; для
  `motherboard`/`other` → `/services`)
- хлебные крошки: Главная → Депозитарий (`/depository-public`) →
  Платы (`/platy`) → {title}
- `viewCount++` — best-effort (не в RSC-рендере; отдельный лёгкий POST
  или пропустить в v1). **Решение: в v1 пропускаем `viewCount` инкремент
  на публичной странице** (поле остаётся, растёт только если понадобится
  позже), чтобы не усложнять static-страницу.

### Раздел `src/app/platy/page.js`

Список всех активных плат (сетка, как во вкладке, но самостоятельная
страница). `generateMetadata` + JSON-LD `CollectionPage`. `force-static` +
`revalidate`. Ссылка на неё — из хлебных крошек и из вкладки «Платы».
Вкладка на `/depository-public` и страница `/platy` показывают один и тот
же список; вкладка — точка входа из навигации депозитария, `/platy` —
канонический индексируемый раздел.

### Админский UI

`src/app/admin-panel/depository/page.js` — добавить третью вкладку
«Платы». Компоненты по образцу `src/components/depository/`:

- `BoardPhotoUpload` (по образцу `FileUpload.js`): input файла (drag&drop),
  `title`, `deviceType` (select), `chip`, `description` (textarea),
  предпросмотр выбранного фото, `POST` multipart
- `BoardPhotoList` (по образцу `DepositoryList.js`): таблица/карточки с
  превью, инлайн-правкой (title/deviceType/chip/description/isActive),
  кнопкой удаления, ссылкой «открыть на сайте» (`/platy/[slug]`)

### SEO детально

**`generateMetadata` для `/platy/[slug]`:**

- `title`: `{title} — фото платы с замерами | СЕРВИС БОКС`
- `description`: `description` (первые ~160 симв.) или авто:
  `Фото платы {title}{chip ? ", чип "+chip : ""} с точками замера
  сопротивления. Диагностика и ремонт {deviceTypeRu} в Вологде — СЕРВИС БОКС.`
- `alternates.canonical`: `${BASE_URL}/platy/${slug}`
- `keywords`: `{title}, {chip}, замеры платы, сопротивление, распиновка,
  ремонт {deviceTypeRu} Вологда, СЕРВИС БОКС`
- `openGraph`: `type: 'article'`, `images: [{ url: imagePath, width, height,
  alt: title }]`, `url`, `siteName: 'СЕРВИС БОКС Вологда'`, `locale: 'ru_RU'`
- `twitter`: `summary_large_image`, та же картинка

**JSON-LD `@graph` на `/platy/[slug]`:**

```
ImageObject:
  contentUrl: `${BASE_URL}${imagePath}`
  url:        `${BASE_URL}/platy/${slug}`
  width, height
  caption:    title
  name:       `${title} — фото платы с замерами`
  description: (та же, что в meta)
  creator / copyrightHolder: { '@id': `${BASE_URL}#business` }
  representativeOfPage: true
  datePublished: createdAt (ISO)

BreadcrumbList:
  Главная → Депозитарий → Платы → {title}
```

**`/platy` (раздел):** `generateMetadata` + JSON-LD `CollectionPage`
со ссылкой на `#business`.

**`sitemap.js`:** добавить
`BoardPhoto.find({isActive:true}, {slug:1, updatedAt:1})` →
`/platy/${slug}` (priority 0.7, changeFrequency 'monthly', lastmod
`updatedAt`), плюс статический `/platy` (priority 0.6).

### Хранилище файлов

`public/uploads/board-photos/` — **в `public/`** (в отличие от
`uploads/depository/` для BIOS-файлов), потому что фото должны быть
доступны напрямую и краулиться. `mkdir({recursive:true})` при первой
загрузке. Оригинал не храним — только обработанный webp.

## Обработка ошибок

- POST без файла / неверный тип / >15 МБ → 400 с понятным сообщением
- POST без `title` → 400
- Коллизия slug → авто-суффикс, не ошибка
- `sharp` не смог обработать → 400 «Не удалось обработать изображение»
- GET `/platy/[slug]` для несуществующего/неактивного slug → `notFound()`
- DELETE несуществующего id → 404; `unlink` несуществующего файла — не
  роняем запрос (лог + продолжаем)
- Все админские без сессии/не-админ → 401/403

## Тест-план

Локальный прод-сервер (`PORT=3123 npm start`), реальная БД:

1. **Загрузка (админ):** POST multipart с `IMG_0024.jpg` + title
   «Palit GTX 1060 6ГБ, чип GP106-401-A1» + deviceType `videocard` →
   201, в `public/uploads/board-photos/` появился `.webp`, в БД запись
   с `imageWidth/Height`, slug `palit-gtx-1060-6gb-chip-gp106-401-a1`.
2. **Второе фото** `IMG_0006.JPG`, deviceType `laptop`, chip `n18e-g2-a1`.
3. **Публичный список:** `GET /api/depository/board-photos` без сессии →
   200, обе записи; `?deviceType=videocard` → одна; `?q=gp106` → одна.
4. **Страница платы:** `curl /platy/<slug>` → в SSR-HTML есть `<h1>` с
   названием, `<link rel="canonical">`, `og:image` = webp, один блок
   `application/ld+json` с `ImageObject` + `BreadcrumbList`.
5. **Картинка:** `curl -I /uploads/board-photos/<name>.webp` → 200
   `image/webp` (статикой, без гейта).
6. **Раздел:** `/platy` → 200, обе карточки, JSON-LD `CollectionPage`.
7. **Sitemap:** `/sitemap.xml` содержит `/platy` и оба `/platy/<slug>`.
8. **Вкладка:** `/depository-public` — переключатель «Файлы»/«Платы»,
   на «Платы» видны карточки, гостю доступно (без входа).
9. **Правка (админ):** PATCH `isActive:false` → плата пропадает из
   списка и из `generateStaticParams` при следующей сборке; `/platy/<slug>`
   → 404 (после ревалидации/сборки).
10. **Удаление (админ):** DELETE → запись и файл удалены.
11. **Гейт:** POST/PATCH/DELETE без сессии → 401; с сессией не-админа → 403.
12. `npm run build` зелёный; независимый аудит перед коммитом/деплоем.

## Открытые вопросы

Нет. URL страницы платы — `/platy/[slug]` (согласовано: короткий,
ключевое слово в адресе; навигационно раздел внутри «Депозитария»).
