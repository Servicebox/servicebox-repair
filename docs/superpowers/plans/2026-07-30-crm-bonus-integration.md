# CRM-Integrated Bonus Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let in-person repairs tracked in `crm-repair` earn bonuses on the servicebox-repair
website, and let bonuses be spent both at site checkout (Yandex Split) and in person via CRM
staff — generalized so any `crm-repair` tenant company can opt in, not just ServiceBox.

**Architecture:** Two repos, two new one-way HTTP integrations. CRM → site: an extended
`order.status_changed` webhook (already exists, HMAC-signed) triggers bonus crediting on the
site. Site ↔ CRM: two new API-key-authenticated site routes (`balance`, `redeem`) implement a
generic contract any CRM tenant's own backend could satisfy; CRM calls them from a new staff
widget on the order page.

**Tech Stack:** servicebox-repair — Next.js App Router, JavaScript, Mongoose, no test framework
configured (verify via manual script/curl + `npm run build`, matching this repo's existing
convention — see Global Constraints). crm-repair — Next.js App Router, TypeScript, Mongoose,
Vitest (`npm test`) — use it for new logic there, matching that repo's convention.

**Spec:** `docs/superpowers/specs/2026-07-30-crm-bonus-integration-design.md`

## Global Constraints

- 50% cap on bonus redemption applies identically at site checkout and CRM in-person redemption.
  Always enforced server-side, never trust a client-supplied discount amount.
- `BONUS_RATE_PCT` env var is the single rate source (already used by `awardOrderBonuses`) —
  reused for CRM-repair earning too, not duplicated as a second constant.
- Every crm-repair change is additive: `Company.bonusIntegration` defaults so `enabled` is falsy
  for every existing tenant; the widget only renders when a company explicitly turns it on.
- No existing webhook payload field, API route, or model field is renamed or removed anywhere in
  either repo.
- servicebox-repair has no test framework (`package.json` has no `test` script, no
  jest/vitest config anywhere in the repo). Do not introduce one for this project — that's a
  separate, unrequested decision. Verify new logic there with small `node --input-type=module`
  scripts run against a local Mongo connection, `curl` against the dev server, and
  `npm run build`, mirroring how the existing (untested) `bonuses.js`/webhook routes were
  verified in this codebase.
- crm-repair has Vitest configured and used, but **only** for pure-function unit tests under
  `src/lib/__tests__/` and `src/constants/__tests__/` (confirmed: zero API-route tests, zero
  `MongoMemoryServer`/Mongoose-model tests anywhere in the repo). Follow that exact convention —
  write real Vitest tests only for new pure logic; verify new API route handlers and model field
  additions manually (curl against the dev server, or a short `tsx`/node script against a real
  dev DB), matching how this repo already handles that layer.
- Both repos are separate git repositories on this machine
  (`/Users/tom/Desktop/servicebox-repair`, `/Users/tom/Desktop/crm-repair`) — commit to each
  independently, never cross-stage files between them.

---

## Part A — servicebox-repair

### Task 1: Phone-matching helper

**Files:**
- Create: `src/lib/phone.js`

**Interfaces:**
- Produces: `phoneMatchRegex(rawPhone: string): RegExp | null`, `normalizePhoneDigits(rawPhone: string): string` — used by Tasks 3, 7, 8, 9, 12.

Existing `User.phone` values are stored however the customer typed them at signup (`phone.trim()`
in `src/app/api/auth/signup/route.js`, no normalization) — an exact-match query against a clean
digit string would silently match nothing for most existing accounts. `crm-repair` already solves
this exact problem with a regex matcher (`buildPhoneMatcher` in
`src/app/api/v1/orders/route.ts`); this task ports the same approach so both sides agree on what
"the same phone number" means without requiring any data migration.

- [ ] **Step 1: Write the helper**

```js
// src/lib/phone.js

/**
 * Builds a regex that matches a phone number regardless of formatting
 * (spaces, dashes, parentheses, leading +7/8) by comparing only the last
 * 10 digits with any non-digit characters allowed between them. Mirrors
 * crm-repair's buildPhoneMatcher so both sides agree on "same phone number"
 * without requiring any existing User.phone values to be normalized first.
 */
export function phoneMatchRegex(rawPhone) {
  const digits = (rawPhone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length < 7) return null;
  return new RegExp(digits.split('').join('\\D*'));
}

/** Last-10-digits form, used only when we need to *store* a phone value ourselves. */
export function normalizePhoneDigits(rawPhone) {
  return (rawPhone ?? '').replace(/\D/g, '').slice(-10);
}
```

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import { phoneMatchRegex, normalizePhoneDigits } from './src/lib/phone.js';
console.log(phoneMatchRegex('+7 (911) 501-88-28').test('89115018828'));
console.log(phoneMatchRegex('89115018828').test('+7 911 501 88 28'));
console.log(normalizePhoneDigits('+7 (911) 501-88-28'));
console.log(phoneMatchRegex('123'));
"`

Expected output: `true`, `true`, `9115018828`, `null`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/phone.js
git commit -m "feat: add phone-matching helper shared by bonus integration routes"
```

---

### Task 2: `User` model — `isPhoneOnlyAccount` field

**Files:**
- Modify: `src/models/User.js:44-48` (right after `bonuses`)

**Interfaces:**
- Produces: `User.isPhoneOnlyAccount: boolean` (default `false`) — read by Task 3 (signup claiming) and set by Task 7 (auto-created accounts).

- [ ] **Step 1: Add the field**

```js
  bonuses: {
    type: Number,
    default: 0,
    min: [0, 'Баланс бонусов не может быть отрицательным']
  },
  isPhoneOnlyAccount: {
    type: Boolean,
    default: false
  },
  googleWalletPassId: {
```

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const u = new User({ username: 'test-tmp', email: 'test-tmp-isPhoneOnly@example.com', password: 'password1', phone: '9110000000' });
await u.validate();
console.log('isPhoneOnlyAccount default:', u.isPhoneOnlyAccount);
await mongoose.disconnect();
"`

Expected output: `isPhoneOnlyAccount default: false`. No validation error thrown.

- [ ] **Step 3: Commit**

```bash
git add src/models/User.js
git commit -m "feat: add isPhoneOnlyAccount field to User model"
```

---

### Task 3: Signup route — claim auto-created placeholder accounts

**Files:**
- Modify: `src/app/api/auth/signup/route.js`

**Interfaces:**
- Consumes: `phoneMatchRegex` from Task 1, `User.isPhoneOnlyAccount` from Task 2.
- Produces: signup no longer orphans bonuses earned via CRM before the customer ever registers.

Without this, a customer whose phone-only account was auto-created by Task 7 (CRM earning) would
get a *second*, empty-balance `User` on real signup — the existing signup route only de-dupes by
email, not phone.

- [ ] **Step 1: Modify the route**

```js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { phoneMatchRegex } from '@/lib/phone';

export async function POST(request) {
  try {
    await dbConnect();
    console.log('🔧 === STARTING USER REGISTRATION ===');

    const { username, email, password, phone } = await request.json();
    console.log('📝 Registration data received:', {
      username,
      email,
      phone: phone ? '***' : 'missing',
      password: password ? '***' : 'missing'
    });

    if (!username || !email || !password || !phone) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Если бонусы уже начислялись по этому телефону через CRM (ремонт в
    // сервисе до регистрации на сайте) — "забираем" тот тихий аккаунт вместо
    // создания нового, пустого. Иначе накопленные бонусы остались бы
    // недоступны клиенту навсегда.
    const phoneMatcher = phoneMatchRegex(phone);
    const placeholderUser = phoneMatcher
      ? await User.findOne({ phone: phoneMatcher, isPhoneOnlyAccount: true })
      : null;

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    let user;
    if (placeholderUser) {
      console.log('🔗 Claiming existing phone-only account:', placeholderUser._id);
      placeholderUser.username = username.trim();
      placeholderUser.email = email.toLowerCase().trim();
      placeholderUser.password = password;
      placeholderUser.phone = phone.trim();
      placeholderUser.isPhoneOnlyAccount = false;
      placeholderUser.verificationToken = verificationToken;
      placeholderUser.verificationTokenExpires = verificationTokenExpires;
      user = placeholderUser;
    } else {
      user = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim(),
        verificationToken,
        verificationTokenExpires,
      });
    }

    console.log('👤 User instance ready:', user._id ?? '(new)');

    console.log('💾 сохранен в базу...');
    await user.save();
    console.log('✅ пользователь сохранен');

    const savedUser = await User.findById(user._id);
    console.log('🔍 Verification after save:');
    console.log(`   - Token: ${savedUser.verificationToken}`);
    console.log(`   - Expires: ${savedUser.verificationTokenExpires}`);
    console.log(`   - Token matches: ${savedUser.verificationToken === verificationToken}`);

    try {
      console.log('📧 Sending verification email...');
      await sendVerificationEmail(user.email, verificationToken, user.username);
      console.log('✅ Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
    };

    return NextResponse.json(
      {
        message: 'Регистрация успешна! Проверьте ваш email для подтверждения.',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify manually**

Run against the dev server (`npm run dev` in one terminal):

```bash
# First, simulate a phone-only account existing (normally created by Task 7):
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ email: 'phone9995551234@bonus.crm' });
const u = await User.create({ username: 'Клиент ServiceBox', email: 'phone9995551234@bonus.crm', phone: '9995551234', isPhoneOnlyAccount: true, bonuses: 150 });
console.log('placeholder id:', u._id.toString());
await mongoose.disconnect();
"

# Then register normally with the same phone, different email:
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"Иван","email":"ivan-test-claim@example.com","password":"password1","phone":"+7 999 555-12-34"}' | head -c 500

# Confirm it's the SAME _id and the balance (150) survived, not a fresh 0-balance user:
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const u = await User.findOne({ email: 'ivan-test-claim@example.com' });
console.log('bonuses:', u.bonuses, 'isPhoneOnlyAccount:', u.isPhoneOnlyAccount);
await User.deleteOne({ _id: u._id }); // cleanup test data
await mongoose.disconnect();
"
```

Expected: the last script prints `bonuses: 150 isPhoneOnlyAccount: false`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/signup/route.js
git commit -m "feat: claim phone-only placeholder account at real signup

Prevents CRM-earned bonuses from orphaning on an account the customer
can never log into once they register normally with the same phone."
```

---

### Task 4: `BonusTransaction` model — `crmOrderNumber` field

**Files:**
- Modify: `src/models/BonusTransaction.js:26-31` (right after `orderId`)

**Interfaces:**
- Produces: `BonusTransaction.crmOrderNumber: string | null` — set by Task 7, traceable back to the CRM order that caused the credit. `orderId` stays reserved for this site's own `Order` model.

- [ ] **Step 1: Add the field**

```js
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  crmOrderNumber: {
    type: String,
    default: null
  },
  description: {
```

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import BonusTransaction from './src/models/BonusTransaction.js';
const doc = new BonusTransaction({ userId: '000000000000000000000000', type: 'earn', points: 10, crmOrderNumber: 'SB-000123', description: 'test' });
await doc.validate();
console.log('ok:', doc.crmOrderNumber);
"`

Expected: `ok: SB-000123`.

- [ ] **Step 3: Commit**

```bash
git add src/models/BonusTransaction.js
git commit -m "feat: add crmOrderNumber field to BonusTransaction for CRM traceability"
```

---

### Task 5: `Order` model — `bonusesSpent` field

**Files:**
- Modify: `src/models/Order.js:137-141` (right after `bonusesAwarded`)

**Interfaces:**
- Produces: `Order.bonusesSpent: boolean` (default `false`) — idempotency guard used by Task 11, mirroring the existing `bonusesAwarded` pattern exactly.

- [ ] **Step 1: Add the field**

```js
  bonusesAwarded: {
    type: Boolean,
    default: false
  },
  bonusesSpent: {
    type: Boolean,
    default: false
  },
```

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import Order from './src/models/Order.js';
const doc = new Order({ orderNumber: 'TEST-1', customerInfo: { username: 'a', email: 'a@a.com', phone: '1' }, subtotal: 100, totalAmount: 100, shippingAddress: { fullName: 'a', address: 'a', city: 'a' } });
console.log('default:', doc.bonusesSpent);
"`

Expected: `default: false`.

- [ ] **Step 3: Commit**

```bash
git add src/models/Order.js
git commit -m "feat: add bonusesSpent idempotency flag to Order model"
```

---

### Task 6: `ProcessedCrmBonusEvent` model (webhook idempotency)

**Files:**
- Create: `src/models/ProcessedCrmBonusEvent.js`

**Interfaces:**
- Produces: a collection with a unique `eventKey` index — Task 8 inserts one row per successfully-claimed CRM webhook event; a duplicate insert (same `eventKey`) throws Mongo error code `11000`, which Task 8 treats as "already processed, skip."

- [ ] **Step 1: Write the model**

```js
import mongoose from 'mongoose';

const ProcessedCrmBonusEventSchema = new mongoose.Schema({
  eventKey: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.ProcessedCrmBonusEvent
  || mongoose.model('ProcessedCrmBonusEvent', ProcessedCrmBonusEventSchema);
```

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import ProcessedCrmBonusEvent from './src/models/ProcessedCrmBonusEvent.js';
await mongoose.connect(process.env.MONGODB_URI);
await ProcessedCrmBonusEvent.deleteMany({ eventKey: 'TEST-EVENT:issued' });
await ProcessedCrmBonusEvent.create({ eventKey: 'TEST-EVENT:issued' });
try {
  await ProcessedCrmBonusEvent.create({ eventKey: 'TEST-EVENT:issued' });
  console.log('BUG: duplicate insert did not throw');
} catch (err) {
  console.log('duplicate correctly rejected, code:', err.code);
}
await ProcessedCrmBonusEvent.deleteMany({ eventKey: 'TEST-EVENT:issued' });
await mongoose.disconnect();
"`

Expected: `duplicate correctly rejected, code: 11000`.

- [ ] **Step 3: Commit**

```bash
git add src/models/ProcessedCrmBonusEvent.js
git commit -m "feat: add ProcessedCrmBonusEvent model for webhook idempotency"
```

---

### Task 7: `awardCrmRepairBonus()` in `bonuses.js`

**Files:**
- Modify: `src/lib/bonuses.js`

**Interfaces:**
- Consumes: `phoneMatchRegex`, `normalizePhoneDigits` (Task 1), `User.isPhoneOnlyAccount` (Task 2), `BonusTransaction.crmOrderNumber` (Task 4).
- Produces: `awardCrmRepairBonus({ phone, finalCost, crmOrderNumber, session }): Promise<{ awarded: boolean, points?: number, userId?: string, reason?: string }>` — called by Task 8.

- [ ] **Step 1: Add the function**

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
 * Начисляет бонусы за ремонт, завершённый в CRM (crm-repair), найденный по
 * телефону клиента. Если пользователя с таким телефоном нет на сайте —
 * создаёт "тихий" аккаунт (без пароля, с плейсхолдер-email) — см. дизайн-спеку
 * 2026-07-30-crm-bonus-integration-design.md, раздел "Correction found while
 * reading the actual User schema".
 */
export async function awardCrmRepairBonus({ phone, finalCost, crmOrderNumber, session }) {
  const matcher = phoneMatchRegex(phone);
  if (!matcher) return { awarded: false, reason: 'invalid_phone' };
  if (!finalCost || finalCost <= 0) return { awarded: false, reason: 'zero_amount' };

  const points = Math.max(1, Math.floor(finalCost * BONUS_RATE));

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

- [ ] **Step 2: Verify manually**

Run: `node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import { awardCrmRepairBonus } from './src/lib/bonuses.js';
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
await User.deleteOne({ email: 'phone9997776655@bonus.crm' });
const session = await mongoose.startSession();
session.startTransaction();
const result = await awardCrmRepairBonus({ phone: '+7 999 777-66-55', finalCost: 2000, crmOrderNumber: 'SB-TEST-1', session });
await session.commitTransaction();
session.endSession();
console.log(result);
const u = await User.findById(result.userId);
console.log('balance:', u.bonuses, 'isPhoneOnlyAccount:', u.isPhoneOnlyAccount, 'email:', u.email);
await User.deleteOne({ _id: u._id });
await mongoose.disconnect();
"`

Expected: `{ awarded: true, points: 60, userId: '...' }` (2000 * 0.03 = 60), then
`balance: 60 isPhoneOnlyAccount: true email: phone9997776655@bonus.crm`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/bonuses.js
git commit -m "feat: add awardCrmRepairBonus for CRM-repair-triggered cashback"
```

---

### Task 8: Webhook receiver — `/api/webhooks/crm-bonuses`

**Files:**
- Create: `src/app/api/webhooks/crm-bonuses/route.js`

**Interfaces:**
- Consumes: `awardCrmRepairBonus` (Task 7), `ProcessedCrmBonusEvent` (Task 6).
- Produces: a public HMAC-verified endpoint crm-repair's `fireWebhook` posts to (see Part B, Task 16 for the sending side).

- [ ] **Step 1: Write the route**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import ProcessedCrmBonusEvent from '@/models/ProcessedCrmBonusEvent';
import { awardCrmRepairBonus } from '@/lib/bonuses';

function verifyHmac(rawBody, header) {
  const secret = process.env.CRM_BONUS_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('CRM bonus webhook: CRM_BONUS_WEBHOOK_SECRET не задан — проверка подписи пропущена');
    return true;
  }

  if (!header) return false;

  // crm-repair's fireWebhook signs as `sha256=<hex>` (src/lib/outboundWebhook.ts)
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(header));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature');

  if (!verifyHmac(rawBody, signature)) {
    return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
  }

  if (payload.event !== 'order.status_changed' || payload.data?.status !== 'issued') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { orderNumber, clientPhone, finalCost } = payload.data;
  if (!orderNumber || !clientPhone || !finalCost) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await dbConnect();

  const eventKey = `${orderNumber}:issued`;
  try {
    await ProcessedCrmBonusEvent.create({ eventKey });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    throw err;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await awardCrmRepairBonus({
      phone: clientPhone,
      finalCost,
      crmOrderNumber: orderNumber,
      session,
    });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error('CRM bonus webhook processing error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  } finally {
    session.endSession();
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify manually**

Run against the dev server (with `CRM_BONUS_WEBHOOK_SECRET=test-secret` in `.env.local`):

```bash
node --input-type=module -e "
import { createHmac } from 'crypto';
const body = JSON.stringify({
  event: 'order.status_changed',
  timestamp: new Date().toISOString(),
  data: { orderNumber: 'SB-WEBHOOK-TEST-1', status: 'issued', clientPhone: '+7 999 111-22-33', clientEmail: 'x@x.com', finalCost: 5000 },
});
const sig = 'sha256=' + createHmac('sha256', 'test-secret').update(body).digest('hex');
const res = await fetch('http://localhost:3000/api/webhooks/crm-bonuses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': sig },
  body,
});
console.log(res.status, await res.json());
// Send it again — must be skipped, not double-credited:
const res2 = await fetch('http://localhost:3000/api/webhooks/crm-bonuses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': sig },
  body,
});
console.log(res2.status, await res2.json());
"
```

Expected: first call `200 { ok: true }`, second call `200 { ok: true, skipped: true }`. Then
confirm the balance was only credited once (`Math.floor(5000 * 0.03) = 150`):

```bash
node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import User from './src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const u = await User.findOne({ phone: '9991112233' });
console.log('balance:', u?.bonuses);
if (u) await User.deleteOne({ _id: u._id });
await mongoose.disconnect();
"
```

Expected: `balance: 150`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/crm-bonuses/route.js
git commit -m "feat: add webhook receiver crediting bonuses from CRM repair completion"
```

---

### Task 9: Generic contract routes — `GET /api/crm/bonuses/balance`, `POST /api/crm/bonuses/redeem`

**Files:**
- Create: `src/app/api/crm/bonuses/balance/route.js`
- Create: `src/app/api/crm/bonuses/redeem/route.js`

**Interfaces:**
- Consumes: `phoneMatchRegex` (Task 1).
- Produces: the generic balance/redeem HTTP contract crm-repair's per-company `bonusIntegration`
  config points at (see Part B, Task 17). ServiceBox's own tenant company will point its
  `balanceUrl`/`redeemUrl` at these two routes.

- [ ] **Step 1: Write the balance route**

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

  const phone = new URL(request.url).searchParams.get('phone');
  const matcher = phoneMatchRegex(phone);
  if (!matcher) {
    return NextResponse.json({ error: 'phone обязателен и должен быть валидным' }, { status: 400 });
  }

  const user = await User.findOne({ phone: matcher }).select('bonuses').lean();
  return NextResponse.json({ balance: user?.bonuses ?? 0 });
}
```

- [ ] **Step 2: Write the redeem route**

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
  phone: z.string().min(7),
  points: z.number().positive(),
});

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

  const matcher = phoneMatchRegex(body.phone);
  if (!matcher) {
    return NextResponse.json({ error: 'Неверный телефон' }, { status: 400 });
  }

  const updatedUser = await User.findOneAndUpdate(
    { phone: matcher, bonuses: { $gte: body.points } },
    { $inc: { bonuses: -body.points } },
    { new: true, select: 'bonuses' }
  );

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

- [ ] **Step 3: Verify manually**

With `CRM_BONUS_API_KEY=test-crm-key` in `.env.local` and a test user with `bonuses: 100` and
`phone: '9990001122'`:

```bash
curl -s "http://localhost:3000/api/crm/bonuses/balance?phone=9990001122" \
  -H "Authorization: Bearer test-crm-key"
# expect: {"balance":100}

curl -s -X POST http://localhost:3000/api/crm/bonuses/redeem \
  -H "Authorization: Bearer test-crm-key" -H "Content-Type: application/json" \
  -d '{"phone":"9990001122","points":30}'
# expect: {"ok":true,"newBalance":70}

curl -s -X POST http://localhost:3000/api/crm/bonuses/redeem \
  -H "Authorization: Bearer test-crm-key" -H "Content-Type: application/json" \
  -d '{"phone":"9990001122","points":1000}'
# expect: 409 {"error":"Недостаточно бонусов или клиент не найден"}

curl -s "http://localhost:3000/api/crm/bonuses/balance?phone=9990001122" -H "Authorization: Bearer wrong-key"
# expect: 401 {"error":"Unauthorized"}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/crm/bonuses/
git commit -m "feat: add generic balance/redeem contract routes for CRM in-person spend"
```

---

### Task 10: Split payment creation — accept `bonusPoints`

**Files:**
- Modify: `src/app/api/payments/split/create/route.js`

**Interfaces:**
- Produces: `Order.discount` (existing field, previously always `0` from this route) now reflects
  a bonus redemption; `Order.totalAmount` reflects the discounted total.

Online cashback is only ever earned via this Split path today (`awardOrderBonuses` is called
exclusively from `/api/payments/split/webhook`) — see spec correction. Bonus *spending* at
checkout is scoped to this same path for the same reason; the plain cash/card-at-pickup flow
(`POST /api/orders`) is untouched.

**Known risk to verify (Step 4 below):** this task scales each line item's price so
`sum(item.price * item.quantity) === amount` after the discount, to avoid Yandex Split rejecting
a payload where the items don't sum to the charged amount. This arithmetic is correct, but
Yandex Split's actual validation strictness for this specific case (item-sum vs. `amount`) has
not been empirically confirmed against their live API — treat Step 4 as required, not optional,
before this ships with real bonus redemptions enabled.

- [ ] **Step 1: Add `bonusPoints` to the schema and compute the discounted total**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth-helpers';
import Order from '@/models/Order';
import PaymentConfig from '@/models/PaymentConfig';
import User from '@/models/User';

const itemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
  slug: z.string().optional(),
});

const createSchema = z.object({
  items: z.array(itemSchema).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  bonusPoints: z.number().int().min(0).optional().default(0),
});

/**
 * Yandex Split payloads carry both a total `amount` and per-item prices;
 * scales every item's price down by the same ratio as the bonus discount so
 * sum(item.price * item.quantity) still equals `amount` exactly (any
 * rounding remainder is absorbed by the last item, in kopecks).
 */
function buildDiscountedSplitItems(items, totalKopBeforeDiscount, totalKopAfterDiscount) {
  if (totalKopBeforeDiscount === totalKopAfterDiscount) {
    return items.map(i => ({
      id: i.productId,
      title: i.name,
      price: Math.round(i.price * 100),
      count: i.quantity,
      type: 'PHYSICAL',
    }));
  }

  const ratio = totalKopAfterDiscount / totalKopBeforeDiscount;
  let allocatedKop = 0;

  return items.map((i, idx) => {
    const lineTotalKopBefore = Math.round(i.price * i.quantity * 100);
    let lineTotalKopAfter = Math.round(lineTotalKopBefore * ratio);
    allocatedKop += lineTotalKopAfter;

    if (idx === items.length - 1) {
      lineTotalKopAfter += totalKopAfterDiscount - allocatedKop;
    }

    return {
      id: i.productId,
      title: i.name,
      price: Math.round(lineTotalKopAfter / i.quantity),
      count: i.quantity,
      type: 'PHYSICAL',
    };
  });
}

export async function POST(request) {
  await dbConnect();

  const user = verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const config = await PaymentConfig.findOne({ provider: 'yandex_split' }).lean();
  if (!config?.isActive) {
    return NextResponse.json({ error: 'Оплата долями временно недоступна' }, { status: 503 });
  }

  const apiUrl = process.env.YANDEX_SPLIT_API_URL;
  const apiKey = process.env.YANDEX_SPLIT_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('Yandex Split: YANDEX_SPLIT_API_URL или YANDEX_SPLIT_API_KEY не заданы');
    return NextResponse.json({ error: 'Платёжный провайдер не настроен' }, { status: 503 });
  }

  let body;
  try {
    body = createSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
  }

  const totalRub = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalKopBeforeDiscount = Math.round(totalRub * 100);

  let bonusPoints = 0;
  if (body.bonusPoints > 0) {
    const caller = await User.findById(user.id).select('bonuses').lean();
    const maxRedeemable = Math.min(caller?.bonuses ?? 0, Math.floor(totalRub * 0.5));
    bonusPoints = Math.min(body.bonusPoints, maxRedeemable);
  }

  const discountedTotalRub = totalRub - bonusPoints;
  const totalKop = Math.round(discountedTotalRub * 100);
  const merchantOrderId = `SB-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';

  const splitPayload = {
    merchantOrderId,
    amount: totalKop,
    currency: 'RUB',
    items: buildDiscountedSplitItems(body.items, totalKopBeforeDiscount, totalKop),
    customer: {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
    },
    returnUrl: `${baseUrl}/thank-you?orderId=${merchantOrderId}`,
    failureUrl: `${baseUrl}/payment/error?orderId=${merchantOrderId}`,
  };

  let splitData;
  try {
    const splitRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Request-Id': randomUUID(),
      },
      body: JSON.stringify(splitPayload),
    });

    splitData = await splitRes.json();

    if (!splitRes.ok) {
      console.error('Yandex Split API error:', splitData);
      return NextResponse.json({ error: 'Ошибка платёжного провайдера' }, { status: 502 });
    }
  } catch (err) {
    console.error('Yandex Split fetch error:', err);
    return NextResponse.json({ error: 'Нет связи с платёжным провайдером' }, { status: 502 });
  }

  const paymentUrl = splitData?.redirectUrl ?? splitData?.paymentUrl;
  const splitOrderId = splitData?.orderId ?? splitData?.id ?? merchantOrderId;

  if (!paymentUrl) {
    console.error('Yandex Split: нет redirectUrl в ответе:', splitData);
    return NextResponse.json({ error: 'Платёжный провайдер не вернул ссылку' }, { status: 502 });
  }

  const order = await Order.create({
    orderNumber: merchantOrderId,
    userId: user.id,
    splitOrderId,
    customerInfo: {
      username: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
    },
    products: body.items.map(i => ({
      productId: i.productId,
      name: i.name,
      slug: i.slug ?? i.productId,
      image: i.image ?? '',
      price: i.price,
      quantity: i.quantity,
      totalPrice: i.price * i.quantity,
    })),
    subtotal: totalRub,
    discount: bonusPoints,
    totalAmount: discountedTotalRub,
    paymentMethod: 'yandex_split',
    paymentStatus: 'pending',
    status: 'pending',
    shippingAddress: {
      fullName: body.customerName,
      address: 'Самовывоз',
      city: 'Вологда',
    },
  });

  return NextResponse.json({ paymentUrl, orderId: order._id, orderNumber: merchantOrderId }, { status: 201 });
}
```

- [ ] **Step 2: Verify manually — no discount requested (regression check)**

```bash
curl -s -X POST http://localhost:3000/api/payments/split/create \
  --cookie "token=<valid JWT cookie>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"p1","name":"Test","price":3500,"quantity":1}],"customerName":"Тест","customerEmail":"t@t.com","customerPhone":"+79990001122"}'
```

Then confirm the created `Order.totalAmount` is `3500` and `discount` is `0` — identical to
current behavior when no `bonusPoints` is sent.

- [ ] **Step 3: Verify manually — with a discount**

Same request with `"bonusPoints": 500` added (assuming the test user has ≥500 bonus balance and
500 ≤ 50% of 3500 = 1750, so the full 500 is honored). Confirm `Order.discount === 500` and
`Order.totalAmount === 3000`, and that `splitPayload.amount` sent to Yandex Split (visible in the
`console.error` fallback path, or by temporarily logging `splitPayload` locally) sums to `300000`
kopecks across `buildDiscountedSplitItems`' output.

- [ ] **Step 4: Verify against the real Yandex Split sandbox/test credentials**

Place one real (small) test order with a nonzero `bonusPoints` through the actual checkout UI
(after Task 12) against Yandex Split's test/sandbox environment if one is configured, or a real
minimal-amount transaction otherwise. Confirm Split accepts the payment and does not reject it for
an items/amount mismatch. This is the empirical check flagged in the "Known risk" note above —
do not skip it.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payments/split/create/route.js
git commit -m "feat: allow redeeming bonus points as a discount in Split checkout"
```

---

### Task 11: Split payment webhook — debit spent bonus

**Files:**
- Modify: `src/app/api/payments/split/webhook/route.js`

**Interfaces:**
- Consumes: `Order.discount`, `Order.bonusesSpent` (Task 5).
- Produces: `BonusTransaction` (`type: 'spend'`) only once payment is actually confirmed — never
  at checkout-button-click time.

- [ ] **Step 1: Add the debit block after the existing cashback-award block**

```js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import BonusTransaction from '@/models/BonusTransaction';
import { awardOrderBonuses } from '@/lib/bonuses';

function verifyHmac(rawBody, signature) {
  const secret = process.env.YANDEX_SPLIT_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('Yandex Split webhook: YANDEX_SPLIT_WEBHOOK_SECRET не задан — проверка подписи пропущена');
    return true;
  }

  if (!signature) return false;

  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const rawBody = await request.text();

  const signature = request.headers.get('x-yandex-signature')
    ?? request.headers.get('x-ya-signature')
    ?? request.headers.get('x-merchant-callback-signature');

  if (!verifyHmac(rawBody, signature)) {
    return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
  }

  await dbConnect();

  const merchantOrderId = event.merchantOrderId ?? event.orderId;
  const status          = (event.status ?? '').toLowerCase();

  if (!merchantOrderId) {
    return NextResponse.json({ error: 'merchantOrderId отсутствует' }, { status: 400 });
  }

  if (status === 'success' || status === 'completed' || status === 'captured') {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const order = await Order.findOneAndUpdate(
        { splitOrderId: merchantOrderId, paymentStatus: { $ne: 'paid' } },
        { paymentStatus: 'paid', status: 'processing' },
        { new: true, session }
      );

      if (!order) {
        await session.abortTransaction();
        return NextResponse.json({ ok: true, skipped: true });
      }

      if (order.userId && !order.bonusesAwarded) {
        await awardOrderBonuses({
          userId:      order.userId,
          orderId:     order._id,
          totalAmount: order.totalAmount,
          session,
        });

        await Order.findByIdAndUpdate(order._id, { bonusesAwarded: true }, { session });
      }

      if (order.userId && order.discount > 0 && !order.bonusesSpent) {
        const spendResult = await User.findOneAndUpdate(
          { _id: order.userId, bonuses: { $gte: order.discount } },
          { $inc: { bonuses: -order.discount } },
          { new: true, session }
        );

        if (spendResult) {
          await BonusTransaction.create(
            [{
              userId: order.userId,
              type: 'spend',
              points: -order.discount,
              orderId: order._id,
              description: `Списание бонусов при оплате заказа ${order.orderNumber}`,
            }],
            { session }
          );
        } else {
          // Balance changed between checkout and payment confirmation (e.g.
          // spent concurrently elsewhere). Accepted soft failure — the
          // customer already got the discount via Split; not retried. See
          // spec 2026-07-30-crm-bonus-integration-design.md, Error handling.
          console.warn(`Order ${order.orderNumber}: insufficient bonus balance at spend time (${order.discount} needed), not debited`);
        }

        await Order.findByIdAndUpdate(order._id, { bonusesSpent: true }, { session });
      }

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error('Split webhook processing error:', err);
      return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
    } finally {
      session.endSession();
    }
  } else if (status === 'failed' || status === 'cancelled' || status === 'voided') {
    await Order.findOneAndUpdate(
      { splitOrderId: merchantOrderId },
      { paymentStatus: 'failed', status: 'cancelled' }
    );
  } else if (status === 'refunded') {
    await Order.findOneAndUpdate(
      { splitOrderId: merchantOrderId },
      { paymentStatus: 'refunded', status: 'cancelled' }
    );
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify manually**

Using a test `Order` with `discount: 500`, `bonusesSpent: false`, `userId` pointing at a test user
with `bonuses: 1000`, `splitOrderId: 'TEST-SPEND-1'`, `paymentStatus: 'pending'`:

```bash
node --input-type=module -e "
import { createHmac } from 'crypto';
const body = JSON.stringify({ merchantOrderId: 'TEST-SPEND-1', status: 'success' });
// omit signature header if YANDEX_SPLIT_WEBHOOK_SECRET unset in .env.local for this manual check
const res = await fetch('http://localhost:3000/api/payments/split/webhook', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
});
console.log(res.status, await res.json());
"
```

Then confirm: test user's `bonuses` decreased by exactly 500, a `BonusTransaction` with
`type: 'spend'`, `points: -500` exists, and `Order.bonusesSpent === true`. Re-run the same webhook
call once more and confirm the balance does **not** decrease a second time (idempotency via
`paymentStatus: { $ne: 'paid' }` guard, already existing).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payments/split/webhook/route.js
git commit -m "feat: debit spent bonus balance on confirmed Split payment"
```

---

### Task 12: Checkout UI — redeem bonus balance

**Files:**
- Modify: `src/components/Checkout/CheckoutForm.js`
- Modify: `src/components/SplitPayButton/SplitPayButton.js`

**Interfaces:**
- Consumes: existing `GET /api/bonuses` (balance), the extended `POST /api/payments/split/create`
  (Task 10).

- [ ] **Step 1: `SplitPayButton` accepts and forwards `bonusPoints`**

```js
'use client';
import { useState } from 'react';

/**
 * items: Array<{ productId, name, price, quantity, image?, slug? }>
 * customer: { name, email, phone }
 * bonusPoints?: number — bonus balance to redeem as a discount (capped server-side)
 * onError?: (msg: string) => void
 */
export default function SplitPayButton({ items, customer, bonusPoints = 0, className = '', onError }) {
  const [loading, setLoading] = useState(false);

  if (process.env.NEXT_PUBLIC_SPLIT_ENABLED !== 'true') return null;

  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // Минимальный порог Яндекс Сплит — 3 000 ₽
  if (totalAmount < 3000) return null;

  const handleClick = async () => {
    if (loading) return;

    const phoneDigits = (customer.phone ?? '').replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      onError?.('Для оплаты долями укажите номер телефона в форме выше');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/split/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          customerName:  customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          bonusPoints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError?.(data.error ?? 'Ошибка создания платежа');
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      onError?.('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const plans = process.env.NEXT_PUBLIC_SPLIT_PLANS?.split(',') ?? ['2', '4', '6'];
  const partAmount = Math.ceil((totalAmount - bonusPoints) / Number(plans[0]));

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center gap-0.5 w-full py-3 px-4 rounded-xl bg-[#FC3F1D] hover:bg-[#e0381a] disabled:opacity-60 text-white transition-colors ${className}`}
    >
      {loading ? (
        <span className="text-sm font-medium">Подготовка платежа…</span>
      ) : (
        <>
          <span className="text-sm font-semibold">Оплатить долями</span>
          <span className="text-xs opacity-85">
            от {partAmount.toLocaleString('ru-RU')} ₽ × {plans[0]} платежа — Яндекс Сплит
          </span>
        </>
      )}
    </button>
  );
}
```

- [ ] **Step 2: `CheckoutForm` loads balance and shows a redeem input**

In `src/components/Checkout/CheckoutForm.js`, add state and a fetch alongside the existing
`loadCartAndProducts`, and pass `bonusPoints` into `SplitPayButton`:

```js
  const [bonusBalance, setBonusBalance] = useState(0);
  const [bonusToRedeem, setBonusToRedeem] = useState(0);
```

In `loadCartAndProducts` (right after the existing `if (user) { ... }` block that autofills the
form):

```js
    if (user) {
      fetch('/api/bonuses', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setBonusBalance(data.balance ?? 0))
        .catch(() => setBonusBalance(0));
    }
```

Right before the closing `</form>` footer buttons (near the existing `YandexPayButton`/
`SplitPayButton` block), add the redeem control and pass `bonusPoints` through:

```jsx
          {user && bonusBalance > 0 && (
            <div className={styles.formGroup}>
              <label>
                Списать бонусы (доступно: {Math.min(bonusBalance, Math.floor(finalTotal * 0.5))} из {bonusBalance})
              </label>
              <input
                type="number"
                min="0"
                max={Math.min(bonusBalance, Math.floor(finalTotal * 0.5))}
                value={bonusToRedeem}
                onChange={(e) => {
                  const cap = Math.min(bonusBalance, Math.floor(finalTotal * 0.5));
                  const next = Math.max(0, Math.min(cap, Number(e.target.value) || 0));
                  setBonusToRedeem(next);
                }}
              />
            </div>
          )}

          <SplitPayButton
            items={visibleProducts.map(p => ({
              productId: p._id ?? p.slug,
              name:      p.name,
              price:     p.new_price,
              quantity:  cart[p.slug] || 1,
              image:     p.images?.[0] ?? '',
              slug:      p.slug,
            }))}
            customer={{
              name:  formData.name,
              email: formData.email,
              phone: formData.phone,
            }}
            bonusPoints={bonusToRedeem}
            onError={msg => alert(msg)}
          />
```

(This replaces the existing `<SplitPayButton ... />` call — same props plus `bonusPoints`.)

- [ ] **Step 3: Verify in a browser**

`npm run dev`, log in as a user with a nonzero bonus balance, add ≥3000 ₽ of parts to cart, open
checkout. Confirm: the redeem input appears, capped at `min(balance, 50% of total)`; changing it
updates what's forwarded to `SplitPayButton`; clicking "Оплатить долями" redirects to a Split
payment URL for the discounted amount (cross-check against Task 10 Step 4's sandbox check).

- [ ] **Step 4: Commit**

```bash
git add src/components/Checkout/CheckoutForm.js src/components/SplitPayButton/SplitPayButton.js
git commit -m "feat: let customers redeem bonus balance as a checkout discount"
```

---

## Part B — crm-repair

### Task 13: `Company` model — `bonusIntegration` field

**Files:**
- Modify: `src/models/Company.ts:85-93` (interface, alongside `outboundWebhook`)
- Modify: `src/models/Company.ts:176` (schema, alongside `outboundWebhook`)

**Interfaces:**
- Produces: `Company.bonusIntegration?: { enabled?: boolean; balanceUrl?: string; redeemUrl?: string; apiKey?: string }` — read/written by Task 14, read by Task 17.

- [ ] **Step 1: Add to the TypeScript interface**

```ts
  outboundWebhook?: {
    url?: string
    secret?: string
    events?: {
      newOrder?: boolean
      statusChange?: boolean
      payment?: boolean
    }
  }
  bonusIntegration?: {
    enabled?: boolean
    balanceUrl?: string
    redeemUrl?: string
    apiKey?: string
  }
  receptionSettings?: unknown
```

- [ ] **Step 2: Add to the Mongoose schema**

```ts
    outboundWebhook: { type: Schema.Types.Mixed, default: null },
    bonusIntegration: { type: Schema.Types.Mixed, default: null },
    receptionSettings: { type: Schema.Types.Mixed, default: null },
```

- [ ] **Step 3: Verify manually**

This repo has no Mongoose-model test convention (no `MongoMemoryServer` usage anywhere in
`src/models/`) — a `Schema.Types.Mixed` field addition like `outboundWebhook` itself was never
unit-tested either. Verify by type-checking and a quick manual round-trip against the real dev DB
instead of inventing a new test-infra convention for this one field:

```bash
npx tsc --noEmit --pretty false
```

Expected: no new type errors.

```bash
npx tsx -e "
import mongoose from 'mongoose'
import 'dotenv/config'
import Company from './src/models/Company'
await mongoose.connect(process.env.MONGODB_URI!)
const c = await Company.findOne()
console.log('bonusIntegration before:', c?.bonusIntegration)
if (c) {
  c.bonusIntegration = { enabled: true, balanceUrl: 'https://x.com/balance', redeemUrl: 'https://x.com/redeem', apiKey: 'test' }
  await c.save()
  const reloaded = await Company.findById(c._id).lean()
  console.log('bonusIntegration after reload:', reloaded?.bonusIntegration)
  c.bonusIntegration = null
  await c.save()
}
await mongoose.disconnect()
"
```

Expected: `bonusIntegration before: undefined` (or `null`), then `bonusIntegration after reload:`
showing the saved object — confirms the `Mixed` field round-trips correctly. The script resets it
back to `null` at the end so no real company config is left modified by this check.

- [ ] **Step 4: Commit**

```bash
git add src/models/Company.ts
git commit -m "feat: add bonusIntegration config field to Company model"
```

---

### Task 14: Settings API route — `/api/settings/bonus-integration`

**Files:**
- Create: `src/app/api/settings/bonus-integration/route.ts`

**Interfaces:**
- Consumes: `requireTenantRole`, `ok`, `err` from `@/lib/api-helpers` (existing), `Company` (Task 13).
- Produces: `GET` returns `{ enabled, balanceUrl, redeemUrl, hasApiKey }`; `POST` saves the config,
  read by the settings UI (Task 15) and by Task 17's staff routes.

Unlike the existing webhook secret (which the CRM generates because it's the one *signing*
outgoing requests), `apiKey` here must match a value that lives in an external system (the site's
own `CRM_BONUS_API_KEY` env var) — so the owner pastes it in rather than the CRM generating it.

- [ ] **Step 1: Write the route**

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
  apiKey: z.string().max(200).or(z.literal('')),
})

export async function GET() {
  const auth = await requireTenantRole(['owner', 'admin'])
  if (auth.error) return auth.error
  await connectToDatabase()

  const company = await Company.findById(auth.session!.user.companyId)
    .select('bonusIntegration')
    .lean() as { bonusIntegration?: { enabled?: boolean; balanceUrl?: string; redeemUrl?: string; apiKey?: string } } | null

  const cfg = company?.bonusIntegration ?? {}
  return ok({
    enabled: cfg.enabled ?? false,
    balanceUrl: cfg.balanceUrl ?? '',
    redeemUrl: cfg.redeemUrl ?? '',
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

    // Keep the existing key if the form didn't resend one (UI only shows a
    // masked placeholder, never the real value back — see Task 15).
    const apiKey = data.apiKey || company?.bonusIntegration?.apiKey || ''

    await Company.findByIdAndUpdate(auth.session!.user.companyId, {
      $set: {
        bonusIntegration: {
          enabled: data.enabled,
          balanceUrl: data.balanceUrl || null,
          redeemUrl: data.redeemUrl || null,
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

- [ ] **Step 2: Verify manually**

This repo has zero API-route tests anywhere (`find src/app/api -iname "*.test.ts"` returns
nothing — Vitest here is used only for pure-function unit tests under `src/lib/__tests__/`).
Route handlers like the existing `/api/settings/webhook` were never given automated tests either.
Verify against the running dev server instead, logged in as a company owner/admin
(`npm run dev`, then use the browser's own session cookie via the UI, or a saved auth cookie with
curl):

```bash
# GET before any config exists — expect disabled defaults:
curl -s http://localhost:3000/api/settings/bonus-integration --cookie "<your session cookie>"
# expect: {"success":true,"data":{"enabled":false,"balanceUrl":"","redeemUrl":"","hasApiKey":false}}

# POST a config:
curl -s -X POST http://localhost:3000/api/settings/bonus-integration --cookie "<your session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"balanceUrl":"https://example.com/balance","redeemUrl":"https://example.com/redeem","apiKey":"test-key-123"}'
# expect: {"success":true,"data":{"saved":true}}

# GET again — confirm it persisted and the key is masked, not echoed back:
curl -s http://localhost:3000/api/settings/bonus-integration --cookie "<your session cookie>"
# expect: {"success":true,"data":{"enabled":true,"balanceUrl":"https://example.com/balance","redeemUrl":"https://example.com/redeem","hasApiKey":true}}

# POST again with an empty apiKey — confirm the previously-saved key is NOT wiped:
curl -s -X POST http://localhost:3000/api/settings/bonus-integration --cookie "<your session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"balanceUrl":"https://example.com/balance","redeemUrl":"https://example.com/redeem","apiKey":""}'
node --input-type=module -e "
import mongoose from 'mongoose'
import 'dotenv/config'
import Company from './src/models/Company.js'
await mongoose.connect(process.env.MONGODB_URI)
const c = await Company.findOne({ 'bonusIntegration.balanceUrl': 'https://example.com/balance' }).lean()
console.log('apiKey still set:', c?.bonusIntegration?.apiKey === 'test-key-123')
await Company.updateOne({ _id: c._id }, { \$set: { bonusIntegration: null } }) // cleanup test data
await mongoose.disconnect()
"
# expect: apiKey still set: true
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/bonus-integration/
git commit -m "feat: add settings API for per-company bonus integration config"
```

---

### Task 15: Settings UI — Bonus integration tab

**Files:**
- Modify: `src/app/(dashboard)/settings/api/page.tsx`

**Interfaces:**
- Consumes: `GET`/`POST /api/settings/bonus-integration` (Task 14).

Mirrors the existing "Webhook" tab in the same file exactly (same component, same state
management style, same save/loading/saved-flash pattern) — see that tab's implementation
(`tab === 'webhook'` block) for the pattern being followed.

- [ ] **Step 1: Add the tab entry**

```ts
const TABS = [
  { key: 'rest', label: 'REST API', icon: Code2 },
  { key: 'fiscal', label: 'Фискализация', icon: FileJson },
  { key: '1c', label: '1С', icon: Download },
  { key: 'webhook', label: 'Webhook', icon: Webhook },
  { key: 'bonus', label: 'Бонусы клиентов', icon: Gift },
]
```

Add `Gift` to the `lucide-react` import at the top of the file:

```ts
import {
  Code2, Key, Copy, Check, RefreshCw, Download, Globe,
  Webhook, FileJson, ChevronRight, Save, Loader2, Eye, EyeOff, Send, ShieldCheck, Gift,
} from 'lucide-react'
```

- [ ] **Step 2: Add state and load/save handlers**

Alongside the existing `webhook*` state declarations:

```ts
  const [bonusEnabled, setBonusEnabled] = useState(false)
  const [bonusBalanceUrl, setBonusBalanceUrl] = useState('')
  const [bonusRedeemUrl, setBonusRedeemUrl] = useState('')
  const [bonusApiKey, setBonusApiKey] = useState('')
  const [bonusHasApiKey, setBonusHasApiKey] = useState(false)
  const [bonusLoaded, setBonusLoaded] = useState(false)
  const [bonusSaving, setBonusSaving] = useState(false)
  const [bonusSaved, setBonusSaved] = useState(false)
```

Alongside the existing `loadWebhook` effect:

```ts
  useEffect(() => {
    async function loadBonus() {
      try {
        const res = await fetch('/api/settings/bonus-integration')
        const json = await res.json() as { success: boolean; data: { enabled: boolean; balanceUrl: string; redeemUrl: string; hasApiKey: boolean } }
        if (json.success && json.data) {
          setBonusEnabled(json.data.enabled)
          setBonusBalanceUrl(json.data.balanceUrl)
          setBonusRedeemUrl(json.data.redeemUrl)
          setBonusHasApiKey(json.data.hasApiKey)
        }
        setBonusLoaded(true)
      } catch { setBonusLoaded(true) }
    }
    void loadBonus()
  }, [])
```

Alongside the existing `saveWebhook` function:

```ts
  async function saveBonus() {
    setBonusSaving(true)
    try {
      const res = await fetch('/api/settings/bonus-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: bonusEnabled,
          balanceUrl: bonusBalanceUrl,
          redeemUrl: bonusRedeemUrl,
          apiKey: bonusApiKey,
        }),
      })
      const json = await res.json() as { success: boolean }
      if (json.success) {
        if (bonusApiKey) setBonusHasApiKey(true)
        setBonusApiKey('')
        setBonusSaved(true)
        setTimeout(() => setBonusSaved(false), 2500)
      }
    } catch { /* ignore */ } finally {
      setBonusSaving(false)
    }
  }
```

- [ ] **Step 3: Add the tab content**

Right after the closing `)}` of the existing `{tab === 'webhook' && ( ... )}` block, before the
final closing `</div></div></div>`:

```tsx
          {/* Bonus integration tab */}
          {tab === 'bonus' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-base">Бонусы клиентов — списание при выдаче заказа</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Позволяет мастеру видеть бонусный баланс клиента и списывать его как скидку прямо
                  при выдаче заказа. CRM обращается к вашей собственной системе бонусов по указанным
                  ниже адресам.
                </p>
              </div>

              {!bonusLoaded ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
              ) : (
                <>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusEnabled}
                      onChange={(e) => setBonusEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium">Включить интеграцию бонусов</p>
                      <p className="text-xs text-muted-foreground">Виджет бонусов появится на странице заказа</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium mb-1">URL проверки баланса</label>
                    <input
                      type="url"
                      value={bonusBalanceUrl}
                      onChange={(e) => setBonusBalanceUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourdomain.ru/api/crm/bonuses/balance"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Вызывается как <code className="bg-muted px-1 rounded font-mono">GET {'{url}'}?phone=...</code>,
                      ожидается ответ <code className="bg-muted px-1 rounded font-mono">{'{ balance: number }'}</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">URL списания</label>
                    <input
                      type="url"
                      value={bonusRedeemUrl}
                      onChange={(e) => setBonusRedeemUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourdomain.ru/api/crm/bonuses/redeem"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Вызывается как <code className="bg-muted px-1 rounded font-mono">POST {'{url}'}</code> с телом{' '}
                      <code className="bg-muted px-1 rounded font-mono">{'{ phone, points }'}</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">API-ключ</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border font-mono text-sm">
                      <Key className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        type="password"
                        value={bonusApiKey}
                        onChange={(e) => setBonusApiKey(e.target.value)}
                        placeholder={bonusHasApiKey ? '•••••••••••••••• (оставьте пустым, чтобы не менять)' : 'Вставьте ключ, выданный вашей системой бонусов'}
                        className="flex-1 bg-transparent outline-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Передаётся в заголовке <code className="bg-muted px-1 rounded font-mono">Authorization: Bearer {'{apiKey}'}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <button
                      onClick={() => void saveBonus()}
                      disabled={bonusSaving}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      {bonusSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {bonusSaved ? 'Сохранено' : 'Сохранить'}
                    </button>
                    {bonusSaved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Сохранено</span>}
                  </div>
                </>
              )}
            </div>
          )}
```

- [ ] **Step 4: Verify in a browser**

`npm run dev`, open Settings → API и интеграции → «Бонусы клиентов», confirm the form loads,
saves, and the API key masks correctly (shows placeholder text, not the real stored value) on
reload.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/settings/api/page.tsx"
git commit -m "feat: add bonus integration settings tab"
```

---

### Task 16: Extend `order.status_changed` webhook payload for `issued`

**Files:**
- Modify: `src/app/api/orders/[id]/route.ts:593-599`

**Interfaces:**
- Produces: the extended payload consumed by servicebox-repair's Task 8.

- [ ] **Step 1: Add the extra fields, only for `issued`**

```ts
      fireWebhook(companyId, 'order.status_changed', {
        orderNumber: order.number,
        status: statusChanged,
        statusLabel,
        clientName: order.clientName,
        device,
        ...(statusChanged === 'issued' ? {
          clientPhone: order.clientPhone,
          clientEmail: order.clientEmail,
          finalCost: order.finalCost,
        } : {}),
      })
```

- [ ] **Step 2: Verify manually**

No test covers this route today (`find src/app/api/orders -iname "*.test.ts"` returns nothing —
this repo's Vitest tests are pure-function only, under `src/lib/__tests__/`). Verify against the
running dev server with a temporary local HTTP listener standing in for servicebox-repair, so you
can see the exact payload without needing bonuses wired up end-to-end yet:

```bash
# Terminal 1: a throwaway listener to inspect what fireWebhook actually sends
node --input-type=module -e "
import http from 'http';
http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => { console.log('received:', body); res.writeHead(200); res.end('{}'); });
}).listen(4001, () => console.log('listening on :4001'));
"
```

In the CRM UI (or via `/api/settings/webhook`), temporarily point a test company's
`outboundWebhook.url` at `http://localhost:4001` with `statusChange` enabled, then change one of
its real (or test) orders' status to `issued` and separately to some other status (e.g. `ready`).
Confirm the terminal log shows `clientPhone`/`clientEmail`/`finalCost` present in the `issued`
payload and absent from the other status's payload. Revert the test company's webhook URL
afterward.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/orders/[id]/route.ts"
git commit -m "feat: include clientPhone/clientEmail/finalCost in issued-status webhook

Additive only — every other status transition's payload is unchanged.
Needed by servicebox-repair's CRM bonus webhook receiver."
```

---

### Task 17: Staff routes — `GET/POST /api/orders/[id]/bonus-balance` and `/bonus-redeem`

**Files:**
- Create: `src/app/api/orders/[id]/bonus-balance/route.ts`
- Create: `src/app/api/orders/[id]/bonus-redeem/route.ts`

**Interfaces:**
- Consumes: `requireTenantAuth` (existing), `Company.bonusIntegration` (Task 13).
- Produces: staff-facing endpoints called by the order-page widget (Task 18).

- [ ] **Step 1: Write the balance route**

```ts
import { NextRequest } from 'next/server'
import { requireTenantAuth, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
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

  const order = await Order.findById(params.id).select('clientPhone').lean() as { clientPhone?: string } | null
  if (!order?.clientPhone) {
    return err('У заказа не указан телефон клиента', 400)
  }

  try {
    const res = await fetch(`${cfg.balanceUrl}?phone=${encodeURIComponent(order.clientPhone)}`, {
      headers: { Authorization: `Bearer ${cfg.apiKey ?? ''}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return err('Сервис бонусов недоступен', 502)
    const data = await res.json() as { balance: number }
    return ok({ balance: data.balance })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 2: Write the redeem route**

```ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireTenantAuth, ok, err } from '@/lib/api-helpers'
import Company from '@/models/Company'

const RedeemSchema = z.object({
  points: z.number().positive(),
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

  let body: { points: number }
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
  if (!order?.clientPhone) {
    return err('У заказа не указан телефон клиента', 400)
  }

  const cap = Math.floor((order.finalCost ?? 0) * 0.5)
  if (body.points > cap) {
    return err(`Максимум к списанию: ${cap}`, 400)
  }

  try {
    const res = await fetch(cfg.redeemUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey ?? ''}`,
      },
      body: JSON.stringify({ phone: order.clientPhone, points: body.points }),
      signal: AbortSignal.timeout(8000),
    })

    if (res.status === 409) {
      return err('Недостаточно бонусов у клиента', 409)
    }
    if (!res.ok) {
      return err('Сервис бонусов отклонил списание', 502)
    }

    const data = await res.json() as { newBalance: number }

    order.discount = (order.discount ?? 0) + body.points
    await order.save()

    return ok({ newBalance: data.newBalance, discountApplied: order.discount })
  } catch {
    return err('Не удалось связаться с сервисом бонусов', 502)
  }
}
```

- [ ] **Step 3: Verify manually**

No API-route test convention exists in this repo (see Task 14's note). Verify against the running
dev server, with a test order (`clientPhone` set, `finalCost: 1000`, belonging to a company whose
`bonusIntegration` is enabled and pointed at servicebox-repair's Task 9 routes with a matching
test user/balance there):

```bash
# Balance check:
curl -s http://localhost:3000/api/orders/<order-id>/bonus-balance --cookie "<staff session cookie>"
# expect: {"success":true,"data":{"balance":<n>}}

# Redeem above the 50% cap — expect a 400, no call reaches the site:
curl -s -X POST http://localhost:3000/api/orders/<order-id>/bonus-redeem --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"points":600}'
# expect: 400 "Максимум к списанию: 500"

# Redeem within the cap — expect success, and confirm the order's `discount`
# increased by the redeemed amount and the site's balance decreased to match:
curl -s -X POST http://localhost:3000/api/orders/<order-id>/bonus-redeem --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"points":100}'
# expect: {"success":true,"data":{"newBalance":<n-100>,"discountApplied":100}}

# Redeem more than the (now-reduced) site balance — expect the site's 409 to surface here too:
curl -s -X POST http://localhost:3000/api/orders/<order-id>/bonus-redeem --cookie "<staff session cookie>" \
  -H "Content-Type: application/json" -d '{"points":100000}'
# expect: 409 "Недостаточно бонусов у клиента"
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/orders/[id]/bonus-balance/" "src/app/api/orders/[id]/bonus-redeem/"
git commit -m "feat: add staff-facing bonus balance/redeem routes for order page"
```

---

### Task 18: Order detail page — bonus widget

**Files:**
- Create: `src/components/orders/BonusWidget.tsx`
- Modify: `src/app/(dashboard)/orders/[id]/page.tsx` (insert inside the existing "Оплата" tab
  content, right after the payment-progress block — anchor text:
  `Оплачено {formatCurrency(totalPaid)} из {formatCurrency(order.finalCost)}`, around line 1151-1160)

**Interfaces:**
- Consumes: `GET/POST /api/orders/[id]/bonus-balance`, `/bonus-redeem` (Task 17).

- [ ] **Step 1: Write the widget component**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { Gift, Loader2 } from 'lucide-react'

interface BonusWidgetProps {
  orderId: string
  finalCost: number
  onRedeemed?: (discountApplied: number) => void
}

export default function BonusWidget({ orderId, finalCost, onRedeemed }: BonusWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderId}/bonus-balance`)
        const json = await res.json() as { success: boolean; data?: { balance: number }; error?: string }
        if (cancelled) return
        if (json.success && json.data) {
          setBalance(json.data.balance)
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
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Загрузка бонусов клиента…
      </div>
    )
  }

  // Silently absent when the integration isn't configured/enabled for this
  // company, or the order has no client phone — not an error state worth
  // surfacing to staff on every order.
  if (error || balance === null) return null

  const cap = Math.min(balance, Math.floor((finalCost ?? 0) * 0.5))

  async function handleRedeem() {
    setRedeeming(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/bonus-redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
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
      <div className="flex items-center gap-2 font-medium text-sm">
        <Gift className="w-4 h-4 text-purple-500" /> Бонусы клиента: {balance}
      </div>
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
    </div>
  )
}
```

- [ ] **Step 2: Insert into the order detail page**

Add the import near the other component imports:

```ts
import BonusWidget from '@/components/orders/BonusWidget'
```

Find the anchor line (payment progress bar, `Оплачено {formatCurrency(totalPaid)} из
{formatCurrency(order.finalCost)}`, around line 1151) and insert right after that block closes:

```tsx
                  <span>Оплачено {formatCurrency(totalPaid)} из {formatCurrency(order.finalCost)}</span>
                </div>
                {/* ... existing progress bar div ... */}

                <BonusWidget
                  orderId={order._id}
                  finalCost={order.finalCost}
                  onRedeemed={() => void queryClient.invalidateQueries({ queryKey: ['order', orderId] })}
                />
```

Check the exact `queryClient`/`queryKey` names already used elsewhere in this file
(`grep -n "invalidateQueries" "src/app/(dashboard)/orders/[id]/page.tsx"`) and match them — don't
invent a new query key.

- [ ] **Step 3: Verify in a browser**

Open an order for a client whose phone matches a real bonus balance on the site (with
`bonusIntegration` enabled and pointed at a running servicebox-repair dev server). Confirm the
widget shows the balance, redeeming updates the order's discount and refetches, and the widget
silently doesn't render for companies without the integration enabled.

- [ ] **Step 4: Commit**

```bash
git add src/components/orders/BonusWidget.tsx "src/app/(dashboard)/orders/[id]/page.tsx"
git commit -m "feat: add client bonus balance/redeem widget to order page"
```

---

## Final verification (both repos)

- [ ] servicebox-repair: `npm run build` succeeds.
- [ ] crm-repair: `npm test` and `npm run build` both succeed.
- [ ] End-to-end manual smoke test: change a real (or test) order to `issued` in crm-repair with
  `bonusIntegration` and the webhook both configured to point at a reachable servicebox-repair
  instance; confirm the balance increases there; confirm the CRM order page's bonus widget then
  shows that balance and can redeem part of it back.
