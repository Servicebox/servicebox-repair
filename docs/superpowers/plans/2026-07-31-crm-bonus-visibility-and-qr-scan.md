# CRM Bonus Visibility & QR-Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a bonus-balance badge on CRM's clients list (not only inside a single order), and
let CRM staff look up/redeem a client's bonus balance by scanning their Google Wallet loyalty
card's QR code (which already encodes the site's `User._id`) as an alternative to phone lookup.

**Architecture:** Two additive extensions to the already-shipped bonus integration. Site side:
the generic `balance`/`redeem` contract routes gain `phones` (batch) and `userId` lookup modes,
alongside the existing single-`phone` mode. CRM side: a new batch-proxy route feeds a badge on
the clients list, and the existing order-page `BonusWidget` gains a camera-based QR scanner
(`html5-qrcode`) whose decoded value becomes the lookup key for that widget's remaining lifetime.

**Tech Stack:** Same as the prior bonus-integration plan — servicebox-repair (Next.js App Router,
JS, Mongoose, no test framework), crm-repair (Next.js 14 App Router, React 18, TypeScript, Vitest
for pure-function unit tests only).

**Spec:** `docs/superpowers/specs/2026-07-31-crm-bonus-visibility-and-qr-scan-design.md`

## Global Constraints

- Every change is additive: existing single-`phone` balance/redeem behavior is byte-for-byte
  unchanged for any caller that doesn't send `phones` or `userId`.
- `userId` wins over `phone`/`phones` when both are somehow present (stronger identity signal —
  the client physically presented their card to be scanned).
- A malformed/garbage `userId` (bad ObjectId) must return `400` from the site's routes, never a
  500 — Mongoose's `CastError` on an invalid `findById`/`findOneAndUpdate` filter must be caught
  explicitly.
- No new environment variables needed — reuses the already-configured `CRM_BONUS_API_KEY` (site)
  and `Company.bonusIntegration` (CRM), both already live in production per the prior plan.
- servicebox-repair: no test framework — verify with `node --input-type=module` scripts and curl
  against the dev server, matching this repo's existing convention (see prior plan's Global
  Constraints for the full rationale).
- crm-repair: Vitest exists only for pure-function unit tests under `src/lib/__tests__/` — no
  API-route test convention exists in this repo. Verify new/changed routes manually via curl
  against the dev server with a forged session cookie, matching how the prior bonus-integration
  plan's crm-repair tasks were verified.
- Both repos are separate git repositories — commit to each independently.

---

## Part A — servicebox-repair

### Task 1: Batch (`phones`) and `userId` lookup modes for the balance route

**Files:**
- Modify: `src/app/api/crm/bonuses/balance/route.js`

**Interfaces:**
- Produces: `GET ?phones=p1,p2,p3` → `{ balances: { "<raw-input-phone>": number, ... } }`;
  `GET ?userId=<id>` → `{ balance: number }` (same shape as existing `?phone=` mode). Consumed by
  crm-repair's Task 3 (batch) and Task 6 (userId).

- [ ] **Step 1: Add the two new lookup modes, keeping the existing `phone` mode last (fallback)**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { phoneMatchRegex } from '@/lib/phone';

function validateApiKey(request) {
  const envKey = process.env.CRM_BONUS_API_KEY;
  if (!envKey) return false;

  const auth = request.headers.get('authorization') ?? '';
  const key = auth.replace('Bearer ', '').trim();
  if (!key) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(envKey));
  } catch {
    return false;
  }
}

export async function GET(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId');
  if (userId) {
    let user;
    try {
      user = await User.findById(userId).select('bonuses').lean();
    } catch (err) {
      if (err.name === 'CastError') {
        return NextResponse.json({ error: 'Неверный userId' }, { status: 400 });
      }
      throw err;
    }
    return NextResponse.json({ balance: user?.bonuses ?? 0 });
  }

  const phonesParam = searchParams.get('phones');
  if (phonesParam) {
    const phones = phonesParam.split(',').map(p => p.trim()).filter(Boolean).slice(0, 50);
    const balances = {};
    for (const phone of phones) {
      const matcher = phoneMatchRegex(phone);
      if (!matcher) {
        balances[phone] = 0;
        continue;
      }
      const user = await User.findOne({ phone: matcher }).select('bonuses').lean();
      balances[phone] = user?.bonuses ?? 0;
    }
    return NextResponse.json({ balances });
  }

  const phone = searchParams.get('phone');
  const matcher = phoneMatchRegex(phone);
  if (!matcher) {
    return NextResponse.json({ error: 'phone обязателен и должен быть валидным' }, { status: 400 });
  }

  const user = await User.findOne({ phone: matcher }).select('bonuses').lean();
  return NextResponse.json({ balance: user?.bonuses ?? 0 });
}
```

- [ ] **Step 2: Verify manually**

With the dev server running (`PORT=3100 npm run dev`) and `CRM_BONUS_API_KEY` set in
`.env.local`:

```bash
# Set up two test users with known balances and phones:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteMany({ email: { \$in: ['batch-test-1@example.com', 'batch-test-2@example.com'] } });
const u1 = await User.create({ username: 'A', email: 'batch-test-1@example.com', password: 'password1', phone: '9990001111', bonuses: 50 });
const u2 = await User.create({ username: 'B', email: 'batch-test-2@example.com', password: 'password1', phone: '9990002222', bonuses: 75 });
console.log('u1:', u1._id.toString());
console.log('u2:', u2._id.toString());
"

# Batch lookup — expect both balances, keyed by the exact strings sent:
curl -s "http://localhost:3100/api/crm/bonuses/balance?phones=9990001111,9990002222,9990009999" \
  -H "Authorization: Bearer dev-test-crm-api-key"
# expect: {"balances":{"9990001111":50,"9990002222":75,"9990009999":0}}

# userId lookup — use u1's real _id from above:
curl -s "http://localhost:3100/api/crm/bonuses/balance?userId=<u1 _id>" \
  -H "Authorization: Bearer dev-test-crm-api-key"
# expect: {"balance":50}

# Malformed userId — must be 400, not 500:
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/api/crm/bonuses/balance?userId=not-an-object-id" \
  -H "Authorization: Bearer dev-test-crm-api-key"
# expect: 400

# Existing single-phone mode — unchanged regression check:
curl -s "http://localhost:3100/api/crm/bonuses/balance?phone=9990001111" \
  -H "Authorization: Bearer dev-test-crm-api-key"
# expect: {"balance":50}

# Cleanup:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteMany({ email: { \$in: ['batch-test-1@example.com', 'batch-test-2@example.com'] } });
"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/crm/bonuses/balance/route.js
git commit -m "feat: add batch (phones) and userId lookup modes to bonus balance route"
```

---

### Task 2: `userId` redemption mode for the redeem route

**Files:**
- Modify: `src/app/api/crm/bonuses/redeem/route.js`

**Interfaces:**
- Produces: `POST { userId, points }` as an alternative to `{ phone, points }` — same response
  shape, same `409` on insufficient balance. Consumed by crm-repair's Task 7.

- [ ] **Step 1: Add the `userId` branch**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { phoneMatchRegex } from '@/lib/phone';

function validateApiKey(request) {
  const envKey = process.env.CRM_BONUS_API_KEY;
  if (!envKey) return false;

  const auth = request.headers.get('authorization') ?? '';
  const key = auth.replace('Bearer ', '').trim();
  if (!key) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(envKey));
  } catch {
    return false;
  }
}

const redeemSchema = z.object({
  phone: z.string().min(7).optional(),
  userId: z.string().optional(),
  points: z.number().positive(),
}).refine(data => data.phone || data.userId, { message: 'Укажите phone или userId' });

export async function POST(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = redeemSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  let updatedUser;
  if (body.userId) {
    try {
      updatedUser = await User.findOneAndUpdate(
        { _id: body.userId, bonuses: { $gte: body.points } },
        { $inc: { bonuses: -body.points } },
        { new: true, select: 'bonuses' }
      );
    } catch (err) {
      if (err.name === 'CastError') {
        return NextResponse.json({ error: 'Неверный userId' }, { status: 400 });
      }
      throw err;
    }
  } else {
    const matcher = phoneMatchRegex(body.phone);
    if (!matcher) {
      return NextResponse.json({ error: 'Неверный телефон' }, { status: 400 });
    }
    updatedUser = await User.findOneAndUpdate(
      { phone: matcher, bonuses: { $gte: body.points } },
      { $inc: { bonuses: -body.points } },
      { new: true, select: 'bonuses' }
    );
  }

  if (!updatedUser) {
    return NextResponse.json({ error: 'Недостаточно бонусов или клиент не найден' }, { status: 409 });
  }

  await BonusTransaction.create({
    userId: updatedUser._id,
    type: 'spend',
    points: -body.points,
    description: 'Списание бонусов в сервисном центре (CRM)',
  });

  return NextResponse.json({ ok: true, newBalance: updatedUser.bonuses });
}
```

- [ ] **Step 2: Verify manually**

```bash
# Test user (bonuses: 50, from Task 1's u1 — recreate if already cleaned up):
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ email: 'redeem-userid-test@example.com' });
const u = await User.create({ username: 'C', email: 'redeem-userid-test@example.com', password: 'password1', phone: '9990003333', bonuses: 100 });
console.log('id:', u._id.toString());
"

# Redeem by userId:
curl -s -X POST http://localhost:3100/api/crm/bonuses/redeem \
  -H "Authorization: Bearer dev-test-crm-api-key" -H "Content-Type: application/json" \
  -d '{"userId":"<the id above>","points":30}'
# expect: {"ok":true,"newBalance":70}

# Malformed userId — 400, not 500:
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3100/api/crm/bonuses/redeem \
  -H "Authorization: Bearer dev-test-crm-api-key" -H "Content-Type: application/json" \
  -d '{"userId":"garbage","points":10}'
# expect: 400

# Existing phone mode — unchanged regression check (use a phone with a known balance):
curl -s -X POST http://localhost:3100/api/crm/bonuses/redeem \
  -H "Authorization: Bearer dev-test-crm-api-key" -H "Content-Type: application/json" \
  -d '{"phone":"9990003333","points":10}'
# expect: {"ok":true,"newBalance":60}

# Cleanup:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ email: 'redeem-userid-test@example.com' });
"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/crm/bonuses/redeem/route.js
git commit -m "feat: add userId redemption mode to bonus redeem route"
```

---

## Part B — crm-repair

### Task 3: Batch bonus-balance proxy route for the clients list

**Files:**
- Create: `src/app/api/clients/bonus-balances/route.ts`

**Interfaces:**
- Consumes: `requireTenantAuth`, `ok`, `err` (existing `@/lib/api-helpers`), `Company` (existing).
- Produces: `GET ?phones=p1,p2,p3` → `{ balances: Record<string, number> }`, consumed by Task 4.

- [ ] **Step 1: Write the route**

```ts
import { NextRequest } from 'next/server'
import { requireTenantAuth, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

export async function GET(req: NextRequest) {
  const auth = await requireTenantAuth()
  if (auth.error) return auth.error
  const { session } = auth

  const company = await Company.findById(session!.user.companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; balanceUrl?: string; apiKey?: string } } | null

  const cfg = company?.bonusIntegration
  if (!cfg?.enabled || !cfg.balanceUrl) {
    return err('Интеграция бонусов не настроена', 400)
  }

  const phonesParam = req.nextUrl.searchParams.get('phones')
  if (!phonesParam) {
    return err('phones обязателен', 400)
  }

  const phones = phonesParam.split(',').map(p => p.trim()).filter(Boolean).slice(0, 50)
  if (phones.length === 0) {
    return ok({ balances: {} })
  }

  try {
    const res = await fetch(`${cfg.balanceUrl}?phones=${encodeURIComponent(phones.join(','))}`, {
      headers: { Authorization: `Bearer ${cfg.apiKey ?? ''}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return err('Сервис бонусов недоступен', 502)
    const data = await res.json() as { balances: Record<string, number> }
    return ok({ balances: data.balances })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 2: Verify manually**

Prerequisites: a test company with `bonusIntegration` enabled and pointed at a reachable
servicebox-repair instance (same setup pattern as the prior plan's Task 17 verification — forge a
session JWT for a company owner, temporarily set `bonusIntegration` via
`POST /api/settings/bonus-integration`, restore afterward).

```bash
# (with bonusIntegration enabled, balanceUrl=http://localhost:3100/api/crm/bonuses/balance,
#  apiKey=dev-test-crm-api-key, and site-side test users from Task 1 recreated)
curl -s "http://localhost:3200/api/clients/bonus-balances?phones=9990001111,9990002222" \
  --cookie "__Secure-authjs.session-token=<forged token>"
# expect: {"success":true,"data":{"balances":{"9990001111":50,"9990002222":75}}}

# With bonusIntegration disabled (or unset) — expect graceful 400:
curl -s http://localhost:3200/api/clients/bonus-balances?phones=9990001111 \
  --cookie "__Secure-authjs.session-token=<forged token>"
# expect: 400 "Интеграция бонусов не настроена"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/clients/bonus-balances/route.ts
git commit -m "feat: add batch bonus-balance proxy route for clients list"
```

---

### Task 4: Clients list — bonus badge

**Files:**
- Modify: `src/app/(dashboard)/clients/page.tsx`

**Interfaces:**
- Consumes: `GET /api/clients/bonus-balances` (Task 3).

The clients list has no pagination UI today (always renders whatever `/api/clients` returns for
the default `page=1, limit=50` — confirmed by reading `src/app/api/clients/route.ts`), so a single
batch call per page load is naturally already within the 50-phone cap without any extra work.

- [ ] **Step 1: Add the batch-balance query and badge**

Add to the imports:

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'
```

(already imported — no change needed there; just adding a second `useQuery` call below the
existing one.)

Right after the existing `clients` query, add:

```tsx
  const clients: Client[] = data?.clients ?? []
  const phones = clients.map(c => c.phone).filter((p): p is string => !!p)

  const { data: bonusData } = useQuery({
    queryKey: ['clients-bonus-balances', phones.join(',')],
    queryFn: async () => {
      const res = await fetch(`/api/clients/bonus-balances?phones=${encodeURIComponent(phones.join(','))}`)
      if (!res.ok) return { balances: {} as Record<string, number> }
      const json = await res.json()
      return json.success ? json.data : { balances: {} as Record<string, number> }
    },
    enabled: phones.length > 0,
  })

  const balances: Record<string, number> = bonusData?.balances ?? {}
```

(Remove the pre-existing `const clients: Client[] = data?.clients ?? []` line further down in the
file — it moves up to here so `phones`/the new query can reference it. Everything else in the
render stays the same.)

- [ ] **Step 2: Render the badge**

In the card JSX, right after the existing `discount` badge block:

```tsx
                    {client.discount > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                        -{client.discount}%
                      </span>
                    )}
                    {client.phone && balances[client.phone] > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                        🎁 {balances[client.phone]}
                      </span>
                    )}
```

- [ ] **Step 3: Verify in a browser**

With `bonusIntegration` enabled for the logged-in company (via Settings → API →
«Бонусы клиентов», as configured in the prior plan) and at least one client's phone matching a
site user with a nonzero balance: load `/clients`, confirm the 🎁 badge appears next to that
client's card with the correct number. Confirm no badge and no error appears for clients with a
zero/unmatched balance, and that the page still loads normally with `bonusIntegration` disabled.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/clients/page.tsx"
git commit -m "feat: show bonus balance badge on clients list"
```

---

### Task 5: Add `html5-qrcode` dependency

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm install`, not hand-edited)

- [ ] **Step 1: Install**

```bash
cd /Users/tom/Desktop/crm-repair
npm install html5-qrcode
```

- [ ] **Step 2: Verify**

```bash
grep '"html5-qrcode"' package.json
```

Expected: a version line present.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add html5-qrcode for loyalty-card scanning"
```

---

### Task 6: Staff `bonus-balance` route accepts a scanned `userId`

**Files:**
- Modify: `src/app/api/orders/[id]/bonus-balance/route.ts`

**Interfaces:**
- Consumes: extended site route from Task 1.
- Produces: `GET ?userId=<id>` overrides the order's `clientPhone` for this lookup only.

- [ ] **Step 1: Add the `userId` branch**

```ts
import { NextRequest } from 'next/server'
import { requireTenantAuth, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTenantAuth()
  if (auth.error) return auth.error
  const { session, models: { Order } } = auth

  const company = await Company.findById(session!.user.companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; balanceUrl?: string; apiKey?: string } } | null

  const cfg = company?.bonusIntegration
  if (!cfg?.enabled || !cfg.balanceUrl) {
    return err('Интеграция бонусов не настроена', 400)
  }

  const scannedUserId = req.nextUrl.searchParams.get('userId')

  let lookupQuery: string
  if (scannedUserId) {
    lookupQuery = `userId=${encodeURIComponent(scannedUserId)}`
  } else {
    const order = await Order.findById(params.id).select('clientPhone').lean() as { clientPhone?: string } | null
    if (!order) {
      return err('Заказ не найден', 404)
    }
    if (!order.clientPhone) {
      return err('У заказа не указан телефон клиента', 400)
    }
    lookupQuery = `phone=${encodeURIComponent(order.clientPhone)}`
  }

  try {
    const res = await fetch(`${cfg.balanceUrl}?${lookupQuery}`, {
      headers: { Authorization: `Bearer ${cfg.apiKey ?? ''}` },
      signal: AbortSignal.timeout(8000),
    })
    if (res.status === 400) return err('Карта не распознана', 400)
    if (!res.ok) return err('Сервис бонусов недоступен', 502)
    const data = await res.json() as { balance: number }
    return ok({ balance: data.balance })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 2: Verify manually**

Using the same test order/company setup pattern as the prior plan's Task 17:

```bash
# By phone (existing behavior, regression check):
curl -s http://localhost:3200/api/orders/<order-id>/bonus-balance --cookie "<staff session cookie>"
# expect: {"success":true,"data":{"balance":<n>}}

# By scanned userId (use a real site User._id with a known balance):
curl -s "http://localhost:3200/api/orders/<order-id>/bonus-balance?userId=<site user id>" --cookie "<staff session cookie>"
# expect: {"success":true,"data":{"balance":<that user's balance>}}

# Garbage userId — expect the site's 400 to surface as "Карта не распознана":
curl -s "http://localhost:3200/api/orders/<order-id>/bonus-balance?userId=not-a-real-id" --cookie "<staff session cookie>"
# expect: 400 "Карта не распознана"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/orders/[id]/bonus-balance/route.ts"
git commit -m "feat: accept scanned userId in staff bonus-balance route"
```

---

### Task 7: Staff `bonus-redeem` route accepts a scanned `userId`

**Files:**
- Modify: `src/app/api/orders/[id]/bonus-redeem/route.ts`

**Interfaces:**
- Consumes: extended site route from Task 2.
- Produces: `POST { points, userId? }` — `userId` overrides `order.clientPhone` for this redeem.

- [ ] **Step 1: Add the `userId` branch**

```ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireTenantAuth, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

const RedeemSchema = z.object({
  points: z.number().positive(),
  userId: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTenantAuth()
  if (auth.error) return auth.error
  const { session, models: { Order } } = auth

  const company = await Company.findById(session!.user.companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; redeemUrl?: string; apiKey?: string } } | null

  const cfg = company?.bonusIntegration
  if (!cfg?.enabled || !cfg.redeemUrl) {
    return err('Интеграция бонусов не настроена', 400)
  }

  let body: { points: number; userId?: string }
  try {
    body = RedeemSchema.parse(await req.json())
  } catch (e) {
    if (e instanceof z.ZodError) return err(e.errors[0].message)
    return err('Неверные данные')
  }

  const order = await Order.findById(params.id).select('clientPhone finalCost discount') as {
    clientPhone?: string
    finalCost: number
    discount: number
    save: () => Promise<unknown>
  } | null
  if (!order) {
    return err('Заказ не найден', 404)
  }
  if (!body.userId && !order.clientPhone) {
    return err('У заказа не указан телефон клиента', 400)
  }

  const cap = Math.floor((order.finalCost ?? 0) * 0.5)
  if (body.points > cap) {
    return err(`Максимум к списанию: ${cap}`, 400)
  }

  const redeemBody = body.userId
    ? { userId: body.userId, points: body.points }
    : { phone: order.clientPhone, points: body.points }

  try {
    const res = await fetch(cfg.redeemUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey ?? ''}`,
      },
      body: JSON.stringify(redeemBody),
      signal: AbortSignal.timeout(8000),
    })

    if (res.status === 400) return err('Карта не распознана', 400)
    if (res.status === 409) return err('Недостаточно бонусов у клиента', 409)
    if (!res.ok) return err('Сервис бонусов отклонил списание', 502)

    const data = await res.json() as { newBalance: number }

    order.discount = (order.discount ?? 0) + body.points
    await order.save()

    return ok({ newBalance: data.newBalance, discountApplied: order.discount })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 2: Verify manually**

```bash
# By userId — expect success, discount applied to the order:
curl -s -X POST http://localhost:3200/api/orders/<order-id>/bonus-redeem --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"userId":"<site user id>","points":20}'
# expect: {"success":true,"data":{"newBalance":<n-20>,"discountApplied":20}}

# By phone — regression check, still works as before:
curl -s -X POST http://localhost:3200/api/orders/<order-id>/bonus-redeem --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"points":10}'
# expect: {"success":true,"data":{"newBalance":<n-30>,"discountApplied":30}}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/orders/[id]/bonus-redeem/route.ts"
git commit -m "feat: accept scanned userId in staff bonus-redeem route"
```

---

### Task 8: `BonusWidget` — QR scan button and camera modal

**Files:**
- Modify: `src/components/orders/BonusWidget.tsx`

**Interfaces:**
- Consumes: `html5-qrcode` (Task 5), extended `bonus-balance`/`bonus-redeem` routes (Tasks 6, 7).

- [ ] **Step 1: Rewrite the component**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { Gift, Loader2, Camera, X } from 'lucide-react'

interface BonusWidgetProps {
  orderId: string
  finalCost: number
  onRedeemed?: (discountApplied: number) => void
}

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i

export default function BonusWidget({ orderId, finalCost, onRedeemed }: BonusWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [redeeming, setRedeeming] = useState(false)
  const [scannedUserId, setScannedUserId] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const qs = scannedUserId ? `?userId=${encodeURIComponent(scannedUserId)}` : ''
        const res = await fetch(`/api/orders/${orderId}/bonus-balance${qs}`)
        const json = await res.json() as { success: boolean; data?: { balance: number }; error?: string }
        if (cancelled) return
        if (json.success && json.data) {
          setBalance(json.data.balance)
          setError(null)
        } else {
          setError(json.error ?? 'Интеграция бонусов не настроена')
        }
      } catch {
        if (!cancelled) setError('Не удалось загрузить баланс')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [orderId, scannedUserId])

  useEffect(() => {
    if (!scanning) return
    let cancelledEffect = false

    async function run() {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (cancelledEffect) return
      const scanner = new Html5Qrcode('bonus-qr-reader')
      scannerRef.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText: string) => {
            if (OBJECT_ID_PATTERN.test(decodedText)) {
              setScannedUserId(decodedText)
              setScanning(false)
            } else {
              setScanError('Карта не распознана')
            }
          },
          () => { /* per-frame decode miss while searching — expected, ignore */ }
        )
      } catch {
        if (!cancelledEffect) {
          setScanError('Нет доступа к камере')
          setScanning(false)
        }
      }
    }
    void run()

    return () => {
      cancelledEffect = true
      scannerRef.current?.stop().catch(() => undefined)
      scannerRef.current = null
    }
  }, [scanning])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Загрузка бонусов клиента…
      </div>
    )
  }

  // Молча не показываем, если интеграция не настроена/выключена для этой
  // компании или у заказа нет телефона клиента — не стоит показывать ошибку
  // персоналу на каждом заказе.
  if (error || balance === null) return null

  const cap = Math.min(balance, Math.floor((finalCost ?? 0) * 0.5))

  async function handleRedeem() {
    setRedeeming(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/bonus-redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scannedUserId ? { points, userId: scannedUserId } : { points }),
      })
      const json = await res.json() as { success: boolean; data?: { newBalance: number; discountApplied: number }; error?: string }
      if (json.success && json.data) {
        setBalance(json.data.newBalance)
        setPoints(0)
        onRedeemed?.(json.data.discountApplied)
      } else {
        alert(json.error ?? 'Не удалось списать бонусы')
      }
    } catch {
      alert('Ошибка сети при списании бонусов')
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="border rounded-xl p-4 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Gift className="w-4 h-4 text-purple-500" /> Бонусы клиента: {balance}
          {scannedUserId && (
            <span className="text-xs text-muted-foreground font-normal">(по QR-коду)</span>
          )}
        </div>
        <button
          onClick={() => { setScanError(null); setScanning(true) }}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Camera className="w-3.5 h-3.5" /> Сканировать карту
        </button>
      </div>

      {scannedUserId && (
        <button
          onClick={() => setScannedUserId(null)}
          className="text-xs text-muted-foreground hover:underline"
        >
          Вернуться к поиску по телефону заказа
        </button>
      )}

      {cap > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={cap}
            value={points}
            onChange={(e) => setPoints(Math.max(0, Math.min(cap, Number(e.target.value) || 0)))}
            className="w-24 px-2 py-1.5 border rounded-lg text-sm bg-background"
          />
          <span className="text-xs text-muted-foreground">макс. {cap} (50% от суммы)</span>
          <button
            onClick={() => void handleRedeem()}
            disabled={redeeming || points <= 0}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
          >
            {redeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Списать
          </button>
        </div>
      )}

      {scanning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Сканирование карты</h3>
              <button onClick={() => setScanning(false)} className="p-1.5 hover:bg-accent rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div id="bonus-qr-reader" className="w-full" />
            {scanError && <p className="text-xs text-red-600 mt-2">{scanError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "BonusWidget"
```

Expected: no output (the pre-existing duplicate-`@types` noise from other packages is unrelated
and already known — see the prior plan's Global Constraints note on this).

- [ ] **Step 3: Verify in a browser**

Open an order page (with `bonusIntegration` enabled) on a device/browser with a camera, over
HTTPS (or `localhost`, which browsers treat as a secure context for `getUserMedia` even without
TLS). Click «Сканировать карту», grant camera permission, point it at a real Google Wallet loyalty
card QR (or any QR encoding a real site `User._id` string) — confirm the modal closes, the balance
updates to that user's real balance, and «(по QR-коду)» appears next to it. Confirm «Вернуться к
поиску по телефону заказа» switches back to the phone-based balance. Confirm scanning a QR with
non-ObjectId content shows «Карта не распознана» inside the modal without crashing the widget.
Deny camera permission once and confirm «Нет доступа к камере» appears and the phone-based balance
display keeps working normally.

- [ ] **Step 4: Commit**

```bash
git add src/components/orders/BonusWidget.tsx
git commit -m "feat: add QR-code loyalty-card scanning to the bonus widget"
```

---

## Final verification (both repos)

- [ ] servicebox-repair: `npm run build` succeeds.
- [ ] crm-repair: `npm run build` succeeds (via `docker compose build app` if verifying against
  the real prod deployment path, per this project's established Docker-based deploy process).
- [ ] End-to-end manual smoke test: on the clients list, confirm a real client with bonus balance
  shows the 🎁 badge; on that client's most recent order, scan their real loyalty-card QR and
  confirm the widget correctly resolves and can redeem their balance by scanned ID.
