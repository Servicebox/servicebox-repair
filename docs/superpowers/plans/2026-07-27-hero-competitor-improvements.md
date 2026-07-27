# Hero-секция главной: улучшения + удаление Telegram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a VK CTA, a reviews anchor, and a one-click device-type entry point to the homepage hero (`MainBanner.js`), surface the site's own unused `/reviews` page, and remove Telegram as a public contact channel site-wide (keeping internal bot notifications untouched).

**Architecture:** Pure React/CSS-module changes to existing homepage components (`MainBanner.js`, `Main.js`, `RepairCalculator.js`, `ReviewsSection.js`) plus targeted deletions of Telegram-related markup in `Footer.js`, `Contacts.js`, `constants.js`, `seo-helpers.js`, and two dead-code deletions (`AboutRef.js`, `TelegramChat/`). No new dependencies, no new API routes, no database changes.

**Tech Stack:** Next.js App Router, React (client components), CSS Modules, FontAwesome (`@fortawesome/react-fontawesome`, `@fortawesome/free-brands-svg-icons`).

## Global Constraints

- No new npm dependencies.
- No automated test framework exists in this repo — testing means manual verification via `npm run dev` + browser, plus `npm run build` to catch import/type errors (see precedent in `docs/superpowers/plans/2026-07-25-turbo-pages-feed.md`).
- Internal Telegram bot notifications must NOT be touched: `src/app/api/telegram/route.js`, `src/app/api/telegram/send/route.js`, `src/app/api/telegram/updates/route.js`, and the `axios.post('/api/telegram/send', ...)` calls inside `src/components/Chat/Chat.js` and `src/components/BookingForm/BookingForm.js` all stay exactly as they are.
- `RepairCalculator.js`'s `initialDeviceType` prop is currently only read once via `useState(initialDeviceType)` — it does NOT react to prop changes after mount. This plan fixes that with a `useEffect`.
- `DEVICE_TYPES` keys in `RepairCalculator.js` are: `phone`, `laptop`, `tablet`, `tv`, `console`, `videocard` (NOT `phones`/`laptops`/etc. — no trailing `s`, and `console`/`videocard` are singular). The new hero picker must use these exact keys.
- `AboutRef.js` is confirmed dead code (never imported anywhere) with its own pre-existing bug (undefined `aboutJsonLd` reference) — delete the whole component rather than patch it.

Spec: `docs/superpowers/specs/2026-07-27-hero-competitor-improvements-design.md`

---

### Task 1: VK button in hero

**Files:**
- Modify: `src/components/MainBanner/MainBanner.js`
- Modify: `src/components/MainBanner/MainBanner.module.css`

**Interfaces:**
- Consumes: `BUSINESS.socials.vk` (already exported from `@/lib/constants`, already imported in this file as `BUSINESS`). `faVk` from `@fortawesome/free-brands-svg-icons` (new import in this file). `FontAwesomeIcon` from `@fortawesome/react-fontawesome` (new import in this file).
- Produces: no new exports — purely visual addition to the existing `MainBanner` default export.

- [ ] **Step 1: Add the VK button markup**

In `src/components/MainBanner/MainBanner.js`, add imports at the top:

```javascript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVk } from '@fortawesome/free-brands-svg-icons';
```

Then locate the `.heroCTA` block:

```javascript
          <div className={styles.heroCTA}>
            <button
              className={`${styles.heroBtn} ${styles.primary}`}
              onClick={openForm}
            >
              Записаться на ремонт
            </button>
            <button
              className={`${styles.heroBtn} ${styles.secondary}`}
              onClick={scrollToCalculator}
            >
              Рассчитать стоимость
            </button>
          </div>
```

Add a VK link right after the two buttons, inside the same `.heroCTA` div:

```javascript
          <div className={styles.heroCTA}>
            <button
              className={`${styles.heroBtn} ${styles.primary}`}
              onClick={openForm}
            >
              Записаться на ремонт
            </button>
            <button
              className={`${styles.heroBtn} ${styles.secondary}`}
              onClick={scrollToCalculator}
            >
              Рассчитать стоимость
            </button>
            <a
              href={BUSINESS.socials.vk}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroVkBtn}
              aria-label="Мы ВКонтакте"
            >
              <FontAwesomeIcon icon={faVk} />
            </a>
          </div>
```

- [ ] **Step 2: Add the CSS for `.heroVkBtn`**

In `src/components/MainBanner/MainBanner.module.css`, add this rule right after the existing `.heroBtn.secondary:hover` rule (around line 187):

```css
.heroVkBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--color-bg-dark);
  border: 2px solid var(--color-primary-bg);
  color: var(--color-primary);
  font-size: 1.25rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.heroVkBtn:hover {
  background: var(--color-primary-bg);
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/`.

Expected: a small square VK icon button appears next to "Записаться на ремонт" / "Рассчитать стоимость" in the hero. Clicking it opens `https://vk.com/servicebox35` in a new tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/MainBanner/MainBanner.js src/components/MainBanner/MainBanner.module.css
git commit -m "feat: add VK button to homepage hero"
```

---

### Task 2: Reviews anchor in hero

**Files:**
- Modify: `src/components/MainBanner/MainBanner.js`
- Modify: `src/components/ReviewsSection/ReviewsSection.js`

**Interfaces:**
- Produces: `id="reviews"` on the `ReviewsSection` root `<section>`, consumed as an anchor target by the `<a href="#reviews">` added in `MainBanner.js`. Pure HTML anchor, no JS wiring needed between the two files.

- [ ] **Step 1: Add the anchor id to `ReviewsSection`**

In `src/components/ReviewsSection/ReviewsSection.js`, find:

```javascript
    <section className={styles.reviewsSection} aria-labelledby="reviews-heading">
```

Change to:

```javascript
    <section id="reviews" className={styles.reviewsSection} aria-labelledby="reviews-heading">
```

- [ ] **Step 2: Wrap the hero rating badge in a link**

In `src/components/MainBanner/MainBanner.js`, find the existing badge block:

```javascript
          <div className={styles.heroBadge}>
            <div className={styles.badgeStars}>⭐⭐⭐⭐⭐</div>
            <div className={styles.badgeText}>
              <strong>5.0</strong> на Яндекс.Картах · <strong>150+</strong> отзывов
            </div>
          </div>
```

Wrap it in an anchor tag (keep the inner markup exactly as-is, just add the wrapping `<a>`):

```javascript
          <a href="#reviews" className={styles.heroBadge}>
            <div className={styles.badgeStars}>⭐⭐⭐⭐⭐</div>
            <div className={styles.badgeText}>
              <strong>5.0</strong> на Яндекс.Картах · <strong>150+</strong> отзывов
            </div>
          </a>
```

Note: `.heroBadge` is currently a `<div>`-targeted CSS class (`display: inline-flex`, border, padding, border-radius) — these properties apply identically to an `<a>` tag, no CSS changes needed. Anchor tags default to `display: inline`, but the class already sets `display: inline-flex` which overrides that.

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev` (if not already running from Task 1), open `http://localhost:3000/`.

Expected: clicking the "5.0 на Яндекс.Картах · 150+ отзывов" badge in the hero smoothly scrolls down to the "Отзывы клиентов из Вологды" section further down the page.

- [ ] **Step 4: Commit**

```bash
git add src/components/MainBanner/MainBanner.js src/components/ReviewsSection/ReviewsSection.js
git commit -m "feat: link hero rating badge to reviews section anchor"
```

---

### Task 3: "Leave your own review" button linking to `/reviews`

**Files:**
- Modify: `src/components/ReviewsSection/ReviewsSection.js`

**Interfaces:**
- Consumes: `Link` from `next/link` (new import in this file — currently this file has no imports beyond `React` and `styles`).

- [ ] **Step 1: Add the `Link` import**

In `src/components/ReviewsSection/ReviewsSection.js`, change:

```javascript
import React from "react";
import styles from "./ReviewsSection.module.css";
```

to:

```javascript
import React from "react";
import Link from "next/link";
import styles from "./ReviewsSection.module.css";
```

- [ ] **Step 2: Add the button next to the existing Yandex Maps link**

Find the `.reviewsCta` block:

```javascript
        <div className={styles.reviewsCta}>
          <a
            href="https://yandex.ru/maps/org/servis_boks/58578899506/reviews/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewsLink}
            aria-label="Читать все 150+ отзывов на Яндекс.Картах (откроется в новой вкладке)"
          >
            Читать все отзывы на Яндекс.Картах →
          </a>
          <div className={styles.reviewsRatingSummary}>
            <p>
              Рейтинг: <strong>5.0</strong> на основе <strong>150+ отзывов</strong> в Вологде
            </p>
          </div>
        </div>
```

Add a second link right after the first one, before `.reviewsRatingSummary`:

```javascript
        <div className={styles.reviewsCta}>
          <a
            href="https://yandex.ru/maps/org/servis_boks/58578899506/reviews/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewsLink}
            aria-label="Читать все 150+ отзывов на Яндекс.Картах (откроется в новой вкладке)"
          >
            Читать все отзывы на Яндекс.Картах →
          </a>
          <Link href="/reviews" className={styles.reviewsLinkSecondary}>
            Оставить свой отзыв
          </Link>
          <div className={styles.reviewsRatingSummary}>
            <p>
              Рейтинг: <strong>5.0</strong> на основе <strong>150+ отзывов</strong> в Вологде
            </p>
          </div>
        </div>
```

- [ ] **Step 3: Add CSS for the new secondary link**

In `src/components/ReviewsSection/ReviewsSection.module.css`, find the existing `.reviewsLink` rule (around line 152) and add a new rule right after its `:hover` state (around line 171, after `.reviewsLink:hover { ... }`):

```css
.reviewsLinkSecondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--color-primary-dark);
  padding: 16px 32px;
  border: 2px solid var(--color-border);
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  margin-left: 12px;
}

.reviewsLinkSecondary:hover {
  background: var(--color-bg-dark);
  border-color: var(--color-primary-bg);
  transform: translateY(-3px);
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev` (if not already running), open `http://localhost:3000/`, scroll to the reviews section.

Expected: a second button "Оставить свой отзыв" appears next to "Читать все отзывы на Яндекс.Картах →". Clicking it navigates to `/reviews` and that page loads normally (existing page, unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/ReviewsSection/ReviewsSection.js src/components/ReviewsSection/ReviewsSection.module.css
git commit -m "feat: surface link to the site's own /reviews page from the homepage"
```

---

### Task 4: One-click device-type picker in hero, wired into the existing calculator

**Files:**
- Modify: `src/components/RepairCalculator/RepairCalculator.js`
- Modify: `src/components/MainBanner/MainBanner.js`
- Modify: `src/components/MainBanner/MainBanner.module.css`
- Modify: `src/components/Main/Main.js`

**Interfaces:**
- Produces (in `RepairCalculator.js`): a new `useEffect` that reacts to `initialDeviceType` prop changes after mount — no signature change to the component's props.
- Produces (in `MainBanner.js`): `MainBanner` now accepts a new prop `onSelectDeviceType(key: string): void`, called when the user clicks one of the 6 device-type chips in hero.
- Consumes (in `Main.js`): lifts a new `const [heroDeviceType, setHeroDeviceType] = useState(null)` state, passes `onSelectDeviceType={setHeroDeviceType}` to `MainBanner` and `initialDeviceType={heroDeviceType}` to `RepairCalculator`.

- [ ] **Step 1: Make `RepairCalculator` react to `initialDeviceType` prop changes**

In `src/components/RepairCalculator/RepairCalculator.js`, find the component's state declarations near the top (right after `export default function RepairCalculator(...) {`):

```javascript
export default function RepairCalculator({ initialDeviceType = null, initialServiceId = null }) {
    const [deviceType, setDeviceType] = useState(initialDeviceType);
    const [matrixData, setMatrixData] = useState(null);
```

Right after the `selectDeviceType` function definition (which already exists in this file — do not redefine it, just add a new `useEffect` after it):

```javascript
    const selectDeviceType = (key) => {
        setDeviceType(key);
        setBrandId(null);
        setModelId(null);
        setSelectedServices([]);
    };
```

Add immediately after this function:

```javascript
    // Реагирует на изменение initialDeviceType ПОСЛЕ монтирования — обычный
    // useState(initialDeviceType) выше видит его только один раз при первом
    // рендере. Нужно для hero-пикера категории на главной (Main.js), который
    // передаёт initialDeviceType уже после того, как этот компонент смонтирован.
    useEffect(() => {
        if (initialDeviceType) selectDeviceType(initialDeviceType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDeviceType]);
```

- [ ] **Step 2: Verify `RepairCalculator.js` already imports `useEffect`**

Run: `grep -n "^import.*useState\|^import.*useEffect" src/components/RepairCalculator/RepairCalculator.js`

Expected: the import line already includes `useEffect` (confirmed present: `import { useState, useMemo, useEffect } from 'react';` at the top of the file) — no import change needed for this step.

- [ ] **Step 3: Add the device-type picker to `MainBanner.js`**

In `src/components/MainBanner/MainBanner.js`, add a `deviceTypes` constant near the top of the file, right after the existing `services` array:

```javascript
const services = [
  { icon: '📱', name: 'Смартфоны', href: '/services/phones' },
  { icon: '💻', name: 'Ноутбуки', href: '/services/laptops' },
  { icon: '📲', name: 'Планшеты', href: '/services/tablets' },
  { icon: '📺', name: 'Телевизоры', href: '/services/tv' },
  { icon: '🎮', name: 'Видеокарты', href: '/services/videocards' },
  { icon: '🕹️', name: 'Приставки', href: '/services/consoles' },
];

const deviceTypePicks = [
  { key: 'phone', icon: '📱', label: 'Смартфон' },
  { key: 'laptop', icon: '💻', label: 'Ноутбук' },
  { key: 'tablet', icon: '📲', label: 'Планшет' },
  { key: 'tv', icon: '📺', label: 'Телевизор' },
  { key: 'console', icon: '🎮', label: 'Приставка' },
  { key: 'videocard', icon: '🔥', label: 'Видеокарта' },
];
```

Change the component signature to accept the new prop:

```javascript
export default function MainBanner({ onSelectDeviceType }) {
```

Add a handler right after `scrollToCalculator`:

```javascript
  const handleDeviceTypePick = (key) => {
    onSelectDeviceType?.(key);
    scrollToCalculator();
  };
```

Add the picker UI right after the `.heroCTA` div (after the closing `</div>` of `.heroCTA`, before `.heroMicro`):

```javascript
          <div className={styles.deviceQuickPick} aria-label="Быстрый выбор устройства для расчёта цены">
            <p className={styles.deviceQuickPickLabel}>Узнать цену за 1 клик:</p>
            <div className={styles.deviceQuickPickGrid}>
              {deviceTypePicks.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  className={styles.deviceQuickPickChip}
                  onClick={() => handleDeviceTypePick(d.key)}
                >
                  <span aria-hidden="true">{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>
```

- [ ] **Step 4: Add CSS for the device quick-pick**

In `src/components/MainBanner/MainBanner.module.css`, add this block right after the `.heroVkBtn:hover` rule added in Task 1:

```css
.deviceQuickPick {
  margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
}

.deviceQuickPickLabel {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 0.625rem 0;
}

.deviceQuickPickGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.deviceQuickPickChip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem;
  background: var(--color-bg-dark);
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.deviceQuickPickChip:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-bg);
  transform: translateY(-2px);
}
```

- [ ] **Step 5: Lift state in `Main.js` and wire both components**

In `src/components/Main/Main.js`, change:

```javascript
// components/Main/Main.js
'use client';

import MainBanner from "../MainBanner/MainBanner";
import RepairCalculator from '@/components/RepairCalculator/RepairCalculator';
import CategoriesGrid from "../CategoriesGrid/CategoriesGrid";
import CommonProblems from "../CommonProblems/CommonProblems";
import ReviewsSection from "../ReviewsSection/ReviewsSection";
import WorkSteps from "../WorkSteps/WorkSteps";
import AboutMe from "../AboutMe/AboutMe";
import NewsBlock from "../NewsBlock/NewsBlock";
import Gifts from "../Gifts/Gifts";
import Contacts from "../Contacts/Contacts";

function Main() {
  return (
    <div>
      <section className="main">
        <MainBanner />
        <div id="repair-calculator" className="scroll-mt-24">
          <RepairCalculator />
        </div>
```

to:

```javascript
// components/Main/Main.js
'use client';

import { useState } from 'react';
import MainBanner from "../MainBanner/MainBanner";
import RepairCalculator from '@/components/RepairCalculator/RepairCalculator';
import CategoriesGrid from "../CategoriesGrid/CategoriesGrid";
import CommonProblems from "../CommonProblems/CommonProblems";
import ReviewsSection from "../ReviewsSection/ReviewsSection";
import WorkSteps from "../WorkSteps/WorkSteps";
import AboutMe from "../AboutMe/AboutMe";
import NewsBlock from "../NewsBlock/NewsBlock";
import Gifts from "../Gifts/Gifts";
import Contacts from "../Contacts/Contacts";

function Main() {
  const [heroDeviceType, setHeroDeviceType] = useState(null);

  return (
    <div>
      <section className="main">
        <MainBanner onSelectDeviceType={setHeroDeviceType} />
        <div id="repair-calculator" className="scroll-mt-24">
          <RepairCalculator initialDeviceType={heroDeviceType} />
        </div>
```

Leave the rest of the file (`CategoriesGrid`, `CommonProblems`, `ReviewsSection`, etc.) exactly as-is.

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev` (if not already running), open `http://localhost:3000/`.

Expected: hero shows 6 small chips ("Узнать цену за 1 клик:" + Смартфон/Ноутбук/Планшет/Телевизор/Приставка/Видеокарта). Clicking any chip scrolls down to the calculator, and the calculator is already showing the brand-selection step for that device type (not the initial device-type-selection step).

- [ ] **Step 7: Commit**

```bash
git add src/components/RepairCalculator/RepairCalculator.js src/components/MainBanner/MainBanner.js src/components/MainBanner/MainBanner.module.css src/components/Main/Main.js
git commit -m "feat: add one-click device-type picker in hero, wired to existing calculator

Reuses RepairCalculator's existing initialDeviceType prop and pricing
logic instead of duplicating brand/model/price resolution in a
separate hero widget. Fixed initialDeviceType to react to prop changes
after mount (it was previously read-once via useState)."
```

---

### Task 5: Remove public Telegram references

**Files:**
- Modify: `src/components/Footer/Footer.js`
- Modify: `src/components/Contacts/Contacts.js`
- Modify: `src/lib/constants.js`
- Modify: `src/lib/seo-helpers.js`
- Delete: `src/components/AboutRef/AboutRef.js`
- Delete: `src/components/AboutRef/AboutRef.module.css`
- Delete: `src/components/TelegramChat/Chat.js`
- Delete: `src/components/TelegramChat/Chat.module.css`

**Interfaces:** none — pure removals, no new exports, no signature changes.

- [ ] **Step 1: Remove the Telegram link from `Footer.js`**

In `src/components/Footer/Footer.js`, find:

```javascript
          <div className={styles.socials}>
            <a
              href="https://vk.com/servicebox35"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте ServiceBox"
            >
              ВКонтакте
            </a>
            <a
              href="https://t.me/Tomkka"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram ServiceBox"
            >
              Telegram
            </a>
          </div>
```

Change to (remove the Telegram `<a>` block, keep VK):

```javascript
          <div className={styles.socials}>
            <a
              href="https://vk.com/servicebox35"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте ServiceBox"
            >
              ВКонтакте
            </a>
          </div>
```

- [ ] **Step 2: Remove the Telegram card from `Contacts.js`**

In `src/components/Contacts/Contacts.js`, find:

```javascript
                <a
                  href="https://vk.com/servicebox35"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте"
                >
                  <FontAwesomeIcon icon={faVk} className={styles.socialIcon} />
                  <span>ВКонтакте</span>
                </a>
                <a
                  href="https://t.me/Tomkka"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <FontAwesomeIcon icon={faTelegram} className={styles.socialIcon} />
                  <span>Telegram</span>
                </a>
```

Change to:

```javascript
                <a
                  href="https://vk.com/servicebox35"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте"
                >
                  <FontAwesomeIcon icon={faVk} className={styles.socialIcon} />
                  <span>ВКонтакте</span>
                </a>
```

Then update the import line — find:

```javascript
import { faVk, faTelegram } from '@fortawesome/free-brands-svg-icons';
```

Change to:

```javascript
import { faVk } from '@fortawesome/free-brands-svg-icons';
```

- [ ] **Step 3: Remove the `telegram` field from `BUSINESS.socials`**

In `src/lib/constants.js`, find:

```javascript
    socials: {
        vk: 'https://vk.com/servicebox35',
        telegram: 'https://t.me/Tomkka',
    },
```

Change to:

```javascript
    socials: {
        vk: 'https://vk.com/servicebox35',
    },
```

- [ ] **Step 4: Update the JSON-LD `sameAs` array in `seo-helpers.js`**

In `src/lib/seo-helpers.js`, find:

```javascript
    sameAs: [BUSINESS.socials.vk, BUSINESS.socials.telegram],
```

Change to:

```javascript
    sameAs: [BUSINESS.socials.vk],
```

- [ ] **Step 5: Delete the dead `AboutRef` component**

```bash
git rm src/components/AboutRef/AboutRef.js src/components/AboutRef/AboutRef.module.css
```

- [ ] **Step 6: Delete the dead `TelegramChat` component**

```bash
git rm src/components/TelegramChat/Chat.js src/components/TelegramChat/Chat.module.css
```

- [ ] **Step 7: Run the production build to catch any leftover references**

Run: `npm run build`
Expected: build completes with no errors. In particular, no "Module not found" or "X is not defined" errors related to `AboutRef`, `TelegramChat`, `faTelegram`, or `BUSINESS.socials.telegram`.

- [ ] **Step 8: Grep-verify no public Telegram references remain**

Run: `grep -rn "t\.me/Tomkka\|faTelegram" src --include="*.js"`

Expected: empty output (zero matches). If `api/telegram/*` route files or `Chat.js`/`BookingForm.js` internal notification calls show up in a broader search for the word "telegram" (lowercase, in URL paths like `/api/telegram/send`), that's expected and correct — those are the internal notification channel, explicitly out of scope for removal (see Global Constraints).

- [ ] **Step 9: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/contacts` and check the footer on any page.

Expected: no "Telegram" text or icon visible anywhere on `/contacts` or in the footer; "ВКонтакте" link still present and working in both places.

- [ ] **Step 10: Commit**

```bash
git add -A -- src/components/Footer/Footer.js src/components/Contacts/Contacts.js src/lib/constants.js src/lib/seo-helpers.js src/components/AboutRef src/components/TelegramChat
git commit -m "chore: remove Telegram as a public contact channel; delete two dead components

Telegram is legally restricted in Russia (Tom's explicit instruction,
2026-07-27) — removed the public-facing links from Footer, Contacts
page, BUSINESS.socials, and the LocalBusiness JSON-LD sameAs array.
Internal bot notifications (api/telegram/*, called from Chat.js and
BookingForm.js on new messages/bookings) are untouched — that's a
private operational channel, not a public link.

Also deleted AboutRef.js (never imported anywhere, had its own
pre-existing bug — undefined aboutJsonLd reference) and TelegramChat/
(orphaned pre-CRM chat widget, superseded by the current Chat.js ->
CRM inbox integration, never imported anywhere either)."
```

---

### Task 6: Final full-site build and manual smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the full production build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 2: Start the dev server and walk through the full checklist**

Run: `npm run dev`

Open `http://localhost:3000/` and verify:
- VK button visible in hero, opens `vk.com/servicebox35` in a new tab (Task 1).
- Clicking the "5.0 · 150+ отзывов" badge scrolls smoothly to the reviews section (Task 2).
- "Оставить свой отзыв" button in the reviews section links to `/reviews`, which loads correctly (Task 3).
- 6 device-type chips visible in hero under "Узнать цену за 1 клик:"; clicking one scrolls to the calculator, already past the device-type-selection step (Task 4).
- No Telegram text/icon anywhere on `/`, `/contacts`, or in the footer (Task 5).
- `/about` (if it renders `AboutRef` indirectly via some other path not caught by the earlier grep) still loads without error — double-check by visiting it directly, since Task 5 deleted `AboutRef.js` entirely.

- [ ] **Step 3: Stop the dev server**

No commit needed for this task — it's verification only.
