# Simplified Loyalty Card Issuance + Act QR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A phone-keyed, unauthenticated site route that issues a Google Wallet loyalty card
without requiring login, and a QR code on CRM's printed "Акт о работах" that points at it.

**Architecture:** Site gets one new public Route Handler that finds-or-creates a User by phone
and redirects straight to the Google Wallet save link (reusing already-working
`generateWalletJwt`). CRM gets one new optional config field (per-tenant, alongside the existing
bonus balance/redeem URLs), a safe derived field surfaced through the existing `/api/settings`
route, and one new client-side-generated QR block in the print modal — no new CRM→site API calls.

**Tech Stack:** Same two repos as prior plans — servicebox-repair (Next.js App Router, JS,
Mongoose, no test framework) and crm-repair (Next.js 14, TypeScript, Vitest for pure-function
tests only).

**Spec:** `docs/superpowers/specs/2026-07-31-wallet-card-issue-and-act-qr-design.md`

## Global Constraints

- `/wallet/issue` is intentionally public/unauthenticated — this is an accepted, already-discussed
  tradeoff (see spec), not an oversight. Do not add auth to it.
- No existing field, route, or component prop is renamed or removed — `walletIssueUrl` is a new
  optional addition to `bonusIntegration`; `bonusWalletIssueUrl` is a new optional field on the
  `/api/settings` response, alongside the existing `evotorQrEnabled`/`tbankEnabled` pattern.
- The QR block on the act only ever renders when both the URL is configured AND the order has a
  phone — every tenant without this configured sees zero change to their printed documents.
- servicebox-repair: no test framework — verify with `node --input-type=module` scripts and curl
  against the dev server.
- crm-repair: verify manually via curl with a forged session cookie (no API-route test convention
  in this repo — see prior plans' Global Constraints for the full rationale).
- Both repos are separate git repositories — commit to each independently.

---

## Part A — servicebox-repair

### Task 1: Extract `findOrCreateUserByPhone` helper

**Files:**
- Modify: `src/lib/bonuses.js`

**Interfaces:**
- Produces: `findOrCreateUserByPhone(phone, { session } = {}): Promise<User | null>` — used by
  `awardCrmRepairBonus` (refactored to use it) and by Task 2's new route.

This is a pure refactor — `awardCrmRepairBonus`'s existing find-or-create logic moves into a
shared helper with no behavior change, so it can be reused by the new wallet-issue route without
duplicating the placeholder-account creation logic a second time.

- [ ] **Step 1: Extract the helper and update `awardCrmRepairBonus` to use it**

```js
import mongoose from 'mongoose';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { phoneMatchRegex, normalizePhoneDigits } from '@/lib/phone';

const BONUS_RATE = parseFloat(process.env.BONUS_RATE_PCT ?? '3') / 100;

/**
 * Атомарно начисляет бонусы пользователю за завершённый заказ.
 * Использует Mongoose session для транзакции.
 * Возвращает { awarded, points } или бросает ошибку.
 */
export async function awardOrderBonuses({ userId, orderId, totalAmount, session }) {
  const points = Math.max(1, Math.floor(totalAmount * BONUS_RATE));

  await User.findByIdAndUpdate(
    userId,
    { $inc: { bonuses: points } },
    { session }
  );

  await BonusTransaction.create(
    [{
      userId,
      type: 'earn',
      points,
      orderId,
      description: `Кэшбэк ${Math.round(BONUS_RATE * 100)}% за заказ`,
    }],
    { session }
  );

  return { awarded: true, points };
}

/**
 * Находит пользователя по телефону или создаёт "тихий" аккаунт (без пароля,
 * с плейсхолдер-email) — общая логика для начисления бонусов из CRM и для
 * выдачи карты лояльности по прямой ссылке (см. /wallet/issue). Возвращает
 * null, если phone не проходит валидацию как телефон вообще.
 */
export async function findOrCreateUserByPhone(phone, { session } = {}) {
  const matcher = phoneMatchRegex(phone);
  if (!matcher) return null;

  let user = await User.findOne({ phone: matcher }).session(session);
  if (!user) {
    const digits = normalizePhoneDigits(phone);
    [user] = await User.create(
      [{
        username: 'Клиент ServiceBox',
        email: `phone${digits}@bonus.crm`,
        phone: digits,
        isPhoneOnlyAccount: true,
        bonuses: 0,
      }],
      { session }
    );
  }
  return user;
}

/**
 * Начисляет бонусы за ремонт, завершённый в CRM (crm-repair), найденный по
 * телефону клиента. Если пользователя с таким телефоном нет на сайте —
 * создаёт "тихий" аккаунт — см. дизайн-спеку
 * 2026-07-30-crm-bonus-integration-design.md, раздел "Correction found while
 * reading the actual User schema".
 */
export async function awardCrmRepairBonus({ phone, finalCost, crmOrderNumber, session }) {
  if (!finalCost || finalCost <= 0) return { awarded: false, reason: 'zero_amount' };

  const user = await findOrCreateUserByPhone(phone, { session });
  if (!user) return { awarded: false, reason: 'invalid_phone' };

  const points = Math.max(1, Math.floor(finalCost * BONUS_RATE));

  await User.updateOne(
    { _id: user._id },
    { $inc: { bonuses: points } },
    { session }
  );

  await BonusTransaction.create(
    [{
      userId: user._id,
      type: 'earn',
      points,
      crmOrderNumber,
      description: `Кэшбэк ${Math.round(BONUS_RATE * 100)}% за ремонт (заказ CRM ${crmOrderNumber})`,
    }],
    { session }
  );

  return { awarded: true, points, userId: user._id.toString() };
}
```

- [ ] **Step 2: Verify manually — confirm existing CRM-earn behavior is unchanged**

Re-run the exact verification from the original bonus-integration plan's Task 7/8 (create a test
user, call `awardCrmRepairBonus` directly or via the `/api/webhooks/crm-bonuses` route, confirm
points are credited and a placeholder account is created when no user matches):

```bash
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import { awardCrmRepairBonus } from './src/lib/bonuses.js';
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ email: 'phone9992223344@bonus.crm' });
const session = await mongoose.startSession();
session.startTransaction();
const result = await awardCrmRepairBonus({ phone: '+7 999 222-33-44', finalCost: 1000, crmOrderNumber: 'REFACTOR-TEST-1', session });
await session.commitTransaction();
session.endSession();
console.log(result);
const u = await User.findById(result.userId);
console.log('balance:', u.bonuses, 'isPhoneOnlyAccount:', u.isPhoneOnlyAccount);
await User.deleteOne({ _id: u._id });
await mongoose.disconnect();
process.exit(0);
"
```

Expected: `{ awarded: true, points: 30, userId: '...' }` (1000 * 0.03 = 30), then
`balance: 30 isPhoneOnlyAccount: true` — identical shape/values to before the refactor.

- [ ] **Step 3: Commit**

```bash
git add src/lib/bonuses.js
git commit -m "refactor: extract findOrCreateUserByPhone helper from awardCrmRepairBonus

No behavior change — reused by the new /wallet/issue route in the
next task instead of duplicating the placeholder-account logic."
```

---

### Task 2: `/wallet/issue` public route

**Files:**
- Create: `src/app/wallet/issue/route.js`

**Interfaces:**
- Consumes: `findOrCreateUserByPhone` (Task 1), `generateWalletJwt` (existing,
  `src/lib/walletPass.js`).
- Produces: `GET /wallet/issue?phone=<any format>` → `302` redirect to the Google Wallet save URL.

- [ ] **Step 1: Write the route**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { findOrCreateUserByPhone } from '@/lib/bonuses';
import { generateWalletJwt } from '@/lib/walletPass';

export async function GET(request) {
  await dbConnect();

  const phone = new URL(request.url).searchParams.get('phone');
  const user = await findOrCreateUserByPhone(phone);
  if (!user) {
    return NextResponse.json({ error: 'Неверный номер телефона' }, { status: 400 });
  }

  const { saveUrl } = generateWalletJwt({
    userId: user._id.toString(),
    username: user.username,
    bonuses: user.bonuses,
  });

  return NextResponse.redirect(saveUrl);
}
```

- [ ] **Step 2: Verify manually**

With the dev server running (`PORT=3100 npm run dev`):

```bash
# New phone, no existing user — expect a redirect (302) to pay.google.com:
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
  "http://localhost:3100/wallet/issue?phone=%2B7%20999%20444-55-66"

# Confirm a placeholder account was actually created:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const u = await User.findOne({ phone: '9994445566' });
console.log('created:', !!u, 'isPhoneOnlyAccount:', u?.isPhoneOnlyAccount, 'bonuses:', u?.bonuses);
await mongoose.disconnect();
process.exit(0);
"

# Decode the redirect JWT to confirm it encodes the right userId/balance
# (paste the userId printed above into <userId>):
node --input-type=module -e "
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
const res = await fetch('http://localhost:3100/wallet/issue?phone=%2B7%20999%20444-55-66', { redirect: 'manual' });
const location = res.headers.get('location');
const token = location.split('/save/')[1];
const decoded = jwt.decode(token);
console.log('accountId in payload:', decoded.payload.loyaltyObjects[0].accountId);
console.log('balance in payload:', decoded.payload.loyaltyObjects[0].loyaltyPoints.balance.string);
"

# Invalid phone — expect 400, not a crash:
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/wallet/issue?phone=abc"

# Cleanup:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ phone: '9994445566' });
await mongoose.disconnect();
process.exit(0);
"
```

Expected: first call `302 -> https://pay.google.com/gp/v/save/...`; account created with
`isPhoneOnlyAccount: true, bonuses: 0`; decoded JWT's `accountId` matches the created user's `_id`
and `balance.string` is `"0"`; invalid phone returns `400`.

- [ ] **Step 3: Commit**

```bash
git add src/app/wallet/issue/route.js
git commit -m "feat: add public phone-keyed Google Wallet card issuance route"
```

---

## Part B — crm-repair

### Task 3: `Company.bonusIntegration` gains `walletIssueUrl`

**Files:**
- Modify: `src/models/Company.ts`

**Interfaces:**
- Produces: `Company.bonusIntegration.walletIssueUrl?: string` — read by Task 4/5, written by
  Task 6's settings UI.

- [ ] **Step 1: Add the field to the interface**

```ts
  bonusIntegration?: {
    enabled?: boolean
    balanceUrl?: string
    redeemUrl?: string
    walletIssueUrl?: string
    apiKey?: string
  }
```

(No Mongoose schema change needed — `bonusIntegration` is already `Schema.Types.Mixed`.)

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "Company.ts"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/models/Company.ts
git commit -m "feat: add walletIssueUrl to Company.bonusIntegration"
```

---

### Task 4: Settings API route persists `walletIssueUrl`

**Files:**
- Modify: `src/app/api/settings/bonus-integration/route.ts`

**Interfaces:**
- Produces: `GET` includes `walletIssueUrl` in its response; `POST` accepts and saves it.

- [ ] **Step 1: Extend the schema and both handlers**

```ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongodb'
import { requireTenantRole, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

const SaveSchema = z.object({
  enabled: z.boolean(),
  balanceUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  redeemUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  walletIssueUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  apiKey: z.string().max(200).or(z.literal('')),
})

export async function GET() {
  const auth = await requireTenantRole(['owner', 'admin'])
  if (auth.error) return auth.error
  await connectToDatabase()

  const company = await Company.findById(auth.session!.user.companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; balanceUrl?: string; redeemUrl?: string; walletIssueUrl?: string; apiKey?: string } } | null

  const cfg = company?.bonusIntegration ?? {}
  return ok({
    enabled: cfg.enabled ?? false,
    balanceUrl: cfg.balanceUrl ?? '',
    redeemUrl: cfg.redeemUrl ?? '',
    walletIssueUrl: cfg.walletIssueUrl ?? '',
    hasApiKey: !!cfg.apiKey,
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireTenantRole(['owner', 'admin'])
  if (auth.error) return auth.error
  await connectToDatabase()

  try {
    const data = SaveSchema.parse(await req.json())

    const company = await Company.findById(auth.session!.user.companyId)
      .select('bonusIntegration')
      .lean() as { bonusIntegration?: { apiKey?: string } } | null

    const apiKey = data.apiKey || company?.bonusIntegration?.apiKey || ''

    await Company.findByIdAndUpdate(auth.session!.user.companyId, {
      $set: {
        bonusIntegration: {
          enabled: data.enabled,
          balanceUrl: data.balanceUrl || null,
          redeemUrl: data.redeemUrl || null,
          walletIssueUrl: data.walletIssueUrl || null,
          apiKey,
        },
      },
    })

    return ok({ saved: true })
  } catch (error) {
    if (error instanceof z.ZodError) return err(error.errors[0].message)
    return err('Ошибка сохранения', 500)
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "bonus-integration"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/bonus-integration/route.ts
git commit -m "feat: persist walletIssueUrl in bonus integration settings"
```

---

### Task 5: `/api/settings` derives `bonusWalletIssueUrl`

**Files:**
- Modify: `src/app/api/settings/route.ts`

**Interfaces:**
- Produces: `bonusWalletIssueUrl: string | undefined` in the `GET` response, alongside the
  existing `evotorQrEnabled`/`tbankEnabled` derived fields — consumed by Task 7's PrintModal.

The URL itself is not a secret (unlike `apiKey`, which stays server-side only) — safe to expose to
any staff role that can already print documents, same trust level as the existing `reviewUrl`.

- [ ] **Step 1: Add the derived field to both response branches**

```ts
  const cashierSettings = (company as Record<string, unknown>).cashierSettings as
    { evotorMobileCashier?: { enabled?: boolean }; tbank?: { enabled?: boolean } } | undefined
  const evotorQrEnabled = !!cashierSettings?.evotorMobileCashier?.enabled
  const tbankEnabled = !!cashierSettings?.tbank?.enabled

  const bonusIntegration = (company as Record<string, unknown>).bonusIntegration as
    { enabled?: boolean; walletIssueUrl?: string } | undefined
  const bonusWalletIssueUrl = bonusIntegration?.enabled ? bonusIntegration.walletIssueUrl : undefined

  const isPrivileged = auth.session!.user.role === 'owner' || auth.session!.user.role === 'admin'
  if (isPrivileged) return ok({ ...company, evotorQrEnabled, tbankEnabled, bonusWalletIssueUrl })
```

And the non-privileged branch's return statement:

```ts
  const safe = Object.fromEntries(
    PUBLIC_FIELDS.map(key => [key, (company as Record<string, unknown>)[key]])
  )
  return ok({ ...safe, evotorQrEnabled, tbankEnabled, bonusWalletIssueUrl })
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "settings/route"
```

Expected: no output (note: this must match `src/app/api/settings/route.ts` specifically, not
`settings/bonus-integration/route.ts` or `settings/webhook/route.ts` — grep the full relative path
if the short pattern matches more than one file).

- [ ] **Step 3: Verify manually**

With a company that has `bonusIntegration.enabled: true` and `walletIssueUrl` set (via Task 4's
route, or directly in Mongo for this check):

```bash
curl -s http://localhost:3200/api/settings --cookie "<staff session cookie>" | grep -o '"bonusWalletIssueUrl":"[^"]*"'
```

Expected: the configured URL appears. With `bonusIntegration.enabled: false` (or unset), confirm
the field is absent from the response entirely (not an empty string).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/settings/route.ts
git commit -m "feat: surface bonusWalletIssueUrl as a safe derived settings field"
```

---

### Task 6: Settings UI — "URL выдачи карты" field

**Files:**
- Modify: `src/app/(dashboard)/settings/api/page.tsx`

**Interfaces:**
- Consumes: extended `GET`/`POST /api/settings/bonus-integration` (Task 4).

- [ ] **Step 1: Add state alongside the existing `bonusBalanceUrl`/`bonusRedeemUrl`**

```tsx
  const [bonusWalletIssueUrl, setBonusWalletIssueUrl] = useState('')
```

- [ ] **Step 2: Load and save it alongside the existing two URLs**

In `loadBonus()`:

```tsx
        if (json.success && json.data) {
          setBonusEnabled(json.data.enabled)
          setBonusBalanceUrl(json.data.balanceUrl)
          setBonusRedeemUrl(json.data.redeemUrl)
          setBonusWalletIssueUrl(json.data.walletIssueUrl)
          setBonusHasApiKey(json.data.hasApiKey)
        }
```

In `saveBonus()`:

```tsx
        body: JSON.stringify({
          enabled: bonusEnabled,
          balanceUrl: bonusBalanceUrl,
          redeemUrl: bonusRedeemUrl,
          walletIssueUrl: bonusWalletIssueUrl,
          apiKey: bonusApiKey,
        }),
```

- [ ] **Step 3: Add the input field, right after the existing "URL списания" block**

```tsx
                  <div>
                    <label className="block text-sm font-medium mb-1">URL выдачи карты</label>
                    <input
                      type="url"
                      value={bonusWalletIssueUrl}
                      onChange={(e) => setBonusWalletIssueUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourdomain.ru/wallet/issue"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Необязательно. Если указан, на «Акте о работах» появится QR-код — клиент
                      сканирует и сразу получает карту лояльности, без регистрации на сайте.
                      Вызывается как <code className="bg-muted px-1 rounded font-mono">GET {'{url}'}?phone=...</code>
                    </p>
                  </div>
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "settings/api/page"
```

Expected: no output.

- [ ] **Step 5: Verify in a browser**

Load Settings → API и интеграции → «Бонусы клиентов», enter a URL in the new field, save, reload
the page, confirm it persisted.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/settings/api/page.tsx"
git commit -m "feat: add wallet card issuance URL field to bonus settings UI"
```

---

### Task 7: Act QR — issue the loyalty card from the printed act

**Files:**
- Modify: `src/components/print/PrintModal.tsx`

**Interfaces:**
- Consumes: `companyData.bonusWalletIssueUrl` (Task 5), `order.clientPhone` (existing).

- [ ] **Step 1: Add state for the new QR, mirroring `reviewQrDataUrl`**

Near the existing state declarations (around where `reviewQrDataUrl` is declared):

```tsx
  const [walletQrDataUrl, setWalletQrDataUrl] = useState('')
```

- [ ] **Step 2: Add the generation effect, right after the existing review-link QR effect**

```tsx
  // QR code — wallet card issuance link (generated when companyData/order arrive)
  useEffect(() => {
    const walletIssueUrl = (companyData as Record<string, unknown> | undefined)?.bonusWalletIssueUrl as string | undefined
    const clientPhone = (order as Record<string, unknown> | undefined)?.clientPhone as string | undefined
    if (!walletIssueUrl || !clientPhone) { setWalletQrDataUrl(''); return }
    const url = `${walletIssueUrl}?phone=${encodeURIComponent(clientPhone)}`
    QRCode.toDataURL(url, { width: 160, margin: 1 }).then(setWalletQrDataUrl)
  }, [companyData, order])
```

- [ ] **Step 3: Thread the new prop through `DocumentContent`'s signature**

```tsx
function DocumentContent({
  order, company, labelSettings, docTemplates, printType, qrDataUrl, reviewQrDataUrl, paymentQrDataUrl, walletQrDataUrl,
  evotorQrStatus, evotorQrError, onShowEvotorQr, tbankQrDataUrl, tbankQrStatus, suppressTearOff, suppressQr,
}: {
  order: Order; company: Order; labelSettings: Order; docTemplates: Order
  printType: string; qrDataUrl: string; reviewQrDataUrl: string; paymentQrDataUrl: string; walletQrDataUrl: string
  evotorQrStatus: 'idle' | 'loading' | 'sent' | 'paid' | 'error'; evotorQrError: string; onShowEvotorQr: () => void
  tbankQrDataUrl: string; tbankQrStatus: 'idle' | 'loading' | 'shown' | 'paid' | 'error'
  suppressTearOff?: boolean; suppressQr?: boolean
}) {
```

- [ ] **Step 4: Render the QR block in the `works-act` branch, right after the existing review-QR block**

```tsx
          {reviewQrDataUrl && (
            <div style={{ marginTop: 14, borderTop: '1px dashed #ccc', paddingTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Понравился сервис? Оставьте отзыв!</div>
              <img src={reviewQrDataUrl} style={{ width: 90, height: 90 }} alt="QR отзыв" />
              <div style={{ fontSize: 9, color: '#888', marginTop: 3 }}>Отсканируйте QR-код</div>
            </div>
          )}
          {walletQrDataUrl && (
            <div style={{ marginTop: 14, borderTop: '1px dashed #ccc', paddingTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Карта лояльности</div>
              <img src={walletQrDataUrl} style={{ width: 90, height: 90 }} alt="QR карта лояльности" />
              <div style={{ fontSize: 9, color: '#888', marginTop: 3 }}>Отсканируйте, чтобы добавить бонусную карту в Google Wallet</div>
            </div>
          )}
```

- [ ] **Step 5: Pass the new prop at all three `<DocumentContent>` call sites**

Each of the three call sites (`printType === 'act'` main copy, its tear-off duplicate, and the
generic `else` branch used by `works-act`) needs `walletQrDataUrl={walletQrDataUrl}` added next to
the existing `reviewQrDataUrl={reviewQrDataUrl}` line. Example for the `else` branch (the one
`works-act` actually renders through):

```tsx
            <DocumentContent
              order={order}
              company={companyData}
              labelSettings={labelSettings ?? {}}
              docTemplates={docTemplates ?? {}}
              printType={printType}
              qrDataUrl={qrDataUrl}
              reviewQrDataUrl={reviewQrDataUrl}
              paymentQrDataUrl={paymentQrDataUrl}
              walletQrDataUrl={walletQrDataUrl}
              evotorQrStatus={evotorQrStatus}
              evotorQrError={evotorQrError}
              onShowEvotorQr={handleShowEvotorQr}
```

Apply the same one-line addition (`walletQrDataUrl={walletQrDataUrl}` right after
`reviewQrDataUrl={reviewQrDataUrl}`) to the other two call sites (the `printType === 'act'` branch's
two `<DocumentContent>` instances) for consistency, even though `walletQrDataUrl` will only ever be
populated when viewing `works-act` — matches how `paymentQrDataUrl`/`tbankQrDataUrl` are already
threaded through uniformly today.

- [ ] **Step 6: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "PrintModal"
```

Expected: no output.

- [ ] **Step 7: Verify in a browser**

With a company that has `bonusIntegration.enabled: true` and `walletIssueUrl` configured (pointing
at a reachable servicebox-repair instance), open an order with a `clientPhone` set, click «Акт о
работах». Confirm a new "Карта лояльности" QR block appears below the review QR (or in its place
if no `reviewUrl` is configured), and that scanning it (or manually visiting the encoded URL) lands
on the Google Wallet save flow for that phone number. Confirm the block is absent entirely for a
company without `walletIssueUrl` configured, and for an order with no `clientPhone`.

- [ ] **Step 8: Commit**

```bash
git add src/components/print/PrintModal.tsx
git commit -m "feat: add loyalty card QR to the printed works act"
```

---

## Final verification (both repos)

- [ ] servicebox-repair: `npm run build` succeeds.
- [ ] crm-repair: `docker compose build app` succeeds (the real deploy path — local `npm run build`
  is known-broken from an unrelated pre-existing environment issue, see prior plans).
- [ ] End-to-end manual smoke test: configure a real tenant's wallet-issue URL, print a real
  order's act, scan the new QR with an actual phone, confirm the Google Wallet "Add" screen opens
  with the correct balance for that phone number.
