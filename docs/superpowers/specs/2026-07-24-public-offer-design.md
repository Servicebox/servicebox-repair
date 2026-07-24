# Public Offer (Публичная оферта) — Design

## Purpose

ServiceBox35 currently publishes a `/privacy-policy` page and a `/consent` (PDN consent) page, but has no public offer (публичная оферта) governing the terms under which customers order repair services and purchase parts through `/shop` → `/cart` → `/checkout`. This spec adds that page.

## Scope

- New static legal page at `/oferta` covering **both**:
  - Repair services (ремонт техники)
  - Retail sale of parts through the online store (`/shop`, `/cart`, `/checkout`)
- A footer link to the new page, next to the existing "Политика конфиденциальности" link.
- No changes to checkout/cart flow (no new checkbox/gating) — out of scope per user decision.

## Architecture

Mirrors the existing `/privacy-policy` route exactly, since that page is the established pattern for static legal content in this codebase (server component, no client interactivity):

```
src/app/oferta/
  layout.js              # metadata export (title, description, canonical, OG) — same shape as privacy-policy/layout.js
  page.js                # server component, static JSX content, sectioned like privacy-policy/page.js
  Oferta.module.css      # CSS module, same class names/structure as PrivacyPolicy.module.css (container, content, header, section, list, companyInfo, contactInfo, footer)
```

`layout.js` follows `src/app/privacy-policy/layout.js`: imports `BASE_URL`, `BUSINESS` from `@/lib/constants`, sets canonical to `${BASE_URL}/oferta`.

`page.js` is a plain function component (no `'use client'`, no hooks) rendering sections in order, each `<section className={styles.section}>` with an `<h2>` heading — matching the numbering/heading style of `privacy-policy/page.js`.

`Oferta.module.css` is a near-duplicate of `PrivacyPolicy.module.css` (same visual language across legal pages) rather than a new design — this is a legal document, not a marketing surface, so visual consistency with the sibling page takes priority over novelty.

## Content Sections

Company details reuse the exact values already present in `privacy-policy/page.js` (ООО «СЕРВИС БОКС», ОГРН 1213500018522, ИНН 3525475916, КПП 352501001, адрес, руководитель, контакты) so the two legal pages never disagree on entity data.

1. **Общие положения** — what the offer is, that ordering/payment/handing over equipment for repair constitutes acceptance (акцепт), operator details block (same as privacy-policy §1).
2. **Термины и определения** — Исполнитель/Продавец, Заказчик/Покупатель, Услуги (ремонт), Товар (запчасти), Акцепт, Сайт.
3. **Предмет оферты** — two limbs: (a) repair/diagnostic services for digital equipment, (b) remote sale of parts/accessories via the site's shop, referencing that payment methods shown in the footer (наличные, безналичный, СБП, Долями) apply.
4. **Порядок заключения договора** — acceptance happens by: placing/paying for an order in `/checkout`, OR handing over equipment for repair and receiving a receipt/order ticket. Договор считается заключённым с момента акцепта.
5. **Цена и порядок оплаты** — price per the site's price list / individual quote for repairs; payment methods; when parts sold via shop, price is as shown on `/shop` at time of order.
6. **Права и обязанности сторон** — Исполнитель/Продавец obligations (perform service/deliver goods, inform customer) vs Заказчик/Покупатель obligations (provide accurate data, pay, collect within reasonable time).
7. **Порядок оказания услуг и передачи товара** — repair timelines communicated at receipt; parts delivered/handed over per method chosen at checkout.
8. **Гарантийные обязательства** — reference ФЗ №2300-1 «О защите прав потребителей» (same citation as privacy-policy §4), warranty period stated as per service ticket/product documentation (avoid inventing a specific numeric warranty period not already established elsewhere in the codebase).
9. **Ответственность сторон** — standard mutual liability per RF law, limitation to direct damages.
10. **Форс-мажор** — standard clause.
11. **Срок действия и изменение оферты** — offer is valid indefinitely until revoked/replaced; Operator may amend, new version applies to orders placed after publication.
12. **Порядок разрешения споров** — pre-trial claim procedure (претензионный порядок, 30 days), then courts at Operator's location.
13. **Реквизиты сторон** — same company requisites block/contact info as privacy-policy footer.

## Footer Change

`src/components/Footer/Footer.js`: add one `<Link href="/oferta" className={\`${styles.footerLink} ${styles.privacyLink}\`}>Публичная оферта</Link>` immediately after the existing privacy-policy link, same column ("О компании"), no new CSS classes needed.

## Non-Goals

- No checkout-flow checkbox/gating tied to this page.
- No PDF/HTML download feature (unlike `/consent`) — this is a standing published document, not a per-user signed form.
- No changes to `/consent` or `/privacy-policy` content, beyond being the source of truth for company details copied here.

## Testing

- Visual check: page renders with correct sections, company data matches privacy-policy, footer link navigates to `/oferta`.
- No unit/e2e tests added — consistent with `/privacy-policy` and `/consent`, which have none.
