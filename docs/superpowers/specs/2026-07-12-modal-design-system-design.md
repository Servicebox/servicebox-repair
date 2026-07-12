# Дизайн-система "Modal" (phosphor-терминал, светлая адаптация) для ServiceBox

Дата: 2026-07-12
Статус: утверждено пользователем, готово к планированию реализации.

## Контекст

Проект — Next.js App Router (JS, не TS, несмотря на упоминание TypeScript в исходном запросе — репозиторий фактически на `.js`/`.module.css`) с тремя визуальными зонами:
1. Публичный сайт (`src/components/Header`, `/about`, `/parts`, `/gallery`, ...)
2. Личный кабинет / авторизация (`LoginSignup` — модалка + страница `/loginsignup`)
3. Admin-panel — отдельная CRM-часть (`src/app/admin-panel/*`, `касса/склад/заказы/чаты/настройки`)

В `globals.css` уже есть зрелая токен-система: `:root` (светлая/дефолт), `[data-theme="dark"]`, `[data-contrast="high"]`, `[data-font-size]`. Последние 5 коммитов — активная миграция хардкод-цветов на `var(--color-*)`. Задача встраивается в эту же архитектуру, а не создаёт параллельную.

## Цель

Перекрасить всю палитру (все три зоны, все три темы) в стиль "Modal": светлый/прозрачный фон по умолчанию, акцент `#7fee64` (Lime Pulse), тёмная тема — "настоящий" phosphor-terminal (чёрный фон + лайм), high-contrast — WCAG-совместимый чёрный/белый/жёлтый с точечной заменой на зелёный там, где не роняет контраст. Добавить 3D CSS-куб `PhosphorCube` с брендингом "СЕРВИС БОКС"/"SB", шрифты Inter Tight + Inter Variable через `next/font/google`. Не менять структуру страниц, функциональность, PWA/service worker, "пузырь" (`BubbleBackground`).

## Токены (`src/app/globals.css`)

### `:root` (светлая, дефолтная)
```css
--color-bg: #ffffff;
--color-bg-dark: #ffffff;       /* было #ffffff, оставляем */
--color-bg-elevated: #f8f9fa;
--color-text: #1a1a2e;
--color-text-muted: #2d2d3f;    /* приглушённый тёмный, не серый — под phosphor-эстетику */
--color-text-inverse: #ffffff;
--color-primary: #7fee64;       /* было #0F52BA */
--color-primary-dark: #1a1a2e;  /* новый токен: тёмный фон/текст для Primary-кнопки */
--color-accent: #7fee64;        /* было #3498db, синхронизируем с primary */
--color-border: #e0e0e0;        /* было #e2e8f0 */
/* --color-success/--color-danger/--color-warning не трогаем — семантика важнее бренда */

/* новые токены */
--font-display: var(--font-inter-tight), 'Inter Tight', sans-serif;
--font-ui: var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--tracking-tight: -0.03em;
--cube-gradient: linear-gradient(135deg, #80ee64 0%, #18b759 50%, #09af58 100%);
--cube-halo: radial-gradient(circle, rgba(127, 238, 100, 0.35), transparent 70%);
```

### `[data-theme="dark"]`
Приводим к "истинному" phosphor-terminal виду вместо нынешнего почти-чёрного:
```css
--color-bg: #0a0a0a;      /* было #000000 */
--color-bg-dark: #141414; /* было #111111 */
--color-bg-elevated: #1a1a1a; /* без изменений */
--color-text: #e8ffe0;    /* phosphor-mint вместо нейтрального #f0f0f0 */
--color-primary: #7fee64; /* без изменений — уже верно */
--color-primary-dark: #0a0a0a;
/* остальное (accent/success/danger/warning/border) — без изменений, уже согласовано */
```

### `[data-contrast="high"]`
WCAG 7:1 приоритетнее бренда. Меняем **только** там, где `#7fee64` на чёрном/белом фоне проходит контраст (он проходит на `#000000`: контраст ~13:1 — ок):
```css
--color-primary: #7fee64;   /* было #ffff00 */
--color-primary-dark: #7fee64;
--color-accent: #7fee64;
--color-success: #7fee64;   /* совпадает с primary в этом режиме — ранее тоже совпадало (жёлтый=жёлтый) */
/* warning оставляем #ffff00 — иначе success и warning визуально сольются */
```

## Шрифты (`src/app/layout.js`)

```js
import { Inter, Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});
```
Классы `${interTight.variable} ${inter.variable}` — на `<html>`. В `globals.css`:
- `body { font-family: var(--font-ui); font-feature-settings: 'cv11' 1; }`
- `h1, h2, h3, h4 { font-family: var(--font-display); letter-spacing: var(--tracking-tight); }`

Системный стек остаётся фолбэком внутри `--font-ui`/`--font-display` (не удаляется, а становится вторым звеном).

## `PhosphorCube` (`src/components/PhosphorCube/PhosphorCube.js` + `.module.css`)

- Чистый CSS 3D transform, без библиотек. `'use client'` не обязателен (нет состояния/эффектов) — обычный серверный компонент.
- Проп `size: 'sm' | 'md' | 'lg'` (добавляю `'md'` сверх исходных двух — нужен для `LoginSignup`, где модалка компактна и полноразмерный `lg`-куб не влезет в `.modalHeader`):
  - `sm` (~48px) — хедер, грани без текста (слишком мелко для читаемости), только градиент.
  - `md` (~96px) — `LoginSignup` `.modalHeader`, грани `front/back` = "SB".
  - `lg` (~200px) — резерв для отдельной hero-секции, если появится позже; в этой итерации не используется явно, но компонент его поддерживает.
- Структура: `.cubeScene` (perspective: 800px) → `.cubeHalo` (статичный, radial-gradient blur, z-index ниже куба) → `.cube` (`transform-style: preserve-3d`, `animation: spin 80s linear infinite`) → 6 `.face` (`front/back/right/left/top/bottom`, `position:absolute`, `background: var(--cube-gradient)`).
- Текст на гранях: `front`/`back` — "SB" (`font-family: var(--font-display)`, крупный кегль); `right` — "СЕРВИС"; `left` — "БОКС" (мелкий кегль, вертикальный текст через `writing-mode: vertical-rl` при `size !== 'sm'`); `top`/`bottom` — без текста. Цвет текста — `var(--color-primary-dark)`.
- `@keyframes spin { from { transform: rotateX(0) rotateY(0); } to { transform: rotateX(360deg) rotateY(360deg); } }`.
- `@media (prefers-reduced-motion: reduce) { .cube { animation: none; } }`.

## Хедер (`src/components/Header/Header.js`, `Header.module.css`)

- `<PhosphorCube size="sm" />` добавляется в `.headerLogoLink`, рядом с существующим `<img favicon>` и текстовым лого (файл лого не удаляется).
- Текст лого (`.headerLogoMain`/`.headerLogoSub`) получает `font-family: var(--font-display); letter-spacing: var(--tracking-tight);`.
- `.header`, `.headerTopBar`: `background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);` (сейчас непрозрачный фон — меняется на полупрозрачный + blur).
- `.headerNavItem.active`, `.headerNavLink:hover` — цвет/подчёркивание через `var(--color-primary)` вместо текущего синего (наследуется автоматически там, где уже используется `var(--color-primary)`; проверяется на этапе реализации, есть ли хардкод-синий в этих правилах).
- `BubbleBackground` не трогается.

## Кнопки

- Глобальный `button {}` в `globals.css` (сейчас синий градиент `#0F52BA → #002147`) заменяется на Primary-стиль:
  ```css
  button {
    background: var(--color-primary-dark);
    color: #ffffff;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
  }
  button:hover:not(:disabled) {
    box-shadow: 0 0 0 3px rgba(127, 238, 100, 0.25);
  }
  ```
- Новые переиспользуемые классы в `globals.css` — `.btnGhost` (`background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary-dark);`) и `.pill` (accent pill: `background: var(--color-primary); color: var(--color-primary-dark); border-radius: 999px; padding: 0.25rem 0.75rem; font-weight: 600;`). Компонентные модули с собственными кнопочными классами (если хардкодят синий) — точечно правятся на этапе реализации по мере обнаружения, без изменения разметки/логики.

## Карточки и навигация (общее)

- Карточки: `background: var(--color-bg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);` — там, где уже используются токены, ничего делать не нужно; хардкод правится точечно.
- Навигация (хедер, сайдбар admin-panel): белый фон + blur + `border-bottom/border-right: 1px solid var(--color-border)`.

## Tailwind (`tailwind.config.cjs`)

```js
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-bg-elevated)',
      primary: 'var(--color-primary)',
      primaryDark: 'var(--color-primary-dark)',
      border: 'var(--color-border)',
    },
    fontFamily: {
      display: ['var(--font-display)'],
      ui: ['var(--font-ui)'],
    },
    letterSpacing: {
      tightest: '-0.03em',
    },
    // существующие animation/keyframes/screens — без изменений
  },
},
```

## Страница логина (`LoginSignup.js`, `.module.css`)

- `<PhosphorCube size="md" />` добавляется в `.modalHeader`, рядом с `<h2>` (не вместо него) — модалка компактна (`.modalOverlay`/`.modalContent`, flex-колонка), полноразмерный hero-куб не помещается без переверстки, что выходит за рамки задачи ("не менять структуру страниц").
- Форма (валидация, `YandexLoginButton`, состояние) не трогается.

## Что не входит в эту итерацию

- Файл существующего растрового лого (favicon.webp) не заменяется и не удаляется.
- Admin-panel сайдбар/топбар получает те же токены автоматически (через `var(--color-*)`), но точечная вёрстка `AdminPanel.module.css` (если там хардкод-цвета) правится по факту обнаружения — отдельная проверка на этапе реализации, т.к. файл активно меняется в текущей рабочей копии (см. git status).
- Манифест/favicon-иконки с текстом "SB" — вне CSS-скоупа этой задачи (генерация PNG/SVG-иконок), не включается в эту итерацию если не запрошено отдельно на этапе планирования.

## Проверка

- `npx tsc --noEmit` (в проекте JS, но `tsconfig.json` может проверять `.js` при `checkJs` — используется существующая конфигурация проекта как есть).
- `npm run build` должен пройти успешно.
- Ручная проверка в браузере: хедер, логин-модалка, admin-panel — на предмет отсутствия визуальных регрессий и читаемости текста на новом фоне.
