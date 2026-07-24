# CSS Refactoring & Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor all CSS in the Next.js 15 App Router project to use a CSS-variable token system supporting light/dark themes, font-size scaling, and high-contrast mode, with accessibility controls in the Header.

**Architecture:** A canonical token set is defined in `globals.css` under `:root` (light), `[data-theme="dark"]`, and `[data-contrast="high"]`. Three client-side hooks write these attributes to `<html>`. All 114 CSS files have hardcoded color values replaced with the appropriate token. The Header gets three toggle buttons wired to the hooks.

**Tech Stack:** Next.js 15 (App Router), React 19, plain JavaScript (no TypeScript), CSS Modules, Tailwind CSS v3, Font Awesome (already in Header)

## Global Constraints

- Pure JavaScript only — no `.ts` or `.tsx` extensions
- No new pages or route files
- No new top-level components outside of adding code to existing files
- Tailwind kept for layout utilities only; Tailwind color classes removed from `<body>`
- Dark theme: `--color-bg: #000000`, `--color-primary: #7fee64`, `--color-accent: #ddffdc`
- Social brand colors NOT migrated to tokens: VK `#4a76a8`, WhatsApp `#25d366`, Telegram `#0088cc`
- Only two `!important` allowed in globals.css: iOS zoom prevention and Chatwoot overrides
- Dev server: `npm run dev` (runs `node src/server.js`)
- Browser verify toggle command: `document.documentElement.setAttribute('data-theme', 'dark')` in DevTools console

---

## File Map

**Created:**
- `src/hooks/useTheme.js`
- `src/hooks/useFontSize.js`
- `src/hooks/useHighContrast.js`

**Modified:**
- `src/app/globals.css` — full rewrite (token system, skip-link, cleanup)
- `src/app/layout.js` — anti-flash script, skip link, body class removal, main#id
- `src/components/Header/Header.js` — import 3 hooks, add 3 toggle buttons
- `src/components/Header/Header.module.css` — migrate colors + add a11y control styles
- All other `*.module.css` and `*.css` files — mechanical color → token replacement (see batches in Tasks 5–9)

---

## Task 1: Rewrite `globals.css` with token system

**Files:**
- Modify: `src/app/globals.css` (full rewrite)

**Interfaces:**
- Produces: CSS custom properties `--color-bg`, `--color-bg-dark`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-text-inverse`, `--color-primary`, `--color-primary-dark`, `--color-accent`, `--color-border`, `--color-success`, `--color-danger`, `--color-warning`, `--color-shadow`, `--font-scale`, `--transition-theme` — consumed by all later tasks

- [ ] **Step 1: Replace the entire file with the new version**

Open `src/app/globals.css` and replace ALL contents with:

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — light (default)
   ═══════════════════════════════════════════════════ */
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
}

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — dark theme
   ═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — high contrast
   ═══════════════════════════════════════════════════ */
[data-contrast="high"] {
  --color-bg: #000000;
  --color-bg-dark: #000000;
  --color-bg-elevated: #000000;
  --color-text: #ffffff;
  --color-text-muted: #ffffff;
  --color-text-inverse: #000000;
  --color-primary: #ffff00;
  --color-primary-dark: #ffff00;
  --color-accent: #ffff00;
  --color-success: #00ff00;
  --color-danger: #ff0000;
  --color-warning: #ffff00;
  --color-border: #ffffff;
  --color-shadow: none;
}

/* ═══════════════════════════════════════════════════
   FONT SCALE
   ═══════════════════════════════════════════════════ */
[data-font-size="lg"] { --font-scale: 1.125; }
[data-font-size="xl"] { --font-scale: 1.25; }

html {
  font-size: calc(1rem * var(--font-scale));
  scroll-behavior: smooth;
}

/* ═══════════════════════════════════════════════════
   BASE STYLES
   ═══════════════════════════════════════════════════ */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  transition: var(--transition-theme);
  line-height: 1.6;
  font-size: 1rem;
}

/* ═══════════════════════════════════════════════════
   SKIP-TO-CONTENT (accessibility)
   ═══════════════════════════════════════════════════ */
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
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  z-index: 9999;
  font-weight: 600;
  font-size: 1rem;
  outline: none;
  text-decoration: none;
}

/* ═══════════════════════════════════════════════════
   FOCUS VISIBLE
   ═══════════════════════════════════════════════════ */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ═══════════════════════════════════════════════════
   LINKS
   ═══════════════════════════════════════════════════ */
a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* ═══════════════════════════════════════════════════
   TYPOGRAPHY
   ═══════════════════════════════════════════════════ */
h1, h2, h3, h4, h5, h6 {
  line-height: 1.3;
}

p, span, div, li, td, th {
  font-size: 1.125rem;
  line-height: 1.7;
}

label,
.form-label,
.input-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  display: block;
}

/* ═══════════════════════════════════════════════════
   FORM ELEMENTS
   ═══════════════════════════════════════════════════ */
label {
  display: block;
  margin-bottom: 0.5rem;
}

input,
textarea,
select {
  font-size: 1.125rem;
  padding: 0.75rem 1rem;
  min-height: 48px;
}

input[type="text"],
input[type="email"] {
  width: 100%;
}

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

button,
[role="button"],
input[type="submit"],
input[type="button"],
input[type="reset"],
a.button {
  min-height: 15px;
  min-width: 15px;
}

.icon-button {
  position: relative;
  min-height: 15px;
  min-width: 15px;
  padding: 12px;
}

.small-touch-target {
  position: relative;
}

.small-touch-target::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15px;
  height: 15px;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════
   IMAGES — CLS PREVENTION
   ═══════════════════════════════════════════════════ */
img {
  max-width: 100%;
  object-fit: contain;
}

.brand-card-logo,
img[class*="logo"] {
  aspect-ratio: 1 / 1;
  width: 60px;
  height: 60px;
  object-fit: contain;
}

img[class*="thumbnail"],
img[class*="cardImg"],
img[class*="productImg"] {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* ═══════════════════════════════════════════════════
   FONT AWESOME — prevent FOUT
   ═══════════════════════════════════════════════════ */
@font-face {
  font-family: 'FontAwesome';
  font-display: swap;
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE TYPOGRAPHY
   ═══════════════════════════════════════════════════ */
@media (max-width: 768px) {
  body {
    line-height: 1.5;
  }

  p, span, div, li, td, th {
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  input, textarea, select {
    font-size: 16px !important; /* Prevents iOS zoom on focus */
  }
}

@media (max-width: 480px) {
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }

  p, span, div, li, td, th {
    font-size: 1rem;
    line-height: 1.6;
  }

  input, textarea, select, button {
    font-size: 16px !important; /* Prevents iOS zoom on focus */
  }
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE TABLES
   ═══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .responsive-table { display: block; }
  .responsive-table thead { display: none; }

  .responsive-table tbody tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .responsive-table tbody td {
    display: block;
    text-align: right;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-bg-elevated);
  }

  .responsive-table tbody td::before {
    content: attr(data-label);
    float: left;
    font-weight: 600;
    color: var(--color-text-muted);
  }
}

/* ═══════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* JS-controlled reduced motion class (fallback) */
.reduceMotion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}

/* ═══════════════════════════════════════════════════
   CHATWOOT — hide branding
   ═══════════════════════════════════════════════════ */
.woot-widget-bubble__footer,
.woot--footer,
.chatwoot-footer,
[class*="powered-by"] {
  display: none !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.woot-widget-bubble {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* ═══════════════════════════════════════════════════
   LOADER-3 COMPONENT
   (keyframes used by src/components/ui/loader-3.jsx)
   ═══════════════════════════════════════════════════ */
:root {
  --clr: #fff;
}

.dark {
  --clr: #000;
}

.loader {
  --duration: 3s;
  --primary: rgba(39, 94, 254, 1);
  --primary-light: #2f71ff;
  --primary-rgba: rgba(39, 94, 254, 0);
  width: 200px;
  height: 320px;
  position: relative;
  transform-style: preserve-3d;
}

@media (max-width: 480px) {
  .loader { zoom: 0.44; }
}

.loader:before,
.loader:after {
  --r: 20.5deg;
  content: "";
  width: 320px;
  height: 140px;
  position: absolute;
  right: 32%;
  bottom: -11px;
  background: var(--clr);
  transform: translateZ(200px) rotate(var(--r));
  animation: mask var(--duration) linear forwards infinite;
}

.loader:after {
  --r: -20.5deg;
  right: auto;
  left: 32%;
}

.loader .ground {
  position: absolute;
  left: -50px;
  bottom: -120px;
  transform-style: preserve-3d;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);
}

.loader .ground div {
  transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0);
  width: 200px;
  height: 200px;
  background: var(--primary);
  background: linear-gradient(45deg, var(--primary) 0%, var(--primary) 50%, var(--primary-light) 50%, var(--primary-light) 100%);
  transform-style: preserve-3d;
  animation: ground var(--duration) linear forwards infinite;
}

.loader .ground div:before,
.loader .ground div:after {
  --rx: 90deg; --ry: 0deg; --x: 44px; --y: 162px; --z: -50px;
  content: "";
  width: 156px;
  height: 300px;
  opacity: 0;
  background: linear-gradient(var(--primary), var(--primary-rgba));
  position: absolute;
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
  animation: ground-shine var(--duration) linear forwards infinite;
}

.loader .ground div:after {
  --rx: 90deg; --ry: 90deg; --x: 0; --y: 177px; --z: 150px;
}

.loader .box {
  --x: 0; --y: 0;
  position: absolute;
  animation: var(--duration) linear forwards infinite;
  transform: translate(var(--x), var(--y));
}

.loader .box div {
  background-color: var(--primary);
  width: 48px;
  height: 48px;
  position: relative;
  transform-style: preserve-3d;
  animation: var(--duration) ease forwards infinite;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);
}

.loader .box div:before,
.loader .box div:after {
  --rx: 90deg; --ry: 0deg; --z: 24px; --y: -24px; --x: 0;
  content: "";
  position: absolute;
  background-color: inherit;
  width: inherit;
  height: inherit;
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
  filter: brightness(var(--b, 1.2));
}

.loader .box div:after {
  --rx: 0deg; --ry: 90deg; --x: 24px; --y: 0; --b: 1.4;
}

.loader .box.box0 { --x: -220px; --y: -120px; left: 58px; top: 108px; }
.loader .box.box1 { --x: -260px; --y: 120px;  left: 25px; top: 120px; }
.loader .box.box2 { --x: 120px;  --y: -190px; left: 58px; top: 64px; }
.loader .box.box3 { --x: 280px;  --y: -40px;  left: 91px; top: 120px; }
.loader .box.box4 { --x: 60px;   --y: 200px;  left: 58px; top: 132px; }
.loader .box.box5 { --x: -220px; --y: -120px; left: 25px; top: 76px; }
.loader .box.box6 { --x: -260px; --y: 120px;  left: 91px; top: 76px; }
.loader .box.box7 { --x: -240px; --y: 200px;  left: 58px; top: 87px; }

.loader .box0 { animation-name: box-move0; }
.loader .box0 div { animation-name: box-scale0; }
.loader .box1 { animation-name: box-move1; }
.loader .box1 div { animation-name: box-scale1; }
.loader .box2 { animation-name: box-move2; }
.loader .box2 div { animation-name: box-scale2; }
.loader .box3 { animation-name: box-move3; }
.loader .box3 div { animation-name: box-scale3; }
.loader .box4 { animation-name: box-move4; }
.loader .box4 div { animation-name: box-scale4; }
.loader .box5 { animation-name: box-move5; }
.loader .box5 div { animation-name: box-scale5; }
.loader .box6 { animation-name: box-move6; }
.loader .box6 div { animation-name: box-scale6; }
.loader .box7 { animation-name: box-move7; }
.loader .box7 div { animation-name: box-scale7; }

@keyframes box-move0 { 12% { transform: translate(var(--x), var(--y)); } 25%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale0 { 6% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 14%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move1 { 16% { transform: translate(var(--x), var(--y)); } 29%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale1 { 10% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 18%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move2 { 20% { transform: translate(var(--x), var(--y)); } 33%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale2 { 14% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 22%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move3 { 24% { transform: translate(var(--x), var(--y)); } 37%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale3 { 18% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 26%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move4 { 28% { transform: translate(var(--x), var(--y)); } 41%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale4 { 22% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 30%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move5 { 32% { transform: translate(var(--x), var(--y)); } 45%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale5 { 26% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 34%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move6 { 36% { transform: translate(var(--x), var(--y)); } 49%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale6 { 30% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 38%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move7 { 40% { transform: translate(var(--x), var(--y)); } 53%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
@keyframes box-scale7 { 34% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 42%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

@keyframes ground {
  0%, 65% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); }
  75%, 90% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(1); }
  100% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); }
}

@keyframes ground-shine {
  0%, 70% { opacity: 0; }
  75%, 87% { opacity: 0.2; }
  100% { opacity: 0; }
}

@keyframes mask {
  0%, 65% { opacity: 0; }
  66%, 100% { opacity: 1; }
}
```

- [ ] **Step 2: Start dev server and verify no CSS errors**

```bash
npm run dev
```

Open browser at `http://localhost:3000`. Expected: page loads, background is `#f8fafc`, text is `#1e293b`.

- [ ] **Step 3: Verify dark mode tokens apply**

In browser DevTools console:
```js
document.documentElement.setAttribute('data-theme', 'dark')
```

Expected: background turns black `#000000`, text turns `#f0f0f0`. Run:
```js
getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
// Expected: "#000000"
```

- [ ] **Step 4: Verify high-contrast tokens apply**

```js
document.documentElement.setAttribute('data-contrast', 'high')
getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
// Expected: "#ffff00"
```

Reset: `document.documentElement.removeAttribute('data-contrast'); document.documentElement.removeAttribute('data-theme')`

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: rewrite globals.css with CSS token system (light/dark/contrast)"
```

---

## Task 2: Create the three theme hooks

**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/hooks/useFontSize.js`
- Create: `src/hooks/useHighContrast.js`

**Interfaces:**
- Consumes: `document.documentElement` attributes set in Task 1
- Produces:
  - `useTheme()` → `{ theme: 'light'|'dark', toggleTheme: () => void }`
  - `useFontSize()` → `{ fontSize: 'normal'|'lg'|'xl', cycleFontSize: () => void }`
  - `useHighContrast()` → `{ isHighContrast: boolean, toggleHighContrast: () => void }`

- [ ] **Step 1: Create `src/hooks/useTheme.js`**

```js
'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored || preferred;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return { theme, toggleTheme };
}
```

- [ ] **Step 2: Create `src/hooks/useFontSize.js`**

```js
'use client';

import { useState, useEffect } from 'react';

const LEVELS = ['normal', 'lg', 'xl'];

export function useFontSize() {
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    const stored = localStorage.getItem('fontSize') || 'normal';
    setFontSize(stored);
    if (stored !== 'normal') {
      document.documentElement.setAttribute('data-font-size', stored);
    }
  }, []);

  const cycleFontSize = () => {
    const currentIndex = LEVELS.indexOf(fontSize);
    const next = LEVELS[(currentIndex + 1) % LEVELS.length];
    setFontSize(next);
    if (next === 'normal') {
      document.documentElement.removeAttribute('data-font-size');
    } else {
      document.documentElement.setAttribute('data-font-size', next);
    }
    localStorage.setItem('fontSize', next);
  };

  return { fontSize, cycleFontSize };
}
```

- [ ] **Step 3: Create `src/hooks/useHighContrast.js`**

```js
'use client';

import { useState, useEffect } from 'react';

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('highContrast') === 'true';
    setIsHighContrast(stored);
    if (stored) {
      document.documentElement.setAttribute('data-contrast', 'high');
    }
  }, []);

  const toggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem('highContrast', String(next));
  };

  return { isHighContrast, toggleHighContrast };
}
```

- [ ] **Step 4: Verify hooks in browser console**

Make sure dev server is running. Open DevTools and paste:
```js
// Simulate useTheme logic
localStorage.setItem('theme', 'dark');
location.reload();
// Expected: page reloads in dark theme (anti-flash script not added yet — theme applies after hydration)
localStorage.removeItem('theme');
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTheme.js src/hooks/useFontSize.js src/hooks/useHighContrast.js
git commit -m "feat: add useTheme, useFontSize, useHighContrast hooks"
```

---

## Task 3: Update `layout.js`

**Files:**
- Modify: `src/app/layout.js`

**Interfaces:**
- Consumes: hooks from Task 2 (not imported here — layout.js only adds the anti-flash script)
- Produces: `<html>` with pre-hydration `data-theme` attribute; `<main id="main-content">`; skip-to-content link

- [ ] **Step 1: Add anti-flash script as first child of `<head>`**

In `src/app/layout.js`, find the `<head>` element and add this script as its FIRST child, before the GTM script:

```jsx
<head>
  {/* Anti-flash: apply theme before hydration to prevent flicker */}
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
  {/* existing: GTM script, preconnects, etc. */}
```

- [ ] **Step 2: Remove Tailwind color classes from `<body>` and add skip link**

Find:
```jsx
<body className="bg-gray-50 text-slate-900">
```

Replace with:
```jsx
<body>
  <a href="#main-content" className="skip-to-content">
    Перейти к основному содержимому
  </a>
```

- [ ] **Step 3: Add `id="main-content"` to `<main>`**

Find:
```jsx
<main>{children}</main>
```

Replace with:
```jsx
<main id="main-content">{children}</main>
```

- [ ] **Step 4: Verify in browser**

Restart dev server: `npm run dev`

1. Set dark theme in localStorage and reload:
   ```js
   localStorage.setItem('theme', 'dark'); location.reload();
   ```
   Expected: page loads dark immediately, no white flash.

2. Press `Tab` on the homepage. Expected: skip-to-content link appears at top-left with green background.

3. `localStorage.removeItem('theme'); location.reload()` — page restores light.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.js
git commit -m "feat: add anti-flash script, skip-to-content link, main#id to layout"
```

---

## Task 4: Update Header with theme/font/contrast toggle buttons

**Files:**
- Modify: `src/components/Header/Header.js`
- Modify: `src/components/Header/Header.module.css`

**Interfaces:**
- Consumes: `useTheme()`, `useFontSize()`, `useHighContrast()` from Task 2; `faSun`, `faMoon`, `faEye` from `@fortawesome/free-solid-svg-icons`
- Produces: Three a11y control buttons visible in header on all screen sizes

- [ ] **Step 1: Add imports to `Header.js`**

At the top of `src/components/Header/Header.js`, add to the existing Font Awesome import:

```js
import {
  faBasketShopping,
  faMobilePhone,
  faUser,
  faChevronDown,
  faSun,
  faMoon,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
```

Also add hook imports after the existing imports:
```js
import { useTheme } from '@/hooks/useTheme';
import { useFontSize } from '@/hooks/useFontSize';
import { useHighContrast } from '@/hooks/useHighContrast';
```

- [ ] **Step 2: Call hooks inside the `Header` function**

Inside the `Header` function, after existing `const` declarations, add:

```js
const { theme, toggleTheme } = useTheme();
const { fontSize, cycleFontSize } = useFontSize();
const { isHighContrast, toggleHighContrast } = useHighContrast();
```

- [ ] **Step 3: Add the three a11y buttons to the JSX**

Inside the `<div className={styles.headerActions}>` element, after the cart link, add:

```jsx
<div
  role="group"
  aria-label="Настройки отображения"
  className={styles.a11yControls}
>
  <button
    type="button"
    className={styles.themeToggle}
    onClick={toggleTheme}
    aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
    aria-pressed={theme === 'dark'}
  >
    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
  </button>

  <button
    type="button"
    className={styles.fontSizeBtn}
    onClick={cycleFontSize}
    aria-label={`Размер текста: ${fontSize === 'normal' ? 'нормальный' : fontSize === 'lg' ? 'большой' : 'очень большой'}`}
  >
    {fontSize === 'normal' ? 'A' : fontSize === 'lg' ? 'A+' : 'A++'}
  </button>

  <button
    type="button"
    className={styles.contrastToggle}
    onClick={toggleHighContrast}
    aria-label="Высокий контраст"
    aria-pressed={isHighContrast}
  >
    <FontAwesomeIcon icon={faEye} />
  </button>
</div>
```

- [ ] **Step 4: Migrate all hardcoded colors in `Header.module.css` to tokens and add new button styles**

Replace the entire contents of `src/components/Header/Header.module.css` with:

```css
/* components/Header/Header.module.css */

.headerTopBar {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  padding: 8px 0;
  transition: var(--transition-theme);
}

.headerTopBar.scrolled {
  padding: 4px 0;
}

.headerTopBarContainer {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.checkoutButton {
  flex: 1;
  background: var(--color-accent);
  color: var(--color-text-inverse);
  text-align: center;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}

.checkoutButton:hover {
  background: var(--color-primary);
}

.headerContacts {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.headerContactLink {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-inverse);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.headerContactLink:hover {
  color: var(--color-accent);
}

.headerContactLink svg {
  width: 14px;
  height: 14px;
}

.headerWorkHours {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.headerSocials {
  display: flex;
  gap: 12px;
}

.socialLink {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--color-text-inverse);
  text-decoration: none;
  transition: all 0.3s ease;
}

.socialLink:hover {
  transform: translateY(-2px);
}

/* Brand colors — intentionally NOT migrated to tokens */
.socialLink.vk { background: #4a76a8; }
.socialLink.vk:hover { background: #3a6690; }
.socialLink.whatsapp { background: #25d366; }
.socialLink.whatsapp:hover { background: #1ea952; }
.socialLink.telegram { background: #0088cc; }
.socialLink.telegram:hover { background: #0077b3; }

/* Main Header */
.header {
  background: var(--color-bg-dark);
  box-shadow: 0 2px 10px var(--color-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-theme);
}

.header.scrolled {
  box-shadow: 0 4px 20px var(--color-shadow);
}

.headerContainer {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 100px;
  gap: 15px;
}

.headerLogoLink {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.headerLogo {
  width: 65px;
  height: 45px;
  object-fit: contain;
  flex-shrink: 0;
}

.headerLogoText {
  display: flex;
  flex-direction: column;
}

.headerLogoMain {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  line-height: 1;
}

.headerLogoSub {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1;
}

/* Navigation */
.headerNav {
  flex: 1;
  margin: 0 20px;
  min-width: 0;
}

.headerNavList {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.headerNavItem {
  position: relative;
  flex-shrink: 1;
}

.headerNavLink {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  text-decoration: none;
  color: var(--color-primary-dark);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  flex-shrink: 1;
}

.headerNavLink:hover {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
}

.headerNavItem.active .headerNavLink {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
}

/* Dropdown Menu */
.dropdownMenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--color-warning);
  min-width: 180px;
  box-shadow: 0 4px 15px var(--color-shadow);
  border-radius: 8px;
  padding: 6px 0;
  list-style: none;
  margin: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.headerNavItem.dropdown:hover .dropdownMenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdownItem {
  display: block;
  padding: 10px 14px;
  text-decoration: none;
  color: var(--color-primary-dark);
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.dropdownItem:hover {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
}

/* Header Actions */
.headerActions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.navUserGroup {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.userMenuWrapper {
  position: relative;
}

.navUserIcon {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-bg-elevated);
  border: none;
  border-radius: 6px;
  color: var(--color-primary-dark);
  cursor: pointer;
  transition: var(--transition-theme);
  font-size: 0.85rem;
  white-space: nowrap;
}

.navUserIcon:hover {
  background: var(--color-border);
}

.navUsername {
  font-weight: 500;
}

.userMenuDropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-warning);
  min-width: 160px;
  box-shadow: 0 4px 15px var(--color-shadow);
  border-radius: 8px;
  padding: 6px 0;
  margin-top: 8px;
  z-index: 1002;
}

.userMenuDropdown .dropdownItem {
  font-size: 0.85rem;
  padding: 8px 12px;
}

.userMenuLogout {
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--color-danger);
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 0.85rem;
}

.userMenuLogout:hover {
  background: var(--color-bg-elevated);
}

.adminPanelBtn {
  padding: 6px 12px;
  background: var(--color-danger);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.adminPanelBtn:hover {
  background: #a93226;
}

.logoutBtn {
  padding: 6px 12px;
  background: var(--color-text-muted);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.logoutBtn:hover {
  background: #5a6472;
}

.logoutBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.headerLoginBtn {
  padding: 8px 16px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.headerLoginBtn:hover {
  background: var(--color-primary);
}

.headerCartLink {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-bg-elevated);
  border-radius: 6px;
  color: var(--color-primary-dark);
  text-decoration: none;
  transition: var(--transition-theme);
  flex-shrink: 0;
}

.headerCartLink:hover {
  background: var(--color-border);
  color: var(--color-accent);
}

.headerCartCount {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-danger);
  color: var(--color-text-inverse);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
}

/* ─── A11Y CONTROLS ─────────────────────────── */
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
  flex-shrink: 0;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .headerNav { margin: 0 15px; }
  .headerNavList { gap: 2px; }
  .headerNavLink { padding: 8px 10px; font-size: 0.85rem; }
  .headerLogoMain { font-size: 1.3rem; }
}

@media (max-width: 900px) {
  .headerLogoText { display: none; }
  .headerContainer { gap: 10px; }
}

@media (max-width: 768px) {
  .headerTopBar { display: none; }
  .headerNav { display: none; }
  .headerContainer { height: 60px; padding: 0 15px; gap: 8px; }
  .headerLogo { width: 45px; height: 35px; }
  .headerActions { gap: 8px; }
  .navUserGroup { gap: 6px; }
  .navUserIcon span { display: none; }
  .adminPanelBtn, .logoutBtn { padding: 4px 8px; font-size: 0.75rem; }
  .headerLoginBtn { padding: 6px 12px; font-size: 0.8rem; }
  .headerCartLink { width: 36px; height: 36px; }
  .themeToggle, .fontSizeBtn, .contrastToggle { width: 32px; height: 32px; }
}

@media (max-width: 480px) {
  .headerContainer { padding: 0 10px; height: 55px; }
  .headerLogo { width: 40px; height: 30px; }
  .headerActions { gap: 6px; }
  .navUserIcon { padding: 6px; }
  .adminPanelBtn, .logoutBtn, .headerLoginBtn { min-width: auto; padding: 6px 8px; }
  .adminPanelBtn span, .logoutBtn span { display: none; }
  .adminPanelBtn::after { content: "⚙"; }
  .logoutBtn::after { content: "🚪"; }
  .headerCartLink { width: 34px; height: 34px; }
  .headerCartCount { width: 16px; height: 16px; font-size: 0.6rem; }
  .themeToggle, .fontSizeBtn, .contrastToggle { width: 28px; height: 28px; font-size: 0.7rem; }
}

@media (max-width: 360px) {
  .headerContainer { padding: 0 8px; }
  .headerLogo { width: 35px; height: 25px; }
  .headerActions { gap: 4px; }
  .navUserIcon, .headerCartLink { width: 32px; height: 32px; }
  .adminPanelBtn, .logoutBtn, .headerLoginBtn { padding: 4px 6px; font-size: 0.7rem; }
}

.headerContainer.compact { height: 50px; padding: 0 5px; }
.headerContainer.compact .headerLogo { width: 30px; height: 22px; }
```

- [ ] **Step 5: Verify buttons work in browser**

Navigate to `http://localhost:3000`. Expected:
1. Three small buttons visible at the right of the header (moon, A, eye icons)
2. Click moon → page turns dark, button turns green/primary
3. Click A → font size increases, label cycles A → A+ → A++
4. Click eye → high-contrast mode activates, button turns active
5. Reload page — previously chosen settings persist

- [ ] **Step 6: Commit**

```bash
git add src/components/Header/Header.js src/components/Header/Header.module.css
git commit -m "feat: add theme/font-size/contrast toggle buttons to Header"
```

---

## Task 5: CSS Module migration — Core layout & UI components

**Files (modify):**
- `src/components/Footer/Footer.module.css`
- `src/components/Modal/Modal.module.css`
- `src/components/MainBanner/MainBanner.module.css`
- `src/components/BurgerMenu/BurgerMenu.module.css`
- `src/components/Card/Card.module.css`
- `src/components/BubbleBackground/BubbleBackground.module.css`
- `src/components/Breadcrumbs/Breadcrumbs.module.css`
- `src/components/Breadcrumbs.module.css`
- `src/components/BreadCrum/BreadCrum.module.css`
- `src/components/Feed/Feed.module.css`

**Token mapping reference (apply to ALL tasks 5–9):**

| Find (exact value or pattern) | Replace with |
|---|---|
| `#ffffff`, `white`, `#fff` | `var(--color-bg-dark)` |
| `#f8f9fa`, `#f8fafc`, `#f3f4f6`, `#f9fafb` | `var(--color-bg)` |
| `#edf2f7`, `#e9ecef`, `#f1f5f9`, `#f4f4f4` | `var(--color-bg-elevated)` |
| `#000`, `#000000`, `#111`, `#1f2937`, `#2d3748`, `#1e293b` | `var(--color-text)` |
| `#333`, `#374151`, `#4b5563`, `#6b7280`, `#718096`, `#7f8c8d`, `#bdc3c7` | `var(--color-text-muted)` |
| `#002147` | `var(--color-primary-dark)` |
| `#0F52BA`, `#2563eb`, `#1d4ed8`, `#0f52ba` | `var(--color-primary)` |
| `#3498db`, `#007bff`, `#3b82f6`, `#4299e1`, `#0056b3`, `#0088cc` (if NOT Telegram brand) | `var(--color-accent)` |
| `#e2e8f0`, `#dee2e6`, `#d1d5db`, `#e5e7eb` | `var(--color-border)` |
| `#28a745`, `#38a169`, `#10b981` | `var(--color-success)` |
| `#dc3545`, `#e53e3e`, `#ef4444`, `#e74c3c`, `#c0392b` | `var(--color-danger)` |
| `#ff8c00`, `#ed8936`, `#f59e0b`, `#f39c12` | `var(--color-warning)` |
| `rgba(0,0,0,0.1)`, `rgba(0,0,0,0.08)` (in box-shadow only) | `var(--color-shadow)` |
| All `!important` (except iOS/Chatwoot in globals.css) | remove `!important` |
| `color: #2b2b2b`, `rgb(43,43,43)` | `var(--color-text)` |

**Do NOT change:** brand colors `#4a76a8` (VK), `#25d366` (WhatsApp), `#0088cc` (Telegram), chart colors, loader animation `--primary` vars.

- [ ] **Step 1: Migrate `Footer/Footer.module.css`**

Open the file and apply the token mapping above to every property. Key patterns to find in the Footer: background colors for the footer bar, text colors for links, border colors for dividers.

Example replacements:
```css
/* Before → After */
background: #333;    →  background: var(--color-text);
color: #ffffff;      →  color: var(--color-text-inverse);
color: #bdc3c7;      →  color: var(--color-text-muted);
border-color: #444;  →  border-color: var(--color-border);
```

- [ ] **Step 2: Migrate `Modal/Modal.module.css`**

Current content:
```css
.modalOverlay {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(20, 28, 47, 0.31);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

.modalContent {
  background: var(--color-bg-dark);
  border-radius: 10px;
  padding: 23px 18px 20px;
  min-width: 240px;
  max-width: 320px;
  box-shadow: 0 8px 26px var(--color-shadow);
  position: relative;
}
```

Replace with exactly the above (overlay keeps its hardcoded semi-transparent dark because it's a scrim, not a surface).

- [ ] **Step 3: Migrate remaining 8 files in this batch**

For each file (`MainBanner.module.css`, `BurgerMenu.module.css`, `Card.module.css`, `BubbleBackground.module.css`, `Breadcrumbs.module.css` × 3, `Feed.module.css`): apply the full token mapping. Use Find & Replace in your editor for each color value.

- [ ] **Step 4: Verify in browser**

Run dev server. Toggle dark mode:
```js
document.documentElement.setAttribute('data-theme', 'dark')
```
Expected: footer, modal backgrounds, cards, breadcrumbs all respond to dark theme. No hardcoded light colors remaining in these components.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer/Footer.module.css \
        src/components/Modal/Modal.module.css \
        src/components/MainBanner/MainBanner.module.css \
        src/components/BurgerMenu/BurgerMenu.module.css \
        src/components/Card/Card.module.css \
        src/components/BubbleBackground/BubbleBackground.module.css \
        src/components/Breadcrumbs/Breadcrumbs.module.css \
        src/components/Breadcrumbs.module.css \
        src/components/BreadCrum/BreadCrum.module.css \
        src/components/Feed/Feed.module.css
git commit -m "refactor: migrate core layout components to CSS tokens"
```

---

## Task 6: CSS Module migration — Forms & user interaction components

**Files (modify):**
- `src/components/Form/Form.module.css`
- `src/components/FormWithoutOverlay/FormWithoutOverlay.module.css`
- `src/components/FormWrapper/FormWrapper.module.css`
- `src/components/BookingForm/BookingForm.module.css`
- `src/components/ContactForm/ContactForm.module.css`
- `src/components/LoginSignup/LoginSignup.module.css`
- `src/components/PrivacyCheckbox/PrivacyCheckbox.module.css`
- `src/components/SuccessBookingModal/SuccessBookingModal.module.css`
- `src/components/CookieConsent/CookieConsent.module.css`
- `src/components/CookieMessage/CookieMessage.module.css`
- `src/components/GlobalSearch/GlobalSearch.module.css`
- `src/components/PromotionForm/PromotionForm.module.css`
- `src/components/TinkoffPayForm/TinkoffPayForm.module.css`
- `src/components/Checkout/CheckoutForm.module.css`

**Important for Form.module.css:** Also add the `max-width: 500px; margin: 0 auto; padding: 1rem;` rule that was removed from `globals.css` in Task 1:

```css
/* Add to Form.module.css */
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}
```

(Only add if `.form` class doesn't already have these properties.)

- [ ] **Step 1: Apply token mapping to all 14 files in this batch**

Use the same token mapping table from Task 5. Key patterns in form files:
- Input backgrounds: `background: #ffffff` → `background: var(--color-bg-dark)`
- Input borders: `border: 1px solid #e2e8f0` → `border: 1px solid var(--color-border)`
- Error states: `color: #dc3545` → `color: var(--color-danger)`
- Success states: `color: #28a745` → `color: var(--color-success)`
- Button backgrounds: `background: #0F52BA` → `background: var(--color-primary)`
- Labels: `color: #1f2937` → `color: var(--color-text)`

- [ ] **Step 2: Verify forms in browser with dark mode**

```js
document.documentElement.setAttribute('data-theme', 'dark')
```
Navigate to `/loginsignup` and the home page booking form. Expected: form inputs have dark background, visible borders, correct label colors.

- [ ] **Step 3: Commit**

```bash
git add \
  src/components/Form/Form.module.css \
  src/components/FormWithoutOverlay/FormWithoutOverlay.module.css \
  src/components/FormWrapper/FormWrapper.module.css \
  src/components/BookingForm/BookingForm.module.css \
  src/components/ContactForm/ContactForm.module.css \
  src/components/LoginSignup/LoginSignup.module.css \
  src/components/PrivacyCheckbox/PrivacyCheckbox.module.css \
  src/components/SuccessBookingModal/SuccessBookingModal.module.css \
  src/components/CookieConsent/CookieConsent.module.css \
  src/components/CookieMessage/CookieMessage.module.css \
  src/components/GlobalSearch/GlobalSearch.module.css \
  src/components/PromotionForm/PromotionForm.module.css \
  src/components/TinkoffPayForm/TinkoffPayForm.module.css \
  src/components/Checkout/CheckoutForm.module.css
git commit -m "refactor: migrate form & interaction components to CSS tokens"
```

---

## Task 7: CSS Module migration — Products, services, shop, reviews

**Files (modify):**
- `src/components/Service/Service.module.css`
- `src/components/ListService/ListService.module.css`
- `src/components/ServicePricePage/ServicePricePage.module.css`
- `src/components/ArronnService/ArronnService.module.css`
- `src/components/Product/Product.module.css`
- `src/components/ListProduct/ListProduct.module.css`
- `src/components/Item/Item.module.css`
- `src/components/ProductDisplay/ProductDisplay.module.css`
- `src/components/ProductBreadcrumbs/ProductBreadcrumbs.module.css`
- `src/components/DescriptionBox/DescriptionBox.module.css`
- `src/components/ShopCategory/ShopCategory.module.css`
- `src/components/CartItems/CartItems.module.css`
- `src/components/ReviewsSection/ReviewsSection.module.css`
- `src/components/CommentSection/CommentSection.module.css`
- `src/components/LikeButton/LikeButton.module.css`
- `src/components/FavoriteButton/FavoriteButton.module.css`
- `src/components/Gifts/Gifts.module.css`
- `src/components/WorkSteps/WorkSteps.module.css`
- `src/components/ImageGallerySection/ImageGallerySection.module.css`
- `src/components/GEOSEO/GEOSEO.module.css`
- `src/app/admin-panel/listservice/ListService.css` (plain CSS)
- `src/app/gallery/Gallery.css` (plain CSS)

- [ ] **Step 1: Apply token mapping to all files in this batch**

Use the same token mapping table from Task 5. Key patterns:
- Rating stars: if hardcoded `color: gold` or `#ffc107` — replace with `var(--color-warning)`
- Review card backgrounds: `background: #ffffff` → `var(--color-bg-dark)`
- Product price text: `color: #002147` → `var(--color-primary-dark)`
- Add-to-cart buttons: `background: #0F52BA` → `var(--color-primary)`

- [ ] **Step 2: Verify in browser with dark mode**

```js
document.documentElement.setAttribute('data-theme', 'dark')
```
Navigate to `/services`, `/shop`, `/reviews`. Expected: all cards, prices, review bubbles respond to dark theme.

- [ ] **Step 3: Commit**

```bash
git add \
  src/components/Service/Service.module.css \
  src/components/ListService/ListService.module.css \
  src/components/ServicePricePage/ServicePricePage.module.css \
  src/components/ArronnService/ArronnService.module.css \
  src/components/Product/Product.module.css \
  src/components/ListProduct/ListProduct.module.css \
  src/components/Item/Item.module.css \
  src/components/ProductDisplay/ProductDisplay.module.css \
  src/components/ProductBreadcrumbs/ProductBreadcrumbs.module.css \
  src/components/DescriptionBox/DescriptionBox.module.css \
  src/components/ShopCategory/ShopCategory.module.css \
  src/components/CartItems/CartItems.module.css \
  src/components/ReviewsSection/ReviewsSection.module.css \
  src/components/CommentSection/CommentSection.module.css \
  src/components/LikeButton/LikeButton.module.css \
  src/components/FavoriteButton/FavoriteButton.module.css \
  src/components/Gifts/Gifts.module.css \
  src/components/WorkSteps/WorkSteps.module.css \
  src/components/ImageGallerySection/ImageGallerySection.module.css \
  src/components/GEOSEO/GEOSEO.module.css \
  src/app/admin-panel/listservice/ListService.css \
  src/app/gallery/Gallery.css
git commit -m "refactor: migrate product/service/reviews components to CSS tokens"
```

---

## Task 8: CSS Module migration — User profile, news, content components

**Files (modify):**
- `src/components/UserProfile/UserProfile.module.css`
- `src/components/UserProfile/ProfileEditor.module.css`
- `src/components/ProfileSettings/ProfileSettings.module.css`
- `src/components/UserBookings/UserBookings.module.css`
- `src/components/UserOrders/UserOrders.module.css`
- `src/components/NewsDetail/NewsDetail.module.css`
- `src/components/NewsEditor/NewsEditor.module.css`
- `src/components/NewsList/NewsList.module.css`
- `src/components/NewsSlider/NewsSlider.module.css`
- `src/components/PublicNewsList/PublicNewsList.module.css`
- `src/components/AboutMe/AboutMe.module.css`
- `src/components/About/About.module.css`
- `src/components/AboutRef/AboutRef.module.css`
- `src/components/Contacts/Contacts.module.css`
- `src/components/ContactsRef/ContactsRef.module.css`
- `src/components/PromotionsPage/PromotionsPage.module.css`
- `src/components/DepositoryPublic/DepositoryPublic.module.css`
- `src/components/HeaderTracking/HeaderTracking.module.css`
- `src/components/Chat/Chat.module.css`
- `src/components/TelegramChat/Chat.module.css`
- `src/app/consent/Consent.css` (plain CSS)
- `src/app/admin-panel/imagelist/ImageGallery.css` (plain CSS)

- [ ] **Step 1: Apply token mapping to all files in this batch**

Same token mapping as Tasks 5–7. Focus areas:
- News cards: article backgrounds `#ffffff` → `var(--color-bg-dark)`
- Chat bubbles: sent `background: #0F52BA` → `var(--color-primary)`, received `background: #f3f4f6` → `var(--color-bg-elevated)`
- Profile section backgrounds: `#f8f9fa` → `var(--color-bg)`

- [ ] **Step 2: Verify in browser with dark mode**

Navigate to `/news`, `/profile`, `/contacts`. Toggle dark:
```js
document.documentElement.setAttribute('data-theme', 'dark')
```
Expected: all content backgrounds, card surfaces, text colors respond correctly.

- [ ] **Step 3: Commit**

```bash
git add \
  src/components/UserProfile/UserProfile.module.css \
  src/components/UserProfile/ProfileEditor.module.css \
  src/components/ProfileSettings/ProfileSettings.module.css \
  src/components/UserBookings/UserBookings.module.css \
  src/components/UserOrders/UserOrders.module.css \
  src/components/NewsDetail/NewsDetail.module.css \
  src/components/NewsEditor/NewsEditor.module.css \
  src/components/NewsList/NewsList.module.css \
  src/components/NewsSlider/NewsSlider.module.css \
  src/components/PublicNewsList/PublicNewsList.module.css \
  src/components/AboutMe/AboutMe.module.css \
  src/components/About/About.module.css \
  src/components/AboutRef/AboutRef.module.css \
  src/components/Contacts/Contacts.module.css \
  src/components/ContactsRef/ContactsRef.module.css \
  src/components/PromotionsPage/PromotionsPage.module.css \
  src/components/DepositoryPublic/DepositoryPublic.module.css \
  src/components/HeaderTracking/HeaderTracking.module.css \
  src/components/Chat/Chat.module.css \
  src/components/TelegramChat/Chat.module.css \
  src/app/consent/Consent.css \
  src/app/admin-panel/imagelist/ImageGallery.css
git commit -m "refactor: migrate user/news/content components to CSS tokens"
```

---

## Task 9: CSS Module migration — Admin panel + depository + app-level pages

**Files (modify):**

Admin components:
- `src/components/Admin/AdminTable/AdminTable.module.css`
- `src/components/Admin/AiTrafficDashboard/AiTrafficDashboard.module.css`
- `src/components/Admin/AnalyticsDashboard/AnalyticsDashboard.module.css`
- `src/components/Admin/OrdersManagement/OrdersManagement.module.css`
- `src/components/Admin/UsersManagement/UsersManagement.module.css`
- `src/components/depository/CategoryManager.module.css`
- `src/components/depository/CategorySelect.module.css`
- `src/components/depository/DepositoryList.module.css`
- `src/components/depository/FileItem.module.css`
- `src/components/depository/FileUpload.module.css`

App-level page modules:
- `src/app/about/About.module.css`
- `src/app/admin-panel/AdminPanel.module.css`
- `src/app/admin-panel/News.module.css`
- `src/app/admin-panel/depository/DepositoryPage.module.css`
- `src/app/admin-panel/users/page.module.css`
- `src/app/admin/admin.module.css`
- `src/app/checkout/Checkout.module.css`
- `src/app/parts/Parts.module.css`
- `src/app/privacy-policy/PrivacyPolicy.module.css`
- `src/app/product/Product.module.css`
- `src/app/profile/favorites/favorites.module.css`
- `src/app/profile/profile.module.css`
- `src/app/reset-password/ResetPassword.module.css`
- `src/app/reviews/reviews.module.css`
- `src/app/search/search.module.css`
- `src/app/service/service.module.css`
- `src/app/services/[...slug]/services-detail.module.css`
- `src/app/services/services.module.css`
- `src/app/shop/Shop.module.css`
- `src/app/thank-you/thank-you.module.css`
- `src/app/yml-check/YmlCheck.module.css`

**Important for Analytics/Dashboard files:** Do NOT migrate chart-specific colors (axis colors, series colors, gradient fills for chart bars/lines). These are data-visualization colors, not surface/text tokens. Only migrate: card backgrounds, table row backgrounds, text labels, border lines between rows.

- [ ] **Step 1: Apply token mapping to all admin & depository component files**

Same mapping as Tasks 5–8. Admin panel sidebar/nav patterns:
- Sidebar background: `#2d3748` or similar dark nav → `var(--color-primary-dark)` (intentional — admin nav stays dark in light mode too, matching the existing dark sidebar convention)
- Active nav item: `background: #0F52BA` → `var(--color-primary)`
- Table row hover: `background: #f9fafb` → `var(--color-bg)`
- Table header: `background: #f3f4f6` → `var(--color-bg-elevated)`

- [ ] **Step 2: Apply token mapping to all app-level page CSS module files**

Same mapping. Page-specific patterns:
- Page hero backgrounds: `background: #f8fafc` → `var(--color-bg)`
- Section dividers: `border-bottom: 1px solid #e2e8f0` → `border-bottom: 1px solid var(--color-border)`

- [ ] **Step 3: Verify admin panel in browser**

Navigate to `/admin-panel`. Toggle dark mode:
```js
document.documentElement.setAttribute('data-theme', 'dark')
```
Expected: admin sidebar, tables, cards all respond. Analytics charts keep their original colors.

- [ ] **Step 4: Commit**

```bash
git add \
  src/components/Admin/AdminTable/AdminTable.module.css \
  src/components/Admin/AiTrafficDashboard/AiTrafficDashboard.module.css \
  src/components/Admin/AnalyticsDashboard/AnalyticsDashboard.module.css \
  src/components/Admin/OrdersManagement/OrdersManagement.module.css \
  src/components/Admin/UsersManagement/UsersManagement.module.css \
  src/components/depository/CategoryManager.module.css \
  src/components/depository/CategorySelect.module.css \
  src/components/depository/DepositoryList.module.css \
  src/components/depository/FileItem.module.css \
  src/components/depository/FileUpload.module.css \
  src/app/about/About.module.css \
  src/app/admin-panel/AdminPanel.module.css \
  src/app/admin-panel/News.module.css \
  src/app/admin-panel/depository/DepositoryPage.module.css \
  src/app/admin-panel/users/page.module.css \
  src/app/admin/admin.module.css \
  src/app/checkout/Checkout.module.css \
  src/app/parts/Parts.module.css \
  src/app/privacy-policy/PrivacyPolicy.module.css \
  src/app/product/Product.module.css \
  src/app/profile/favorites/favorites.module.css \
  src/app/profile/profile.module.css \
  src/app/reset-password/ResetPassword.module.css \
  src/app/reviews/reviews.module.css \
  src/app/search/search.module.css \
  src/app/service/service.module.css \
  "src/app/services/[...slug]/services-detail.module.css" \
  src/app/services/services.module.css \
  src/app/shop/Shop.module.css \
  src/app/thank-you/thank-you.module.css \
  src/app/yml-check/YmlCheck.module.css
git commit -m "refactor: migrate admin panel and app page CSS to tokens"
```

---

## Task 10: Final verification and cleanup

**Files:**
- Verify: all modified CSS files
- Verify: `src/app/globals.css`

- [ ] **Step 1: Search for any remaining hardcoded colors in CSS files**

```bash
grep -rn --include="*.css" \
  -e "#ffffff\|#fff\b\|white\b" \
  -e "#000000\|#000\b\|black\b" \
  -e "#f8f9fa\|#f8fafc\|#f3f4f6\|#f9fafb" \
  -e "#1f2937\|#2d3748\|#1e293b\|#333\b" \
  -e "#002147\|#0F52BA\|#0f52ba\|#2563eb" \
  -e "#3498db\|#007bff\|#3b82f6" \
  -e "#e2e8f0\|#dee2e6\|#d1d5db" \
  -e "#28a745\|#38a169\|#10b981" \
  -e "#dc3545\|#e53e3e\|#ef4444\|#e74c3c" \
  -e "#ff8c00\|#ed8936\|#f59e0b" \
  src/app/globals.css src/components src/app \
  | grep -v "node_modules" \
  | grep -v "brand-comment\|Brand colors\|intentionally\|#4a76a8\|#25d366\|#0088cc"
```

For each match that is NOT a social brand color or chart color, apply the token mapping.

- [ ] **Step 2: Search for remaining `!important` in module files**

```bash
grep -rn --include="*.css" "!important" src/components src/app \
  | grep -v "node_modules" \
  | grep -v "globals.css"
```

Expected: zero results (all `!important` should have been removed from module files in Tasks 5–9).

- [ ] **Step 3: Verify skip-to-content is reachable**

On homepage, press `Tab` once. Expected: skip link appears at top of viewport with green background. Press `Enter` — focus moves to `<main id="main-content">`.

- [ ] **Step 4: Verify font scale cycling**

Click the `A` button in header 3 times:
- 1st click: button shows `A+`, page text slightly larger
- 2nd click: button shows `A++`, page text larger still
- 3rd click: button shows `A`, page returns to normal size
- Reload page: size persists from localStorage

- [ ] **Step 5: Verify theme persists across navigation**

1. Set dark theme via button
2. Navigate to `/services`, `/shop`, `/profile`
3. Expected: dark theme maintained on all pages

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: build completes with no errors. If CSS errors appear, the error message will reference the specific file and line. Fix the referenced file and re-run.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: CSS token migration complete — full dark/contrast/font-scale support"
```
