# CRM-Integrated Bonus Program Design

**Goal:** Extend the existing bonus/cashback system (currently only earned via online parts
purchases through Yandex Split) so that in-person repairs tracked in Tom's own CRM
(`crm-repair`, `service-box-35.ru`) also earn bonuses, and so bonuses can be spent both online
(checkout discount) and in person (staff-applied discount inside the CRM) — without breaking any
currently-working bonus, checkout, or webhook behavior.

## Background

The site already has a working bonus system:

- `User.bonuses` (balance) + `BonusTransaction` ledger (`src/models/BonusTransaction.js`,
  `type`: earn/spend/adjust, sign-validated).
- `awardOrderBonuses()` (`src/lib/bonuses.js`) — the only existing automatic earn path today,
  triggered from the Yandex Split payment webhook (`src/app/api/payments/split/webhook/route.js`)
  for online parts orders. `points = Math.max(1, Math.floor(totalAmount * BONUS_RATE))`,
  `BONUS_RATE = BONUS_RATE_PCT env var / 100` (default 3%).
- `GET/POST /api/bonuses` (`src/app/api/bonuses/route.js`) — `GET` returns the caller's own
  balance/history; `POST` is admin-only manual earn/spend/adjust.
- A working Google Wallet loyalty card (`src/lib/walletPass.js`) showing `User.bonuses` as the
  loyalty balance — fixed and confirmed working 2026-07-24 (see project memory
  `google-wallet-loyalty-card.md`).

None of this is connected to `crm-repair`, Tom's separate multi-tenant CRM SaaS where real
in-person repair orders are tracked (ServiceBox is one tenant/company among others). This design
connects the two systems in both directions: CRM → site (earn on repair completion) and
site ↔ CRM (spend, both at site checkout and in-person via CRM staff).

**Research findings that shape this design** (from reading `crm-repair`'s `Order.ts`, `Client.ts`,
`Company.ts`, `outboundWebhook.ts`, and the `/api/v1/*` and `/api/orders/[id]` routes):

- The CRM already has a per-company outbound webhook mechanism (`fireWebhook`, HMAC-SHA256 signed,
  configured by each tenant in Settings), firing `order.status_changed` on every status transition.
  This is the natural hook — no new CRM mechanism needs inventing, only extending.
- The terminal status **`issued`** ("Выдан") is when the CRM itself considers a repair complete and
  paid: `Client.totalRevenue` is incremented and any outstanding balance is auto-charged at that
  moment (`src/app/api/orders/[id]/route.ts` lines 232-293).
- The current `order.status_changed` webhook payload carries only
  `{orderNumber, status, statusLabel, clientName, device}` — no phone, email, or amount. This must
  be extended (additively) to support bonus crediting.
- The CRM's `Client` model has `phone`/`email` but neither is unique/required; phone matching is
  done elsewhere in the codebase via `buildPhoneMatcher()` (strips non-digits, matches last 10).
  This project reuses that same normalization approach on the site side.
- There is no client-facing loyalty/points concept anywhere in `crm-repair` today (only unrelated
  staff-payroll "bonuses"). The in-person spend feature is new CRM functionality, not a hookup to
  something that already exists.
- The v1 external API (`/api/v1/*`) is request/response only, request-authenticated via a
  per-company `Company.apiKey` → tenant DB resolution (`validateCompanyApiKey`). No existing v1
  route supports status transition or a bonus-balance contract — new routes are needed.

## Hard constraint: nothing existing may break

Every change below is additive:

- No existing webhook payload field is removed or renamed — only new fields added, only for the
  `issued` transition.
- `awardOrderBonuses()` (online-order cashback) is not replaced; the CRM-earn path is a fully
  independent function writing to the same `User.bonuses`/`BonusTransaction`.
- The new CRM `bonusIntegration` company config defaults to `enabled: false` — zero behavior change
  for `crm-repair`'s other tenant companies unless they explicitly opt in.
- `/api/bonuses` (admin manual adjust) is untouched.

## Architecture

```
EARNING (CRM → site, push)
  Staff sets order status to "Выдан" (issued) in crm-repair
    → CRM increments Client.totalRevenue (existing, unchanged)
    → CRM fires order.status_changed webhook (existing mechanism), payload extended
      with clientPhone, clientEmail, finalCost — only when status === 'issued'
    → Site receives webhook at new route, verifies HMAC signature (same scheme as the
      already-working /api/payments/split/webhook)
    → Site normalizes phone, looks up User:
        - found  → $inc User.bonuses, write BonusTransaction (type: earn)
        - not found → auto-create a minimal User (phone only, no email/password,
          not loggable-in until the customer sets a password) and credit that

SPENDING — site checkout (site-only change)
  Logged-in customer applies bonus balance as a discount (capped at 50% of order total)
  when placing a parts order. BonusTransaction (type: spend) is only written once the
  Split payment webhook confirms the (reduced) amount was actually paid — never at
  button-click time, to avoid spending bonuses on an order that's never actually paid.

SPENDING — in-person via CRM (CRM → site, pull; generic per-company)
  Staff opens the order in crm-repair, sees the client's bonus balance (if the tenant
  company has this integration enabled), enters an amount to redeem (capped at 50% of
  finalCost), CRM calls the site's balance/redeem API (new, API-key authenticated,
  same shape any tenant's own bonus backend could implement), site debits the balance,
  CRM applies the amount as a discount to the order.
```

## Earning: CRM webhook → site

**`crm-repair` changes** (`src/lib/outboundWebhook.ts`, `src/app/api/orders/[id]/route.ts:593-599`):
add `clientPhone`, `clientEmail`, `finalCost` to the `order.status_changed` payload, only when the
new status is `'issued'`. All existing consumers of this event (there are currently none besides
what this project adds) keep receiving the existing fields unchanged.

**Site changes** (new route, e.g. `src/app/api/webhooks/crm-bonuses/route.js`):

- HMAC-SHA256 verification against the per-company `outboundWebhook.secret` (same scheme as
  `/api/payments/split/webhook`'s `X-Yandex-Signature` handling, `timingSafeEqual`).
- Idempotency: guard on `(orderNumber, status)` — store processed events (new minimal collection,
  or a `processedCrmEvents` array on a small tracking doc) so a redelivered webhook is a no-op
  (`{ ok: true, skipped: true }`), matching the existing Split-webhook idempotency pattern.
- Points calculation reuses `src/lib/bonuses.js`'s existing formula and `BONUS_RATE_PCT` env var —
  one rate governs both online-order cashback and CRM-repair cashback, not two separate constants.
- Phone normalization: strip non-digits, match last 10 (mirrors `crm-repair`'s own
  `buildPhoneMatcher()` so both sides agree on what "the same phone number" means).
- `User.findOne({ phone })`:
  - found → atomic `$inc` on `bonuses` + new `BonusTransaction` (`type: 'earn'`), inside a Mongoose
    session/transaction, same pattern as `awardOrderBonuses`. `BonusTransaction` gets a new
    optional `crmOrderNumber` field (traceability back to the CRM order; `orderId` stays reserved
    for the site's own `Order` model).
  - not found → create a new `User` with only `phone` set (no email, no password hash — existing
    login code paths require a password, so this account is inert for login purposes until the
    customer sets one), then credit it the same way. No separate "pending balance" model — the
    account itself *is* the balance holder from the first repair onward.

## Spending: site checkout

- Checkout UI shows available-to-spend = `min(balance, 50% of order total)`.
- New customer-facing route (e.g. `POST /api/orders/[id]/apply-bonus`), authenticated via the
  existing `verifyToken` (not admin-only, unlike current `/api/bonuses` POST). Server
  re-validates the 50% cap against the actual order total — never trusts a client-supplied amount.
- Balance-sufficiency check uses the same atomic single-query pattern already in
  `/api/bonuses` POST (`{ _id: userId, bonuses: { $gte: points } }`), not read-then-write.
- The `BonusTransaction` (`type: 'spend'`) is only created inside the existing Split
  payment-webhook success handler (after the reduced amount is actually confirmed paid) — not at
  the moment the customer clicks "apply." If payment never completes, no bonuses are spent.
- `awardOrderBonuses`'s cashback base changes from "order total" to "amount actually paid in
  money" (order total minus any bonus discount applied). For the ~100% of orders today that don't
  use a bonus discount, this is numerically identical to current behavior — zero regression. This
  prevents bonuses from generating further bonuses in a loop.

## Spending: in-person via CRM (generic, opt-in per tenant company)

Not ServiceBox-specific — any `crm-repair` tenant can enable this for their own bonus backend.

**`crm-repair` changes:**

- New per-company config on `Company`, alongside the existing `outboundWebhook` block:
  `bonusIntegration: { enabled: boolean, balanceUrl: string, redeemUrl: string, apiKey: string }`.
  Defaults to `enabled: false`.
- New Settings page (next to the existing webhook settings) for a company owner to turn this on
  and enter their own `balanceUrl`/`redeemUrl`/`apiKey`.
- Order page: if `company.bonusIntegration.enabled` and the order has a `clientPhone`, render a
  "Client bonuses" widget:
  - `GET {balanceUrl}?phone=<phone>` (`Authorization: Bearer {apiKey}`) → `{ balance }`.
  - Staff enters an amount to redeem (client-side capped at 50% of `finalCost` for UX; the
    receiving side must also enforce this — never trust the caller).
  - `POST {redeemUrl}` (`Authorization: Bearer {apiKey}`, body `{ phone, points }`) →
    `{ ok: true, newBalance }` on success, `409` on insufficient balance.
  - On success, the redeemed amount is applied as a discount line on the order.
- If `enabled` is false (the default for every company except ServiceBox, at least initially), the
  widget doesn't render and no outbound calls happen — zero behavior change for other tenants.

**Site changes:** implement the contract above as two new API-key-authenticated routes (this is
ServiceBox's own implementation of the generic contract, not something other tenants need — they'd
point `balanceUrl`/`redeemUrl` at their own backend instead). Reuses the same atomic
balance-sufficiency pattern as the checkout-spend and admin-adjust paths.

No site-side registration is required for this path at all — the phone number is already trusted
because the customer is physically present and known to staff, unlike an anonymous web request.

## Error handling & edge cases

- **Duplicate webhook delivery** — idempotency guard on `(orderNumber, status)`; redelivery is a
  silent no-op, matching the existing Split-webhook pattern.
- **CRM unreachable / webhook never arrives** — soft failure, no retry queue (out of scope for this
  project's scale); recoverable manually via the existing admin `/api/bonuses` POST if needed.
- **`finalCost` is 0, or no `clientPhone` on the order** — earning is skipped; no zero-value
  transactions are created, and there's no phone to match against.
- **Insufficient balance on CRM-initiated redeem** — site responds `409` with the current balance;
  CRM surfaces this to staff and does not apply any discount.
- **Concurrent spend from both channels** (e.g. customer spends online while staff is mid-redeem
  in a shop visit) — both paths go through the same atomic `$gte` guarded update, so the balance
  can never go negative regardless of ordering.
- **Tenant company without the integration enabled** — no widget, no outbound calls, no schema
  impact; fully inert.
- **Existing online-order cashback** — unaffected for every order that doesn't use a bonus
  discount (the overwhelming majority today); only orders that *do* apply a bonus discount get the
  new "cashback on money paid, not on face value" behavior.

## Out of scope

- Apple Wallet (`.pkpass`) support — unrelated system, blocked on Tom setting up a paid Apple
  Developer Program membership (see project memory `google-wallet-loyalty-card.md`). Not part of
  this project.
- SMS/OTP phone verification for anonymous checkout spending — would remove the login requirement
  for online bonus spending, but needs an SMS provider integration; a deliberate non-goal here.
- A retry/dead-letter queue for missed CRM webhooks — accepted as a soft-failure gap at this scale.
- Any change to `crm-repair`'s existing staff-payroll "bonus" feature — unrelated homonym, not
  touched.
