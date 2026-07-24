# Modal Design System Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire ServiceBox site (public pages, personal account, admin-panel) from the current blue corporate palette to the light-mode "Modal" phosphor-terminal palette (lime accent `#7fee64`), add a `PhosphorCube` CSS-3D branding component, and switch typography to Inter Tight / Inter Variable — without changing page structure, functionality, PWA/service worker, or the "bubble" (`BubbleBackground`).

**Architecture:** The project already has a mature CSS custom-property token system in `src/app/globals.css` (`:root`, `[data-theme="dark"]`, `[data-contrast="high"]`) that most components already consume via `var(--color-*)`. We redefine token values (not names, except new additions) so the repaint propagates automatically to any component already using tokens, and touch only the handful of files that still hardcode the old blue (`#0F52BA` / `#002147` / `#3498db`). `PhosphorCube` is a new, dependency-free component using CSS 3D transforms.

**Tech Stack:** Next.js App Router (JavaScript, not TypeScript — despite the original request mentioning TS, this repo has no `tsconfig.json`; see Global Constraints), CSS Modules, Tailwind CSS, `next/font/google`.

## Global Constraints

- Repo is plain JS/JSX (`.js`, `.module.css`) with **no `tsconfig.json`** — `npx tsc --noEmit` is not runnable here. Verification instead uses `npm run build` (runs `next build`) and `npm run lint` (runs `next lint`), the project's actual scripts. This is a deliberate deviation from the original request's TS wording, forced by repo reality.
- No test framework is installed (no Jest/Vitest/Playwright in `package.json`). Do not install one as part of this plan (YAGNI — out of scope for a CSS/branding reskin). Verification per task is: `npm run build` succeeds, plus targeted `grep` checks confirming old values are gone / new values present.
- Primary accent color: `#7fee64` (Lime Pulse) — must stay exactly this value everywhere it's used as "primary".
- Cube gradient: `linear-gradient(135deg, #80ee64 0%, #18b759 50%, #09af58 100%)`.
- Cube rotation: continuous, 80s, `linear`, disabled under `prefers-reduced-motion: reduce`.
- Do not touch: `BubbleBackground`, PWA manifest, service worker, page routing/structure, any API/webhook/fiscalization logic.
- Do not change `--color-success`, `--color-danger`, `--color-warning` in any theme (semantic colors, out of scope).
- Animations are CSS-only (no Framer Motion, no GSAP, no JS libraries).
- Fonts via `next/font/google` only (no manual `<link>` tags, no self-hosted font files).
- Design spec: `docs/superpowers/specs/2026-07-12-modal-design-system-design.md` (read this first if any task instruction seems ambiguous — it has the full rationale, including two bug fixes found during planning: `--color-primary-dark`/`--color-accent` must NOT be darkened in the dark theme (used as text color in 80+ places), and `--color-accent` must NOT equal `--color-primary` (some components gradient between them).

---

## Task 1: Design tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css:9-55` (`:root` block)
- Modify: `src/app/globals.css:60-75` (`[data-theme="dark"]` block)
- Modify: `src/app/globals.css:80-95` (`[data-contrast="high"]` block, approximate — re-check exact end brace before editing, file may have shifted by the time this task runs)

**Interfaces:**
- Produces: CSS custom properties consumed by every later task and by every existing component that already uses `var(--color-*)`: `--color-primary`, `--color-primary-dark`, `--color-accent`, `--color-bg`, `--color-bg-dark`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-border`, plus new tokens `--font-display`, `--font-ui`, `--tracking-tight`, `--cube-gradient`, `--cube-halo`, `--color-header-bg`.

- [ ] **Step 1: Read the current `:root` block to confirm line numbers haven't shifted**

Run: `sed -n '1,56p' src/app/globals.css`
Expected: see the `:root { ... }` block starting at `/* Backgrounds */` and ending at the closing `}` before the dark-theme comment banner. Note the exact current line numbers before editing.

- [ ] **Step 2: Edit the `:root` block**

Replace the `Brand` and related lines inside `:root` so the block reads:

```css
:root {
  /* Backgrounds */
  --color-bg: #ffffff;
  --color-bg-dark: #ffffff;
  --color-bg-elevated: #f8f9fa;

  /* Text */
  --color-text: #1a1a2e;
  --color-text-muted: #2d2d3f;
  --color-text-inverse: #ffffff;

  /* Brand */
  --color-primary: #7fee64;
  --color-primary-dark: #1a1a2e;
  --color-accent: #18b759;

  /* Semantic */
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ff8c00;

  /* UI */
  --color-border: #e0e0e0;
  --color-shadow: rgba(0, 0, 0, 0.08);

  /* Font scale (modified by data-font-size attribute) */
  --font-scale: 1;

  /* Theme transition applied to all color-sensitive properties */
  --transition-theme: background 200ms ease, color 200ms ease, border-color 200ms ease;

  /* Layout */
  --sidebar-width: 280px;
  --header-height: 60px;
  --main-header-height: 80px;
  --admin-mobile-header-height: 56px;

  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Modal design system — typography */
  --font-display: 'Inter Tight', sans-serif;
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --tracking-tight: -0.03em;

  /* Modal design system — cube + header glass */
  --cube-gradient: linear-gradient(135deg, #80ee64 0%, #18b759 50%, #09af58 100%);
  --cube-halo: radial-gradient(circle, rgba(127, 238, 100, 0.35), transparent 70%);
  --color-header-bg: rgba(255, 255, 255, 0.82);
}
```

Note: `--font-display`/`--font-ui` here use literal font names as a safety fallback; Task 3 will prepend the `next/font` CSS variables (`var(--font-inter-tight)`, `var(--font-inter)`) so the actual loaded font wins once wired up.

- [ ] **Step 3: Edit the `[data-theme="dark"]` block**

Replace with:

```css
[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-bg-dark: #141414;
  --color-bg-elevated: #1a1a1a;
  --color-text: #e8ffe0;
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
  --color-header-bg: rgba(10, 10, 10, 0.82);
}
```

(Only `--color-bg`, `--color-bg-dark` changed from current values; `--color-header-bg` is new. Everything else is unchanged from what's already in the file — do not "helpfully" tweak `--color-primary-dark`/`--color-accent` here, see Global Constraints.)

- [ ] **Step 4: Edit the `[data-contrast="high"]` block**

Replace with:

```css
[data-contrast="high"] {
  --color-bg: #000000;
  --color-bg-dark: #000000;
  --color-bg-elevated: #000000;
  --color-text: #ffffff;
  --color-text-muted: #ffffff;
  --color-text-inverse: #000000;
  --color-primary: #7fee64;
  --color-primary-dark: #7fee64;
  --color-accent: #7fee64;
  --color-success: #00ff00;
  --color-danger: #ff0000;
  --color-warning: #ffff00;
  --color-border: #ffffff;
  --color-shadow: none;
  --color-header-bg: #000000;
}
```

- [ ] **Step 5: Verify token values landed correctly**

Run: `grep -n "color-primary:\|color-accent:\|color-header-bg:" src/app/globals.css`
Expected output includes exactly three `--color-primary: #7fee64;` lines (root, dark, high-contrast), one `--color-accent: #18b759;` (root only), two `--color-accent: #ddffdc;`/`--color-accent: #7fee64;` (dark/high-contrast), and three `--color-header-bg:` lines with the three different values above.

- [ ] **Step 6: Run the build to confirm no CSS syntax errors**

Run: `npm run build`
Expected: build completes without errors (warnings about unrelated things are fine; look specifically for CSS parse errors referencing `globals.css`).

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: repaint design tokens to Modal lime palette"
```

---

## Task 2: Tailwind config

**Files:**
- Modify: `tailwind.config.cjs`

**Interfaces:**
- Consumes: CSS variables from Task 1 (`--color-bg`, `--color-primary`, `--color-primary-dark`, `--color-border`, `--font-display`, `--font-ui`).
- Produces: Tailwind utility classes `bg-bg`, `bg-surface`, `text-primary`, `bg-primary`, `text-primaryDark`, `bg-primaryDark`, `border-border`, `font-display`, `font-ui`, `tracking-tightest` — available to any component written from here on (used by Task 4's `PhosphorCube` and optionally later tasks).

- [ ] **Step 1: Read current config**

Run: `cat tailwind.config.cjs`
Expected: confirm the `theme.extend` object shape matches what's already known (animation/keyframes/screens, no colors/fontFamily yet).

- [ ] **Step 2: Add colors, fontFamily, letterSpacing to `theme.extend`**

Edit `tailwind.config.cjs` so `theme.extend` becomes:

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
      animation: {
        'in': 'in 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
      },
      keyframes: {
        in: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
```

- [ ] **Step 3: Verify build picks up the new config**

Run: `npm run build`
Expected: build completes without errors. Tailwind config errors (e.g. malformed object) surface immediately at build start.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.cjs
git commit -m "feat: extend Tailwind theme with Modal color/font tokens"
```

---

## Task 3: Fonts via `next/font/google`

**Files:**
- Modify: `src/app/layout.js:1-20` (imports + font instantiation), and the `<html>` tag around line 106
- Modify: `src/app/globals.css` (body/heading font-family rules, inside the `BASE STYLES` and `TYPOGRAPHY` sections found earlier around lines ~108 and ~166)

**Interfaces:**
- Produces: CSS variables `--font-inter-tight` and `--font-inter` (set by `next/font` on the `<html>` element), consumed by `--font-display`/`--font-ui` in `globals.css`.

- [ ] **Step 1: Add font imports and instances to `layout.js`**

Near the top of `src/app/layout.js`, after the existing imports, add:

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

- [ ] **Step 2: Apply the font variable classes to `<html>`**

Find `<html lang="ru" suppressHydrationWarning` (around line 106) and change it to:

```jsx
<html lang="ru" suppressHydrationWarning className={`${interTight.variable} ${inter.variable}`}>
```

- [ ] **Step 3: Wire the CSS variables into the design tokens**

In `src/app/globals.css`, inside the `:root` block edited in Task 1, change:

```css
  --font-display: 'Inter Tight', sans-serif;
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

to:

```css
  --font-display: var(--font-inter-tight), 'Inter Tight', sans-serif;
  --font-ui: var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

- [ ] **Step 4: Apply the fonts in base styles**

In `src/app/globals.css`, find the `body { ... }` rule (currently hardcodes `font-family: -apple-system, ...`) and change its `font-family` line to `font-family: var(--font-ui);`, and add `font-feature-settings: 'cv11' 1;` as a new line inside the same rule.

Find the `h1, h2, h3, h4, h5, h6 { line-height: 1.3; }` rule and add two properties so it reads:

```css
h1, h2, h3, h4, h5, h6 {
  line-height: 1.3;
  font-family: var(--font-display);
  letter-spacing: var(--tracking-tight);
}
```

- [ ] **Step 5: Verify the build and font variable wiring**

Run: `npm run build`
Expected: build succeeds (a broken `next/font` import fails the build immediately with a clear error naming the font).

Run: `grep -n "font-inter" src/app/layout.js src/app/globals.css`
Expected: shows the `variable: '--font-inter-tight'` / `variable: '--font-inter'` lines in `layout.js` and the two `var(--font-inter...)` usages in `globals.css`.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.js src/app/globals.css
git commit -m "feat: load Inter Tight and Inter Variable via next/font"
```

---

## Task 4: `PhosphorCube` component

**Files:**
- Create: `src/components/PhosphorCube/PhosphorCube.js`
- Create: `src/components/PhosphorCube/PhosphorCube.module.css`

**Interfaces:**
- Produces: `export default function PhosphorCube({ size = 'sm' })` — a server component (no `'use client'`, no hooks) rendering a self-contained rotating 3D cube. Consumed by Task 5 (`Header.js`, `size="sm"`) and Task 8 (`LoginSignup.js`, `size="md"`).

- [ ] **Step 1: Create `PhosphorCube.js`**

```jsx
// components/PhosphorCube/PhosphorCube.js
import styles from './PhosphorCube.module.css';

// Куб-бренд: чистый CSS 3D transform, без сторонних библиотек.
export default function PhosphorCube({ size = 'sm' }) {
  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeSm;

  const showSideText = size !== 'sm';

  return (
    <div className={`${styles.scene} ${sizeClass}`} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.cube}>
        <div className={`${styles.face} ${styles.front}`}>SB</div>
        <div className={`${styles.face} ${styles.back}`}>SB</div>
        <div className={`${styles.face} ${styles.right}`}>{showSideText ? 'СЕРВИС' : ''}</div>
        <div className={`${styles.face} ${styles.left}`}>{showSideText ? 'БОКС' : ''}</div>
        <div className={`${styles.face} ${styles.top}`} />
        <div className={`${styles.face} ${styles.bottom}`} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `PhosphorCube.module.css`**

```css
/* components/PhosphorCube/PhosphorCube.module.css */

.scene {
  position: relative;
  perspective: 800px;
  flex-shrink: 0;
}

.sizeSm { width: 48px; height: 48px; }
.sizeMd { width: 96px; height: 96px; }
.sizeLg { width: 200px; height: 200px; }

.halo {
  position: absolute;
  inset: -40%;
  background: var(--cube-halo);
  filter: blur(24px);
  z-index: 0;
  pointer-events: none;
}

.cube {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: spin 80s linear infinite;
  z-index: 1;
}

@keyframes spin {
  from { transform: rotateX(0deg) rotateY(0deg); }
  to { transform: rotateX(360deg) rotateY(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cube {
    animation: none;
  }
}

.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cube-gradient);
  color: var(--color-primary-dark);
  font-family: var(--font-display);
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.sizeSm .face { font-size: 0.9rem; }
.sizeMd .face { font-size: 1.1rem; }
.sizeLg .face { font-size: 1.6rem; }

.right, .left {
  font-size: 0.6em;
  letter-spacing: 0.05em;
}

.sizeMd .right, .sizeMd .left,
.sizeLg .right, .sizeLg .left {
  writing-mode: vertical-rl;
}

/* Face placement — half of the scene's own width/height, using currentColor-independent transforms */
.sizeSm .front  { transform: translateZ(24px); }
.sizeSm .back   { transform: rotateY(180deg) translateZ(24px); }
.sizeSm .right  { transform: rotateY(90deg) translateZ(24px); }
.sizeSm .left   { transform: rotateY(-90deg) translateZ(24px); }
.sizeSm .top    { transform: rotateX(90deg) translateZ(24px); }
.sizeSm .bottom { transform: rotateX(-90deg) translateZ(24px); }

.sizeMd .front  { transform: translateZ(48px); }
.sizeMd .back   { transform: rotateY(180deg) translateZ(48px); }
.sizeMd .right  { transform: rotateY(90deg) translateZ(48px); }
.sizeMd .left   { transform: rotateY(-90deg) translateZ(48px); }
.sizeMd .top    { transform: rotateX(90deg) translateZ(48px); }
.sizeMd .bottom { transform: rotateX(-90deg) translateZ(48px); }

.sizeLg .front  { transform: translateZ(100px); }
.sizeLg .back   { transform: rotateY(180deg) translateZ(100px); }
.sizeLg .right  { transform: rotateY(90deg) translateZ(100px); }
.sizeLg .left   { transform: rotateY(-90deg) translateZ(100px); }
.sizeLg .top    { transform: rotateX(90deg) translateZ(100px); }
.sizeLg .bottom { transform: rotateX(-90deg) translateZ(100px); }
```

(`translateZ` half-values match half of `.sizeSm`/`.sizeMd`/`.sizeLg` width: 48px→24px, 96px→48px, 200px→100px — standard CSS cube construction.)

- [ ] **Step 3: Smoke-test the component in isolation**

Run: `grep -c "export default function PhosphorCube" src/components/PhosphorCube/PhosphorCube.js`
Expected: `1`

Run: `npm run build`
Expected: build succeeds even though nothing imports `PhosphorCube` yet (unused-file is not an error in Next.js build).

- [ ] **Step 4: Commit**

```bash
git add src/components/PhosphorCube
git commit -m "feat: add PhosphorCube CSS 3D branding component"
```

---

## Task 5: Header integration

**Files:**
- Modify: `src/components/Header/Header.js` (import + JSX inside `.headerLogoLink`, around line 122 per earlier read)
- Modify: `src/components/Header/Header.module.css:100-107` (`.header` rule) and `:3-9` (`.headerTopBar` rule)

**Interfaces:**
- Consumes: `PhosphorCube` from Task 4 (`import PhosphorCube from '../PhosphorCube/PhosphorCube';`), `--color-header-bg` token from Task 1.

- [ ] **Step 1: Import `PhosphorCube` in `Header.js`**

Add near the other component imports (after `import BurgerMenu from "../BurgerMenu/BurgerMenu";`):

```js
import PhosphorCube from "../PhosphorCube/PhosphorCube";
```

- [ ] **Step 2: Render the cube in the logo link**

Find:

```jsx
<Link href="/" className={styles.headerLogoLink} aria-label="На главную страницу ServiceBox">
  <img src={headerLogo.src} alt="Логотип ServiceBox" className={styles.headerLogo} width="65" height="45" />
  <span className={styles.headerLogoText}>
```

Change to:

```jsx
<Link href="/" className={styles.headerLogoLink} aria-label="На главную страницу ServiceBox">
  <img src={headerLogo.src} alt="Логотип ServiceBox" className={styles.headerLogo} width="65" height="45" />
  <PhosphorCube size="sm" />
  <span className={styles.headerLogoText}>
```

- [ ] **Step 3: Add glass background to the header**

In `Header.module.css`, change `.headerTopBar`'s `background: var(--color-primary-dark);` — **do not change this one**, it's the contact bar and should stay solid (verify by re-reading the current rule before editing; only `.header` gets the glass treatment). Change the `.header` rule from:

```css
.header {
  background: var(--color-bg-dark);
  box-shadow: 0 2px 10px var(--color-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-theme);
}
```

to:

```css
.header {
  background: var(--color-header-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 10px var(--color-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-theme);
}
```

- [ ] **Step 4: Add display-font styling to the logo text**

In `Header.module.css`, add to `.headerLogoMain`:

```css
.headerLogoMain {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  line-height: 1;
  font-family: var(--font-display);
  letter-spacing: var(--tracking-tight);
}
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev` (in background, or reuse an already-running dev server), open `http://localhost:3000/`.
Expected: header shows the small rotating cube next to the logo, header background is a translucent/blurred white strip, nav active/hover states are lime-green instead of blue (this last part comes free from Task 1's token change — confirm visually).
Stop the dev server when done checking.

- [ ] **Step 6: Run the build**

Run: `npm run build`
Expected: build succeeds, no import errors for `PhosphorCube`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header/Header.js src/components/Header/Header.module.css
git commit -m "feat: add PhosphorCube and glass background to site header"
```

---

## Task 6: Global button styles

**Files:**
- Modify: `src/app/globals.css:211-224` (`button {}` and `button:disabled {}` rules)

**Interfaces:**
- Produces: restyled default `button` element, plus two new reusable classes `.btnGhost` and `.pill` usable from any component's JSX via `className={styles.btnGhost}`-style CSS Modules composition is not needed — these are global classes, usable as plain `className="btnGhost"` / `className="pill"` (no CSS Modules hashing since they live in `globals.css`, not a `.module.css`).

- [ ] **Step 1: Replace the global `button` rule**

Find:

```css
button {
  background: linear-gradient(135deg, #0F52BA 0%, #002147 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

Replace with:

```css
button {
  background: var(--color-primary-dark);
  color: #ffffff;
  border: 1px solid var(--color-primary);
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: box-shadow 0.2s ease;
}

button:hover:not(:disabled) {
  box-shadow: 0 0 0 3px rgba(127, 238, 100, 0.25);
}

button:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Add `.btnGhost` and `.pill` utility classes**

Immediately after the `button:disabled` rule, add:

```css
.btnGhost {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary-dark);
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}

.btnGhost:hover:not(:disabled) {
  background: rgba(127, 238, 100, 0.08);
}

.pill {
  display: inline-flex;
  align-items: center;
  background: var(--color-primary);
  color: var(--color-primary-dark);
  border: none;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
}
```

- [ ] **Step 3: Verify no leftover hardcoded blue in this rule**

Run: `grep -n "0F52BA\|002147" src/app/globals.css`
Expected: no output (empty) — confirms the old gradient is fully removed from this file.

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: restyle global buttons and add btnGhost/pill utility classes"
```

---

## Task 7: Replace remaining hardcoded blue in component CSS

**Files:**
- Modify: `src/components/ReviewsSection/ReviewsSection.module.css:44,156`
- Modify: `src/components/Gifts/Gifts.module.css:19`
- Modify: `src/components/ArronnService/ArronnService.module.css:32,67,150`
- Modify: `src/components/Chat/Chat.module.css:172,222,228,275,285,371,388,573,636,711`

**Interfaces:** None (pure CSS value replacement, no new tokens or JS interfaces).

- [ ] **Step 1: Replace in `ReviewsSection.module.css`**

Both occurrences of:

```css
background: linear-gradient(135deg, #0F52BA, #002147);
```

become:

```css
background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
```

- [ ] **Step 2: Replace in `Gifts.module.css`**

```css
background: linear-gradient(135deg, #0F52BA 0%, #002147 100%);
```

becomes:

```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
```

- [ ] **Step 3: Replace in `ArronnService.module.css`**

All three occurrences (two `linear-gradient(135deg, #0F52BA, #002147)` and one `linear-gradient(135deg, #0F52BA 0%, #002147)`) become the token-based equivalents, preserving each rule's own `0%`/no-stop syntax:

```css
background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
```

and

```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark));
```

- [ ] **Step 4: Replace `#002147` in `Chat.module.css`, leave `#764ba2` untouched**

This file mixes two different gradients — `linear-gradient(135deg, #0F52BA 0%, #002147 100%)` (brand gradient, 3 occurrences at lines 172/228/275/388 — re-check exact lines with grep since some also involve `#764ba2`) and `linear-gradient(135deg, #002147 0%, #764ba2 100%)` (navy-to-purple, decorative, out of scope — only swap the navy stop, keep `#764ba2`).

Run first: `grep -n "0F52BA\|002147" src/components/Chat/Chat.module.css` and edit each match:
- `linear-gradient(135deg, #0F52BA 0%, #002147 100%)` → `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`
- `linear-gradient(135deg, #002147 0%, #764ba2 100%)` → `linear-gradient(135deg, var(--color-primary-dark) 0%, #764ba2 100%)`
- standalone `border-color: #002147;` → `border-color: var(--color-primary-dark);`
- standalone `color: #002147;` → `color: var(--color-primary-dark);`

- [ ] **Step 5: Verify no hardcoded blue remains anywhere in `src/`**

Run: `grep -rli "0F52BA" src/ | grep -v node_modules`
Expected: no output (empty — `globals.css` was already cleared in Task 6, this task clears the rest).

- [ ] **Step 6: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/ReviewsSection/ReviewsSection.module.css src/components/Gifts/Gifts.module.css src/components/ArronnService/ArronnService.module.css src/components/Chat/Chat.module.css
git commit -m "refactor: migrate remaining hardcoded blue gradients to Modal tokens"
```

---

## Task 8: Login modal integration

**Files:**
- Modify: `src/components/LoginSignup/LoginSignup.js` (import + JSX around line 392, `.modalHeader` div)
- Modify: `src/components/LoginSignup/LoginSignup.module.css:29-42` (`.modalHeader`, `.modalHeader h2`)

**Interfaces:**
- Consumes: `PhosphorCube` from Task 4 (`import PhosphorCube from '../PhosphorCube/PhosphorCube';`).

- [ ] **Step 1: Read the current `.modalHeader` JSX**

Run: `sed -n '388,400p' src/components/LoginSignup/LoginSignup.js`
Expected: confirms the `<div className={styles.modalHeader}>` wrapper and its children (likely `<h2>` + close button) so the cube can be inserted without disturbing the close button's position.

- [ ] **Step 2: Import `PhosphorCube`**

Add near the top of `LoginSignup.js`, after `import styles from './LoginSignup.module.css';`:

```js
import PhosphorCube from '../PhosphorCube/PhosphorCube';
```

- [ ] **Step 3: Insert the cube into the modal header**

Inside the `<div className={styles.modalHeader}>` block, immediately before the `<h2>` element, add:

```jsx
<PhosphorCube size="md" />
```

(Leave the `<h2>` and close button exactly as they are — only inserting a sibling element.)

- [ ] **Step 4: Adjust `.modalHeader` layout for the added cube**

In `LoginSignup.module.css`, change `.modalHeader` from:

```css
.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 28px 0;
}
```

to:

```css
.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 28px 28px 0;
}
```

(`gap` added so the cube doesn't collide with the heading text; `justify-content: space-between` already pushes the close button to the far edge.)

- [ ] **Step 5: Fix the pre-existing dark-theme contrast bug in `.modalHeader h2`**

Change:

```css
.modalHeader h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}
```

to:

```css
.modalHeader h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}
```

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev` (background), open `http://localhost:3000/loginsignup`.
Expected: modal header shows the cube (size `md`) next to the "Вход"/"Регистрация" heading, layout doesn't overflow on mobile width (resize to ~375px to check), form still submits normally (don't need to complete a real login, just confirm fields render and validation messages still appear on empty submit).
Stop the dev server when done.

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/LoginSignup/LoginSignup.js src/components/LoginSignup/LoginSignup.module.css
git commit -m "feat: add PhosphorCube to login modal and fix dark-theme heading contrast"
```

---

## Task 9: Final verification pass

**Files:** None modified — verification only.

**Interfaces:** None.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors introduced by this work (pre-existing warnings in untouched files are not this plan's responsibility).

- [ ] **Step 3: Confirm no old blue remains anywhere**

Run: `grep -rli "0F52BA\|#3498db" src/ | grep -v node_modules`
Expected: no output.

- [ ] **Step 4: Manual visual check (dev server)**

Run: `npm run dev` (background)
Visit and eyeball each of: `/` (header cube + nav colors), `/loginsignup` (modal cube), `/about`, `/parts` (representative public pages — confirm buttons/links read lime-green, not blue, and text stays legible), `/admin-panel` (if a test admin account is available — confirm sidebar/topbar didn't visually break; skip if no admin credentials are available in this environment and note it in the final report instead of blocking).
Toggle the theme switcher (sun/moon icon in header) to dark mode and confirm all text stays readable (this directly tests the Task 1 bug fix). Toggle high-contrast mode (eye icon) and confirm the same.
Stop the dev server when done.

- [ ] **Step 5: Final commit if any cleanup was needed**

If Steps 1-4 required any fixes, commit them individually with descriptive messages (do not batch into this task's commit — each fix belongs to the task it corrects). If no fixes were needed, this task produces no commit.
