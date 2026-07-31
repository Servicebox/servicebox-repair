# CRM-Controlled Cashback Rate Design

**Goal:** Let Tom change the site-wide cashback percentage (currently a fixed `BONUS_RATE_PCT`
environment variable, requiring a server change to touch) directly from CRM's settings UI, without
needing a code deploy each time.

## Background

Both bonus-earning code paths — `awardOrderBonuses` (online parts orders) and
`awardCrmRepairBonus` (in-person repairs, via the CRM webhook) — currently derive the same rate
from one module-level constant in `src/lib/bonuses.js`:

```js
const BONUS_RATE = parseFloat(process.env.BONUS_RATE_PCT ?? '3') / 100;
```

Changing it today means editing `.env.production` on the server and restarting the process — not
something Tom can do himself. `src/models/PaymentConfig.js` already establishes the pattern this
project uses for small, DB-backed provider config (a singleton-ish document, read at request time
instead of baked into an env var) — this feature follows the same shape rather than inventing a
new one.

## Site changes

**New model** `src/models/BonusConfig.js` — a single document holding `{ ratePct: Number }`
(0-100 range, validated). No document existing yet is expected and handled gracefully (see below)
— this project does not ship a migration that pre-creates one.

**`src/lib/bonuses.js`** changes from a module-level constant to an async lookup:

```js
async function getBonusRatePct() {
  const config = await BonusConfig.findOne().lean();
  if (config) return config.ratePct;
  return parseFloat(process.env.BONUS_RATE_PCT ?? '3');
}
```

Both `awardOrderBonuses` and `awardCrmRepairBonus` call this once per invocation instead of
reading the old top-level `BONUS_RATE` constant, and use the result for both the points
calculation and the human-readable description text (e.g. "Кэшбэк 5% за ремонт"). The env var
becomes a fallback default only, read when nobody has ever configured a rate through the new UI —
this means the very first production deploy of this feature changes nothing for anyone, and the
rate only starts being genuinely dynamic once Tom saves a value once.

**New protected route** `src/app/api/crm/bonuses/rate/route.js`, same bearer-auth pattern
(`CRM_BONUS_API_KEY`) as the existing `balance`/`redeem` routes:
- `GET` → `{ ratePct: number }` (current effective rate, including the env-var fallback if unset).
- `POST { ratePct: number }` → validates `0 <= ratePct <= 100`, upserts the single `BonusConfig`
  document, returns the saved value.

## CRM changes

**`Company.bonusIntegration`** gains one more optional field: `rateUrl?: string` — e.g.
`https://servicebox35.ru/api/crm/bonuses/rate`. Same settings tab, same per-tenant opt-in shape as
the other three URLs (`balanceUrl`, `redeemUrl`, `walletIssueUrl`) — no tenant sees any change
unless they explicitly configure this field.

**Settings UI**: one new input ("URL ставки кэшбэка") plus a numeric "Текущий процент кэшбэка"
control. Loading the settings page fetches the current rate through a new CRM proxy route (mirrors
the existing `bonus-balances`-style proxy pattern — the CRM never talks to the site's rate
endpoint directly from the browser, keeping `apiKey` server-side only). Saving a new percentage
calls the same proxy route with `POST`.

**New CRM proxy route** `src/app/api/settings/bonus-rate/route.ts`:
- `GET` → looks up `Company.bonusIntegration`, if `enabled` and `rateUrl` configured, calls the
  site's `GET rateUrl` and returns `{ ratePct }`; otherwise a graceful `400`
  ("Интеграция бонусов не настроена" / no `rateUrl` configured — treated the same as "not
  available", matching how the wallet-issue field degrades).
- `POST { ratePct }` → validates range client-side too (defense in depth, not a substitute for the
  site's own validation), forwards to the site's `POST rateUrl`.

## Error handling & edge cases

- **`rateUrl` not configured for a tenant** — the rate control simply doesn't render in that
  tenant's settings UI; existing bonus-earning keeps using whatever the site's env-var fallback
  (or a previously-set `BonusConfig` value) already is. No behavior change for anyone who doesn't
  opt in.
- **Invalid rate submitted (negative, over 100, non-numeric)** — rejected with `400` at the site's
  route (source of truth) regardless of what the CRM-side form allows through.
- **No `BonusConfig` document exists yet** — `getBonusRatePct()` falls back to the env var, exactly
  matching today's behavior; the first successful `POST` to the rate route creates the document.
- **Rate changes mid-session** — no caching; `getBonusRatePct()` reads fresh from the DB on every
  award call, so a change takes effect on the very next repair/order, no restart needed anywhere.

## Out of scope

- Per-order or per-master rate overrides — this is a single, site-wide rate, exactly matching
  today's behavior (just made editable instead of requiring a code deploy).
- Any change to `BONUS_RATE_PCT`'s role as the ultimate fallback default — it stays as a safety
  net, not replaced.
- Retroactively recalculating already-awarded `BonusTransaction` records when the rate changes —
  a rate change only affects bonuses awarded after the change, same as today's env-var behavior
  would have.
