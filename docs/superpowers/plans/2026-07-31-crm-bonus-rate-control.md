# CRM-Controlled Cashback Rate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the site-wide cashback percentage from a fixed `BONUS_RATE_PCT` env var to a
DB-backed value editable from CRM's settings UI, with the env var kept as a fallback default.

**Architecture:** A new single-document `BonusConfig` model on the site, read fresh on every
bonus-award call (no caching, no restart needed to take effect). A new protected site route lets
CRM read/write it via the same bearer-key pattern already used for balance/redeem. CRM gets one
more optional per-tenant URL field plus a numeric rate control in the same settings tab.

**Tech Stack:** servicebox-repair (Next.js App Router, JS, Mongoose, no test framework),
crm-repair (Next.js 14, TypeScript, Vitest for pure-function tests only).

**Spec:** `docs/superpowers/specs/2026-07-31-crm-bonus-rate-control-design.md`

**Depends on:** `docs/superpowers/plans/2026-07-31-wallet-card-issue-and-act-qr.md` should be
implemented first — this plan's Task 5 edits the same settings-page state block that plan's
Task 6 introduces (`bonusWalletIssueUrl` and friends), and assumes those hooks already exist.
If implementing this plan first for some reason, Task 5's diff context (which exact lines precede
the new state) will need adjusting by hand — the added code itself doesn't otherwise depend on it.

## Global Constraints

- The env var `BONUS_RATE_PCT` stays as the fallback default — never removed, never required to
  be set for existing behavior to keep working.
- A rate change takes effect on the next bonus-award call, site-wide, immediately — no caching
  layer to invalidate, no restart.
- No existing route, field, or behavior is renamed or removed.
- servicebox-repair: no test framework — verify with `node --input-type=module` scripts and curl.
- crm-repair: verify manually via curl with a forged session cookie (no API-route test convention
  in this repo).
- Both repos are separate git repositories — commit to each independently.

---

## Part A — servicebox-repair

### Task 1: `BonusConfig` model

**Files:**
- Create: `src/models/BonusConfig.js`

**Interfaces:**
- Produces: a collection expected to hold at most one document, `{ ratePct: Number }` — read/
  written by Task 2.

- [ ] **Step 1: Write the model**

```js
import mongoose from 'mongoose';

const BonusConfigSchema = new mongoose.Schema({
  ratePct: {
    type: Number,
    required: true,
    min: [0, 'Процент не может быть отрицательным'],
    max: [100, 'Процент не может превышать 100']
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

export default mongoose.models.BonusConfig || mongoose.model('BonusConfig', BonusConfigSchema);
```

- [ ] **Step 2: Verify manually**

```bash
node --input-type=module -e "
import BonusConfig from './src/models/BonusConfig.js';
const doc = new BonusConfig({ ratePct: 5 });
await doc.validate();
console.log('ok:', doc.ratePct);
try {
  const bad = new BonusConfig({ ratePct: 150 });
  await bad.validate();
  console.log('BUG: should have thrown');
} catch {
  console.log('correctly rejected out-of-range value');
}
"
```

Expected: `ok: 5` then `correctly rejected out-of-range value`.

- [ ] **Step 3: Commit**

```bash
git add src/models/BonusConfig.js
git commit -m "feat: add BonusConfig model for DB-backed cashback rate"
```

---

### Task 2: `getBonusRatePct()` and rewire both award functions

**Files:**
- Modify: `src/lib/bonuses.js`

**Interfaces:**
- Produces: `getBonusRatePct(): Promise<number>` — used internally by `awardOrderBonuses` and
  `awardCrmRepairBonus`, and by Task 3's new route.

Note: this task assumes Task 1 of the prior wallet-card-issue plan (`findOrCreateUserByPhone`
extraction) is already applied — the diff below is written against that already-refactored file.

- [ ] **Step 1: Add the lookup function and rewire both award functions to use it**

```js
import mongoose from 'mongoose';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import BonusConfig from '@/models/BonusConfig';
import { phoneMatchRegex, normalizePhoneDigits } from '@/lib/phone';

/**
 * Текущая ставка кэшбэка в процентах. Читается из БД (BonusConfig) на каждый
 * вызов — без кэша, чтобы изменение через CRM применялось сразу, без
 * рестарта сервера. Переменная окружения BONUS_RATE_PCT остаётся запасным
 * значением на случай, если ставку ещё ни разу не сохраняли через новый
 * маршрут — см. дизайн-спеку 2026-07-31-crm-bonus-rate-control-design.md.
 */
export async function getBonusRatePct() {
  const config = await BonusConfig.findOne().lean();
  if (config) return config.ratePct;
  return parseFloat(process.env.BONUS_RATE_PCT ?? '3');
}

/**
 * Атомарно начисляет бонусы пользователю за завершённый заказ.
 * Использует Mongoose session для транзакции.
 * Возвращает { awarded, points } или бросает ошибку.
 */
export async function awardOrderBonuses({ userId, orderId, totalAmount, session }) {
  const ratePct = await getBonusRatePct();
  const points = Math.max(1, Math.floor(totalAmount * (ratePct / 100)));

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
      description: `Кэшбэк ${ratePct}% за заказ`,
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

  const ratePct = await getBonusRatePct();
  const points = Math.max(1, Math.floor(finalCost * (ratePct / 100)));

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
      description: `Кэшбэк ${ratePct}% за ремонт (заказ CRM ${crmOrderNumber})`,
    }],
    { session }
  );

  return { awarded: true, points, userId: user._id.toString() };
}
```

- [ ] **Step 2: Verify manually — fallback behavior (no BonusConfig document yet)**

```bash
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import BonusConfig from './src/models/BonusConfig.js';
import { getBonusRatePct } from './src/lib/bonuses.js';
await mongoose.connect(process.env.MONGODB_URI);
await BonusConfig.deleteMany({});
const rate = await getBonusRatePct();
console.log('fallback rate (expect env var or 3):', rate);
await mongoose.disconnect();
process.exit(0);
"
```

Expected: matches whatever `BONUS_RATE_PCT` is set to in `.env.local` (or `3` if unset).

- [ ] **Step 3: Verify manually — DB value takes priority once set**

```bash
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import BonusConfig from './src/models/BonusConfig.js';
import { getBonusRatePct, awardCrmRepairBonus } from './src/lib/bonuses.js';
import User from './src/models/User.js';
import BonusTransaction from './src/models/BonusTransaction.js';
await mongoose.connect(process.env.MONGODB_URI);
await BonusConfig.deleteMany({});
await BonusConfig.create({ ratePct: 10 });
console.log('rate after setting 10:', await getBonusRatePct());

await User.deleteOne({ email: 'rate-test@example.com' });
const session = await mongoose.startSession();
session.startTransaction();
const result = await awardCrmRepairBonus({ phone: '+7 999 888-77-66', finalCost: 1000, crmOrderNumber: 'RATE-TEST-1', session });
await session.commitTransaction();
session.endSession();
console.log('points at 10% of 1000 (expect 100):', result.points);

const tx = await BonusTransaction.findOne({ userId: result.userId, crmOrderNumber: 'RATE-TEST-1' });
console.log('description mentions 10%:', tx.description);

await User.deleteOne({ _id: result.userId });
await BonusConfig.deleteMany({});
await mongoose.disconnect();
process.exit(0);
"
```

Expected: `rate after setting 10: 10`, `points at 10% of 1000 (expect 100): 100`, description
contains `10%`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/bonuses.js
git commit -m "feat: read cashback rate from BonusConfig, env var as fallback"
```

---

### Task 3: Protected rate route

**Files:**
- Create: `src/app/api/crm/bonuses/rate/route.js`

**Interfaces:**
- Consumes: `getBonusRatePct` (Task 2), `BonusConfig` (Task 1).
- Produces: `GET` → `{ ratePct }`; `POST { ratePct }` → `{ ratePct }` (validated, saved).

- [ ] **Step 1: Write the route**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import BonusConfig from '@/models/BonusConfig';
import { getBonusRatePct } from '@/lib/bonuses';

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
  const ratePct = await getBonusRatePct();
  return NextResponse.json({ ratePct });
}

const rateSchema = z.object({
  ratePct: z.number().min(0).max(100),
});

export async function POST(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  let body;
  try {
    body = rateSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  await BonusConfig.findOneAndUpdate(
    {},
    { ratePct: body.ratePct },
    { upsert: true }
  );

  return NextResponse.json({ ratePct: body.ratePct });
}
```

- [ ] **Step 2: Verify manually**

```bash
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import BonusConfig from './src/models/BonusConfig.js';
await mongoose.connect(process.env.MONGODB_URI);
await BonusConfig.deleteMany({});
await mongoose.disconnect();
process.exit(0);
"

echo "--- GET before any config (expect env-var fallback) ---"
curl -s http://localhost:3100/api/crm/bonuses/rate -H "Authorization: Bearer dev-test-crm-api-key"

echo -e "\n--- POST a new rate ---"
curl -s -X POST http://localhost:3100/api/crm/bonuses/rate \
  -H "Authorization: Bearer dev-test-crm-api-key" -H "Content-Type: application/json" \
  -d '{"ratePct":7}'

echo -e "\n--- GET again — must reflect the new value ---"
curl -s http://localhost:3100/api/crm/bonuses/rate -H "Authorization: Bearer dev-test-crm-api-key"

echo -e "\n--- out-of-range rejected ---"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3100/api/crm/bonuses/rate \
  -H "Authorization: Bearer dev-test-crm-api-key" -H "Content-Type: application/json" \
  -d '{"ratePct":150}'

echo -e "\n--- wrong key rejected ---"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/crm/bonuses/rate -H "Authorization: Bearer wrong-key"
```

Expected: first GET returns the env-var fallback (e.g. `{"ratePct":3}`); POST returns
`{"ratePct":7}`; second GET returns `{"ratePct":7}`; out-of-range → `400`; wrong key → `401`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/crm/bonuses/rate/route.js
git commit -m "feat: add protected rate get/set route for CRM"
```

---

## Part B — crm-repair

### Task 4: `Company.bonusIntegration` gains `rateUrl`

**Files:**
- Modify: `src/models/Company.ts`

**Interfaces:**
- Produces: `Company.bonusIntegration.rateUrl?: string` — read/written by Tasks 5-6.

- [ ] **Step 1: Add the field**

```ts
  bonusIntegration?: {
    enabled?: boolean
    balanceUrl?: string
    redeemUrl?: string
    walletIssueUrl?: string
    rateUrl?: string
    apiKey?: string
  }
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "Company.ts"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/models/Company.ts
git commit -m "feat: add rateUrl to Company.bonusIntegration"
```

---

### Task 5: Extend the bonus-integration settings route

**Files:**
- Modify: `src/app/api/settings/bonus-integration/route.ts`

**Interfaces:**
- Produces: `GET` includes `rateUrl`; `POST` accepts and saves it.

- [ ] **Step 1: Extend the schema and both handlers**

```ts
const SaveSchema = z.object({
  enabled: z.boolean(),
  balanceUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  redeemUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  walletIssueUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  rateUrl: z.string().url('Введите корректный URL').max(500).or(z.literal('')),
  apiKey: z.string().max(200).or(z.literal('')),
})
```

In `GET`'s response object and the `bonusIntegration` write inside `POST`, add
`rateUrl: cfg.rateUrl ?? ''` / `rateUrl: data.rateUrl || null` respectively, following the exact
same pattern already used for `walletIssueUrl` there.

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "bonus-integration"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/bonus-integration/route.ts
git commit -m "feat: persist rateUrl in bonus integration settings"
```

---

### Task 6: Settings UI — rate control

**Files:**
- Modify: `src/app/(dashboard)/settings/api/page.tsx`

**Interfaces:**
- Consumes: extended `GET`/`POST /api/settings/bonus-integration` (Task 5),
  `GET`/`POST /api/settings/bonus-rate` (Task 7).

- [ ] **Step 1: Add state**

```tsx
  const [bonusRateUrl, setBonusRateUrl] = useState('')
  const [currentRatePct, setCurrentRatePct] = useState<number | null>(null)
  const [rateInput, setRateInput] = useState('')
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSaved, setRateSaved] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)
```

- [ ] **Step 2: Load `rateUrl` alongside the other bonus-integration fields**

In `loadBonus()`, add `setBonusRateUrl(json.data.rateUrl)` next to the existing
`setBonusWalletIssueUrl(...)` line.

- [ ] **Step 3: Save `rateUrl` alongside the other fields**

In `saveBonus()`'s request body, add `rateUrl: bonusRateUrl` next to `walletIssueUrl: bonusWalletIssueUrl`.

- [ ] **Step 4: Load the current rate once `rateUrl` is known**

```tsx
  useEffect(() => {
    if (!bonusRateUrl) { setCurrentRatePct(null); return }
    let cancelled = false
    async function loadRate() {
      try {
        const res = await fetch('/api/settings/bonus-rate')
        const json = await res.json() as { success: boolean; data?: { ratePct: number }; error?: string }
        if (cancelled) return
        if (json.success && json.data) {
          setCurrentRatePct(json.data.ratePct)
          setRateInput(String(json.data.ratePct))
        }
      } catch { /* ignore */ }
    }
    void loadRate()
    return () => { cancelled = true }
  }, [bonusRateUrl])

  async function saveRate() {
    setRateSaving(true)
    setRateError(null)
    try {
      const parsed = Number(rateInput)
      const res = await fetch('/api/settings/bonus-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratePct: parsed }),
      })
      const json = await res.json() as { success: boolean; data?: { ratePct: number }; error?: string }
      if (json.success && json.data) {
        setCurrentRatePct(json.data.ratePct)
        setRateSaved(true)
        setTimeout(() => setRateSaved(false), 2500)
      } else {
        setRateError(json.error ?? 'Не удалось сохранить')
      }
    } catch {
      setRateError('Ошибка сети')
    } finally {
      setRateSaving(false)
    }
  }
```

- [ ] **Step 5: Add the input field, right after the "URL выдачи карты" block**

```tsx
                  <div>
                    <label className="block text-sm font-medium mb-1">URL ставки кэшбэка</label>
                    <input
                      type="url"
                      value={bonusRateUrl}
                      onChange={(e) => setBonusRateUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourdomain.ru/api/crm/bonuses/rate"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Необязательно. Если указан, ниже появится возможность менять процент кэшбэка
                      без обращения к разработчику.
                    </p>
                  </div>

                  {bonusRateUrl && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Процент кэшбэка{currentRatePct !== null && ` (сейчас: ${currentRatePct}%)`}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          className="w-24 px-3 py-2 border rounded-lg text-sm bg-background"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <button
                          onClick={() => void saveRate()}
                          disabled={rateSaving}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
                        >
                          {rateSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {rateSaved ? 'Сохранено' : 'Сохранить процент'}
                        </button>
                      </div>
                      {rateError && <p className="text-xs text-red-600 mt-1">{rateError}</p>}
                    </div>
                  )}
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "settings/api/page"
```

Expected: no output.

- [ ] **Step 7: Verify in a browser**

Enter a `rateUrl`, save, confirm the "Процент кэшбэка" control appears and shows the current value
(env-var fallback initially). Change it, save, reload the page, confirm the new value persisted
and displays correctly.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(dashboard)/settings/api/page.tsx"
git commit -m "feat: add cashback rate control to bonus settings UI"
```

---

### Task 7: CRM proxy route for the rate

**Files:**
- Create: `src/app/api/settings/bonus-rate/route.ts`

**Interfaces:**
- Consumes: `requireTenantRole`, `ok`, `err` (existing), `Company.bonusIntegration` (Task 4).
- Produces: `GET`/`POST` proxied to the site's rate route (Task 3), consumed by Task 6.

- [ ] **Step 1: Write the route**

```ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireTenantRole, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

async function getBonusIntegrationConfig(companyId: string) {
  const company = await Company.findById(companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; rateUrl?: string; apiKey?: string } } | null
  return company?.bonusIntegration
}

export async function GET() {
  const auth = await requireTenantRole(['owner', 'admin'])
  if (auth.error) return auth.error

  const cfg = await getBonusIntegrationConfig(auth.session!.user.companyId as string)
  if (!cfg?.enabled || !cfg.rateUrl) {
    return err('URL ставки кэшбэка не настроен', 400)
  }

  try {
    const res = await fetch(cfg.rateUrl, {
      headers: { Authorization: `Bearer ${cfg.apiKey ?? ''}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return err('Сервис бонусов недоступен', 502)
    const data = await res.json() as { ratePct: number }
    return ok({ ratePct: data.ratePct })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}

const RateSchema = z.object({
  ratePct: z.number().min(0).max(100),
})

export async function POST(req: NextRequest) {
  const auth = await requireTenantRole(['owner', 'admin'])
  if (auth.error) return auth.error

  const cfg = await getBonusIntegrationConfig(auth.session!.user.companyId as string)
  if (!cfg?.enabled || !cfg.rateUrl) {
    return err('URL ставки кэшбэка не настроен', 400)
  }

  let body: { ratePct: number }
  try {
    body = RateSchema.parse(await req.json())
  } catch (e) {
    if (e instanceof z.ZodError) return err(e.errors[0].message)
    return err('Неверные данные')
  }

  try {
    const res = await fetch(cfg.rateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey ?? ''}`,
      },
      body: JSON.stringify({ ratePct: body.ratePct }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return err('Сервис бонусов отклонил значение', 502)
    const data = await res.json() as { ratePct: number }
    return ok({ ratePct: data.ratePct })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/tom/Desktop/crm-repair
npx tsc --noEmit --pretty false 2>&1 | grep -i "bonus-rate"
```

Expected: no output.

- [ ] **Step 3: Verify manually**

With `bonusIntegration.enabled: true` and `rateUrl` pointing at a reachable servicebox-repair
instance:

```bash
curl -s http://localhost:3200/api/settings/bonus-rate --cookie "<staff session cookie>"
# expect: {"success":true,"data":{"ratePct":<n>}}

curl -s -X POST http://localhost:3200/api/settings/bonus-rate --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"ratePct":8}'
# expect: {"success":true,"data":{"ratePct":8}}

curl -s http://localhost:3200/api/settings/bonus-rate --cookie "<staff session cookie>"
# expect: {"success":true,"data":{"ratePct":8}}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/settings/bonus-rate/route.ts
git commit -m "feat: add CRM proxy route for reading/setting the cashback rate"
```

---

## Final verification (both repos)

- [ ] servicebox-repair: `npm run build` succeeds.
- [ ] crm-repair: `docker compose build app` succeeds.
- [ ] End-to-end manual smoke test: configure `rateUrl` for a real tenant, change the percentage
  from CRM settings, then trigger a real bonus-earning event (a repair marked "Выдан") and confirm
  the credited amount reflects the new rate, not the old env-var default.
