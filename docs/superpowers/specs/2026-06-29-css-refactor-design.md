# CSS Refactoring & Theme System — Design Spec

**Date:** 2026-06-29  
**Project:** servicebox35.ru (Next.js 15, App Router, JavaScript)  
**Scope:** Full project — all 90+ CSS Module files + globals.css + layout.js + Header

---

## Goals

1. Fix broken CSS variable scoping (`.root` → `:root`)
2. Deduplicate and consolidate `globals.css`
3. Implement light/dark theme via CSS variables + `data-theme` attribute
4. Add accessibility controls: font-size cycling, high-contrast mode, skip-to-content
5. Add theme/a11y toggle buttons to Header
6. Migrate all 90+ CSS Module files from hardcoded colors to semantic CSS tokens

---

## Constraints

- Pure JavaScript (no TypeScript)
- No new pages or components (use existing Header.js, layout.js)
- Do not break forms, admin panel, reviews, or any existing functionality
- Keep Tailwind for layout utilities (flex, grid, spacing); remove only color Tailwind classes from body
- Dark theme palette: black background `#000`, green accents `#7fee64` / `#ddffdc` (follows Modal style)
- Social brand colors (VK, WhatsApp, Telegram) stay hardcoded — not theme-sensitive

---

## Architecture

### 1. Token System in `globals.css`

Replace the broken `.root {}` block and all duplicate variable definitions with three canonical blocks:

**Light theme (`:root`):**
```css
:root {
  /* Backgrounds */
  --color-bg: #f8fafc;
  --color-bg-dark: #ffffff;
  --color-bg-elevated: #f1f5f9;

  /* Text */
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-text-inverse: #ffffff;

  /* Brand */
  --color-primary: #0F52BA;
  --color-primary-dark: #002147;
  --color-accent: #3498db;

  /* Semantic */
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ff8c00;

  /* UI */
  --color-border: #e2e8f0;
  --color-shadow: rgba(0, 0, 0, 0.08);

  /* Font scale */
  --font-scale: 1;

  /* Transitions */
  --transition-theme: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
```

**Dark theme (`[data-theme="dark"]`):**
```css
[data-theme="dark"] {
  --color-bg: #000000;
  --color-bg-dark: #111111;
  --color-bg-elevated: #1a1a1a;
  --color-text: #f0f0f0;
  --color-text-muted: #a0a0a0;
  --color-text-inverse: #000000;
  --color-primary: #7fee64;
  --color-primary-dark: #ddffdc;
  --color-accent: #ddffdc;
  --color-success: #7fee64;
  --color-danger: #ff5555;
  --color-warning: #ffcc00;
  --color-border: #2a2a2a;
  --color-shadow: rgba(0, 0, 0, 0.4);
}
```

**High-contrast mode (`[data-contrast="high"]`):**
```css
[data-contrast="high"] {
  --color-bg: #000000;
  --color-bg-dark: #000000;
  --color-bg-elevated: #000000;
  --color-text: #ffffff;
  --color-text-muted: #ffffff;
  --color-primary: #ffff00;
  --color-accent: #ffff00;
  --color-border: #ffffff;
  --color-shadow: none;
}
```

**Font scale variants:**
```css
[data-font-size="lg"] { --font-scale: 1.125; }
[data-font-size="xl"] { --font-scale: 1.25; }

html { font-size: calc(1rem * var(--font-scale)); }
```

**Kept from existing globals.css (unchanged):**
- Tailwind directives (`@tailwind base/components/utilities`)
- `prefers-reduced-motion` media query
- `prefers-contrast: high` media query (kept as progressive enhancement)
- iOS font-size `!important` (only legitimate one)
- Chatwoot override `!important` block
- Loader `@keyframes` (referenced by `ui/loader-3.jsx`)
- CLS-prevention `aspect-ratio` image rules
- Responsive table styles

**Removed from existing globals.css:**
- `.root {}` block (wrong selector — was never applying variables)
- All duplicate variable definitions
- `form { max-width: 500px }` global (too aggressive; moved to `Form/Form.module.css`)
- `.reduceMotion` class (kept — JS fallback hook)

**Added to globals.css:**
- Skip-to-content link styles
- `body { background: var(--color-bg); color: var(--color-text); transition: var(--transition-theme); }`
- `:focus-visible` outline using `var(--color-primary)`

**Skip-to-content:**
```css
.skip-to-content {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-to-content:focus-visible {
  position: fixed;
  top: 0; left: 0;
  width: auto; height: auto;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  z-index: 9999;
  font-weight: 600;
  outline: none;
}
```

---

### 2. Hooks

All three hooks live in `src/hooks/`. All are `'use client'` and self-contained (no context needed).

#### `useTheme.js`
- Reads `localStorage.getItem('theme')`; falls back to `window.matchMedia('(prefers-color-scheme: dark)').matches`
- Writes `document.documentElement.setAttribute('data-theme', value)`
- Persists choice to `localStorage`
- Returns `{ theme, toggleTheme }` — toggles between `'light'` and `'dark'`

#### `useFontSize.js`
- Three levels in order: `'normal'` → `'lg'` → `'xl'` → back to `'normal'`
- Reads `localStorage.getItem('fontSize')`; defaults to `'normal'`
- Writes `document.documentElement.setAttribute('data-font-size', value)` (removes attr on `'normal'`)
- Returns `{ fontSize, cycleFontSize }` — cycles through the three levels

#### `useHighContrast.js`
- Boolean toggle
- Reads `localStorage.getItem('highContrast') === 'true'`
- Writes/removes `document.documentElement.setAttribute('data-contrast', 'high')`
- Returns `{ isHighContrast, toggleHighContrast }`

---

### 3. Header Changes

**`Header.js` additions:**
- Import `useTheme`, `useFontSize`, `useHighContrast`
- Add `<div role="group" aria-label="Настройки отображения" className={styles.a11yControls}>` inside `.headerActions`
- Three buttons inside the group:
  1. **Theme toggle** — sun icon (light) / moon icon (dark). `aria-label` = `"Светлая тема"` / `"Тёмная тема"`. `aria-pressed={theme === 'dark'}`.
  2. **Font size** — text `"A"` with superscript showing current level. `aria-label="Размер текста: нормальный/большой/очень большой"`. Cycles on click.
  3. **High contrast** — `◑` symbol. `aria-label="Высокий контраст"`. `aria-pressed={isHighContrast}`.
- Icons sourced from `@fortawesome/free-solid-svg-icons` (already imported in Header): `faSun`, `faMoon` for theme; `faEye` for contrast. Consistent with existing Header icon usage.

**`Header.module.css` additions:**
```css
.a11yControls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.themeToggle,
.fontSizeBtn,
.contrastToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  cursor: pointer;
  transition: var(--transition-theme);
  font-size: 0.8rem;
  font-weight: 700;
}

.themeToggle:hover,
.fontSizeBtn:hover,
.contrastToggle:hover {
  background: var(--color-border);
}

.themeToggle[aria-pressed="true"],
.contrastToggle[aria-pressed="true"] {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}
```

**All other existing colors in `Header.module.css`** replaced with tokens (e.g. `color: #002147` → `var(--color-primary-dark)`, `background: white` → `var(--color-bg-dark)`).

---

### 4. CSS Module Migration

**Scope:** All files listed below, excluding no-color files (pure layout).

**Mechanical token mapping:**

| Hardcoded value(s) | Replacement token |
|---|---|
| `#ffffff`, `white` | `var(--color-bg-dark)` |
| `#f8f9fa`, `#f8fafc`, `#f3f4f6`, `#f9fafb` | `var(--color-bg)` |
| `#edf2f7`, `#e9ecef`, `#f1f5f9` | `var(--color-bg-elevated)` |
| `#000`, `#111`, `#1f2937`, `#2d3748`, `#1e293b` | `var(--color-text)` |
| `#333`, `#374151`, `#4b5563`, `#6b7280`, `#718096`, `#7f8c8d` | `var(--color-text-muted)` |
| `#002147`, `#0F52BA`, `#2563eb`, `#1d4ed8` | `var(--color-primary)` |
| `#003060`, `#00375b` | `var(--color-primary-dark)` |
| `#3498db`, `#007bff`, `#3b82f6`, `#4299e1`, `#0056b3` | `var(--color-accent)` |
| `#e2e8f0`, `#dee2e6`, `#d1d5db`, `#e5e7eb` | `var(--color-border)` |
| `#28a745`, `#38a169`, `#10b981` | `var(--color-success)` |
| `#dc3545`, `#e53e3e`, `#ef4444`, `#e74c3c`, `#c0392b` | `var(--color-danger)` |
| `#ff8c00`, `#ed8936`, `#f59e0b`, `#f39c12` | `var(--color-warning)` |
| `rgba(0,0,0,0.1)` (box-shadow) | `var(--color-shadow)` |

**NOT migrated (stays hardcoded):**
- `#4a76a8` (VK brand)
- `#25d366` (WhatsApp brand)
- `#0088cc` (Telegram brand)
- Admin analytics chart colors
- Loader animation `--primary` vars in globals.css loader block

**`!important` removal:** Remove from all CSS Module files. Keep only:
- `font-size: 16px !important` in `globals.css` (iOS zoom prevention)
- Chatwoot `display: none !important` block in `globals.css`

---

### 5. `layout.js` Changes

**Order of operations in `<head>`:**

1. Anti-flash script (FIRST — before any other script)
2. Existing GTM script
3. Preconnect/DNS-prefetch links
4. Chatwoot CLS reserve `<style>`
5. Structured data `<script>`

**Anti-flash script:**
```js
<script dangerouslySetInnerHTML={{ __html: `(function(){
  try {
    var t = localStorage.getItem('theme');
    var pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t || pref);
    var fs = localStorage.getItem('fontSize');
    if (fs && fs !== 'normal') document.documentElement.setAttribute('data-font-size', fs);
    var hc = localStorage.getItem('highContrast');
    if (hc === 'true') document.documentElement.setAttribute('data-contrast', 'high');
  } catch(e) {}
})();` }} />
```

**`<body>` change:**
```jsx
// Before:
<body className="bg-gray-50 text-slate-900">

// After:
<body>
```

**Skip-to-content link (first child of `<body>`):**
```jsx
<a href="#main-content" className="skip-to-content">
  Перейти к основному содержимому
</a>
```

**`<main>` gets `id="main-content"`:**
```jsx
<main id="main-content">{children}</main>
```

---

## File Change Summary

| File | Change type |
|---|---|
| `src/app/globals.css` | Major rewrite — tokens, skip-link, dedup |
| `src/app/layout.js` | Anti-flash script, skip link, remove body classes, main id |
| `src/hooks/useTheme.js` | New file |
| `src/hooks/useFontSize.js` | New file |
| `src/hooks/useHighContrast.js` | New file |
| `src/components/Header/Header.js` | Add hooks + 3 buttons |
| `src/components/Header/Header.module.css` | Migrate colors + add a11y control styles |
| `src/components/**/*.module.css` (~88 files) | Mechanical color → token replacement |
| `src/app/**/*.module.css` (~22 files) | Mechanical color → token replacement |
| `src/app/**/*.css` (4 plain CSS files: `ImageGallery.css`, `ListService.css`, `Consent.css`, `Gallery.css`) | Mechanical color → token replacement |

---

## WCAG AA Compliance

Token values in light mode meet 4.5:1 for body text:
- `--color-text` `#1e293b` on `--color-bg` `#f8fafc` → contrast ratio ~12:1 ✓
- `--color-primary` `#0F52BA` on `--color-bg-dark` `#ffffff` → ~7.2:1 ✓

Token values in dark mode:
- `--color-text` `#f0f0f0` on `--color-bg` `#000000` → ~18:1 ✓
- `--color-primary` `#7fee64` on `--color-bg` `#000000` → ~9.8:1 ✓

High-contrast mode:
- White on black → 21:1 ✓
- Yellow `#ffff00` on black → ~19.6:1 ✓

---

## Out of Scope

- `AccessibilityPanel` standalone component (user requested optional — excluded)
- Reduced-motion JS toggle button (CSS `prefers-reduced-motion` media query handles it; `.reduceMotion` class hook kept for future)
- Admin panel visual redesign (colors migrated to tokens, but no dark-mode-specific admin styling)
- E2E or visual regression tests (separate task)
