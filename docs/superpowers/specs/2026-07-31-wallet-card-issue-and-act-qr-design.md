# Simplified Loyalty Card Issuance + Act QR Design

**Goal:** Let CRM staff (or a printed document) hand a client their Google Wallet loyalty card
without requiring the client to have a website account or log in — via a phone-keyed link the
client scans themselves — and surface this as a QR code on the printed "Акт о работах".

## Background

Today, adding the loyalty card to Google Wallet only happens through the site: a logged-in
customer clicks "Добавить в Google Wallet" on their own profile, which calls
`generateWalletJwt({ userId, username, bonuses })` (`src/lib/walletPass.js`) using their own
session-derived `User._id`. There is no CRM-side or unauthenticated way to issue this link — a
walk-in customer with no site account (or an auto-created "quiet" phone-only account from the
CRM bonus webhook, which has no password) has no way to get their card without first completing a
full site registration.

Confirmed while designing this: `crm-repair`'s `Order` model only ever carries `clientPhone`, never
the site's `User._id` — the two systems are already linked by phone number everywhere else in this
integration (`awardCrmRepairBonus`, the balance/redeem contract routes), never by a shared ID.
Keying the new issuance link by phone (not `userId`) keeps this consistent and means the CRM never
needs an extra round-trip to resolve an ID before it can render a QR — it already has
`order.clientPhone` on every order.

## Site changes

**New route:** `GET /wallet/issue?phone=<any format>` — public, unauthenticated (the client
reaches it themselves, by scanning a QR code with their own phone camera; nothing about the flow
requires them to be logged in or even have visited the site before).

- Normalizes the phone the same way the existing bonus code does (`phoneMatchRegex`) and looks up
  `User.findOne({ phone: matcher })`.
- If no matching user exists, auto-creates one — reusing the exact placeholder-account pattern
  already established in `awardCrmRepairBonus` (`src/lib/bonuses.js`): `username: 'Клиент
  ServiceBox'`, a deterministic placeholder email, `isPhoneOnlyAccount: true`, `bonuses: 0`. This
  logic is currently inlined once in `awardCrmRepairBonus`; this project extracts it into a shared
  helper (`findOrCreateUserByPhone` in `src/lib/bonuses.js`) used by both call sites, rather than
  duplicating it a second time.
- Calls `generateWalletJwt({ userId: user._id.toString(), username: user.username, bonuses:
  user.bonuses })` (unchanged, already handles everything needed) and issues a `302` redirect
  straight to the resulting `saveUrl`.
- No API key, no CRM involvement in this specific request — it's a direct client-to-site hop,
  exactly like the client scanning the tracking QR or review QR already works today in the CRM's
  printed documents.

**Accepted security tradeoff (already discussed and agreed):** this route is unauthenticated by
phone number alone. Knowing someone else's phone lets you generate a save-to-wallet link for
*their* card too, but that only lets you add a view of their bonus balance to your own wallet app —
it grants no account access, no ability to spend their bonuses (spending still requires phone
match through the existing, separately-authenticated CRM/site bonus flows), and phone numbers
aren't practically enumerable. This mirrors the risk profile already accepted for the existing
site profile button (gated only by "you know your own phone/session", nothing stronger).

## CRM changes — settings

**`Company.bonusIntegration`** gains one more optional field, alongside the existing
`enabled`/`balanceUrl`/`redeemUrl`/`apiKey`: `walletIssueUrl?: string` — e.g.
`https://servicebox35.ru/wallet/issue`. Configured once per tenant, same settings tab (« Бонусы
клиентов ») as the existing two URLs, no new tab needed.

**`GET /api/settings`** (`src/app/api/settings/route.ts`) currently derives a couple of safe,
non-secret booleans from otherwise-restricted config for use in printed documents —
`evotorQrEnabled`, `tbankEnabled` — computed from `cashierSettings` and returned to every staff
role regardless of privilege level (only the underlying secrets stay restricted). This project
adds one more derived field the same way: `bonusWalletIssueUrl` = the tenant's configured
`bonusIntegration.walletIssueUrl` when `bonusIntegration.enabled` is true, otherwise absent. The
URL itself is not a secret (unlike `apiKey`, which never leaves the server) — safe to expose to
any staff role that already sees the printed act.

## CRM changes — Act QR

**`PrintModal.tsx`** (`works-act` branch): a new QR block, generated client-side via the same
`QRCode.toDataURL` pattern already used for the existing review-link QR, right next to it (same
"Понравился сервис?"-style dashed-border footer section). Rendered only when both
`companyData.bonusWalletIssueUrl` and `order.clientPhone` are present — encodes
`${bonusWalletIssueUrl}?phone=${encodeURIComponent(order.clientPhone)}`. No new network calls
beyond the QR image encode itself (identical cost profile to the existing review QR — computed
once when the modal opens, from data already being fetched for other purposes).

## Error handling & edge cases

- **No `walletIssueUrl` configured for a tenant** — QR block simply doesn't render on their acts;
  zero behavior change for any company that hasn't opted into this (same opt-in posture as the
  rest of the bonus integration).
- **Order has no `clientPhone`** — QR block doesn't render for that specific act (nothing to encode
  a link for), independent of whether the URL is configured.
- **Client scans before ever having a site account** — the site auto-creates their phone-only
  account on the fly (balance starts at 0) and issues the card immediately; this matches how a
  physical loyalty card naturally works (you get the card, then earn on it over time) rather than
  requiring bonuses to exist first.
- **Client already has a real (password-protected) account** — the route finds the existing user
  by phone and issues a card reflecting their real current balance; no different from a fresh
  account case except the balance is nonzero.
- **Rate limiting / abuse** — out of scope for this pass; the route does a single indexed lookup
  and, in the worst case, one extra document insert — no external calls beyond the existing wallet
  JWT signing, which was already this cheap in the existing profile-page flow.

## Out of scope

- Any change to `generateWalletJwt` or the card's visual contents — unchanged, already correct.
- Apple Wallet (`.pkpass`) — separate, still blocked on Apple Developer Program membership, per
  existing project memory.
- A CRM-side UI to manually trigger sending this link (SMS/email) to a client — the act-QR and any
  future on-screen QR display are the only issuance surfaces covered here.
