# CRM Bonus Visibility & QR-Scan Design

**Goal:** Make bonus balance visible in CRM's client list (not only inside a single order, which
already exists), and let CRM staff look up a client's bonus balance/redeem by scanning their
Google Wallet loyalty-card QR code, as an alternative to typing/relying on the order's phone
number.

## Background

This builds on the already-shipped CRM bonus integration
(`docs/superpowers/specs/2026-07-30-crm-bonus-integration-design.md`): `Company.bonusIntegration`
(enabled/balanceUrl/redeemUrl/apiKey), the generic site-side contract routes
(`GET /api/crm/bonuses/balance`, `POST /api/crm/bonuses/redeem`, phone-keyed), and the
`BonusWidget` on the CRM order page.

Two things confirmed already in this codebase, no new discovery needed:
- The site's own bonus-balance/history display in the customer's profile
  (`src/app/profile/page.js`'s `BonusesTab`, backed by `GET /api/bonuses`) already exists and is
  complete — no changes needed there.
- The Google Wallet loyalty card's QR code already encodes the site's raw `User._id` as
  `barcode.value` (`src/lib/walletPass.js`) — no change needed to card generation.
- `crm-repair` has no QR/barcode *scanning* library today (only QR *generation*, for the tracking
  link) — a client-side scanning library is a new dependency.

## Site changes — additive contract extensions

**`GET /api/crm/bonuses/balance`** (`src/app/api/crm/bonuses/balance/route.js`):
- Existing `?phone=X` behavior unchanged.
- New `?phones=p1,p2,p3` (comma-separated, capped at 50) → `{ balances: { "<normalized-input>": number, ... } }`. Each phone is matched via the existing `phoneMatchRegex`; a phone with no matching
  `User` maps to `0`, not an error — one bad/unknown number must not fail the whole batch.
- New `?userId=X` → looks up `User.findById(userId).select('bonuses').lean()` instead of by phone,
  returns the same `{ balance }` shape. If `userId` is present alongside `phone`/`phones`, `userId`
  wins (it's a stronger identity signal — the client physically presented their card).
- An invalid ObjectId string in `userId` (garbage QR, damaged code) must be caught explicitly and
  return `400`, not crash into a 500 — Mongoose's `findById` throws a `CastError` on a malformed
  id, which without a try/catch would surface as an unhandled server error.

**`POST /api/crm/bonuses/redeem`** (`src/app/api/crm/bonuses/redeem/route.js`):
- Existing `{ phone, points }` behavior unchanged.
- New alternative body shape `{ userId, points }` — debits by `_id` instead of by phone. Same
  atomic `{ _id: userId, bonuses: { $gte: points } }` guard, same `409` on insufficient balance.
- Same invalid-ObjectId-must-not-500 requirement as the balance route.

Both routes keep the existing `CRM_BONUS_API_KEY` bearer-auth check unchanged.

## CRM changes — clients list bonus visibility

**New server route** (`src/app/api/clients/bonus-balances/route.ts`, mirrors the existing
`bonus-balance`/`bonus-redeem` staff routes' auth/config-lookup pattern):
- `GET ?phones=p1,p2,p3` — reads the calling staff's `Company.bonusIntegration`; if disabled or
  unconfigured, returns `400` (client list treats this as "don't show badges", not an error banner).
- Calls the site's `balanceUrl?phones=...` once (not per-client), returns
  `{ balances: { phone: number } }` straight through.

**Clients list page** (`src/app/(dashboard)/clients/page.tsx`):
- After the existing client-list fetch resolves, if `bonusIntegration.enabled`, collect the phones
  of clients on the *current page* (already paginated — bounded by page size, well under the
  50-phone cap) and call the new route once.
- Render a small "🎁 N" badge next to the existing `discount`/`totalRevenue` display when a
  client's balance > 0. Balance `0` or lookup failure: no badge, no error shown — this is a nice-
  to-have enhancement, not a load-bearing part of the client list.
- If the batch call fails or times out, the list itself still renders normally; badges are simply
  absent for that page load. No retry.

## CRM changes — QR scan on the order page

**New dependency:** `html5-qrcode` added to `crm-repair`'s `package.json` — a pure client-side
(browser `getUserMedia`) scanning library; no data leaves the browser except the decoded string,
which the app then sends to the existing bonus routes exactly like a typed phone number would be.

**`BonusWidget.tsx`** (`src/components/orders/BonusWidget.tsx`):
- New "📷 Сканировать карту" button next to the existing balance display.
- Clicking it opens a modal with an `html5-qrcode` scanner view (camera permission requested by
  the browser at this point, same as any `getUserMedia` call — HTTPS-only, and `service-box-35.ru`
  already serves over HTTPS so no additional infra work needed).
- On successful decode, the modal closes and the widget stores the scanned string in local
  component state as the active lookup key, replacing (for the rest of this widget's lifetime —
  not persisted) the `order.clientPhone`-based lookup with a `userId`-based one for both the
  balance fetch and any subsequent redeem call.
- If the decoded string is not a valid 24-hex-char ObjectId, the widget shows "Карта не
  распознана" and does not attempt a lookup with it — validated client-side before calling the API,
  as a first line of defense (the site-side `CastError` handling in the section above is the real
  guard; this is just a faster, friendlier failure for an obviously-wrong scan).
- Camera permission denial / no camera available: the modal shows an inline error and closes;
  the phone-based lookup (today's existing behavior) remains fully available — scanning is
  additive, never a hard requirement to use the widget.

**Staff routes** (`src/app/api/orders/[id]/bonus-balance/route.ts`,
`src/app/api/orders/[id]/bonus-redeem/route.ts`):
- Both gain an optional `userId` (query param for balance, body field for redeem). When present,
  it's forwarded to the site's routes as `?userId=`/`{ userId }` instead of the order's
  `clientPhone`. When absent, behavior is byte-for-byte what it is today.

## Error handling & edge cases

- **Malformed/garbage QR scan** — validated client-side (widget) as a 24-hex-char check before
  any network call; if it somehow still reaches the site with a bad id, the site-side routes catch
  `CastError` explicitly and return `400`, never a 500.
- **Scanned the wrong person's card** — no extra confirmation step beyond what phone-based lookup
  already has today: the widget shows the resolved balance before any redeem action, so staff see
  whose bonus they're about to spend before confirming, same trust model as typing a phone number.
- **Batch balance lookup timeout/failure in clients list** — list renders normally, badges just
  don't appear for that page load; no retry, no error banner (this is enhancement-tier UI, not a
  data-integrity path).
- **More clients on a page than the 50-phone batch cap** — truncate to the first 50; realistic
  page sizes (~20-30) never hit this in practice, but the cap exists to bound the fan-out call the
  site side has to do.
- **Camera unavailable / permission denied** — inline error in the scan modal; phone-based lookup
  remains the fallback, exactly as it works today without this feature.
- **Company without `bonusIntegration` enabled** — the clients-list badge and the QR-scan button
  are simply absent; zero behavior change for any tenant that hasn't opted in, consistent with the
  existing bonus-integration design's opt-in posture.

## Out of scope

- Any change to how the Google Wallet card or its QR code is generated — already correct, encodes
  `User._id` today.
- Any change to the site's own profile bonus display — already complete.
- Scanning anywhere other than the CRM order page (e.g., a dedicated stand-alone "scan client"
  page, or scanning from the clients list itself) — not requested.
- Persisting the scanned `userId` across page reloads or between orders — scan is scoped to a
  single widget session on a single order-page view.
