# Website Chat → CRM Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live Chatwoot widget on servicebox35.ru with a chat that lands in Tom's own
CRM (`crm-repair`, service-box-35.ru), so website conversations show up next to orders instead of in a
disconnected third-party tool.

**Architecture:** Site widget → servicebox-repair's own `/api/chat/messages` (existing route,
re-implemented) → proxies with `Bearer CRM_API_KEY` → CRM's new `/api/v1/chat/messages` →
CRM's tenant DB (`InboxConversation`/`InboxMessage`) → new "Инбокс" dashboard page in the CRM for
staff to read/reply/convert-to-order → reply flows back through the same path in reverse.

**Tech Stack:** `crm-repair`: Next.js 14 App Router, TypeScript strict, Mongoose, vitest.
`servicebox-repair`: Next.js App Router, plain JS, no test suite (matches existing convention).

## Global Constraints

- `crm-repair`: RSC by default, `'use client'` only for state/effects/handlers/browser APIs.
  Every route segment gets `error.tsx` + `loading.tsx`. No `any` without a justification comment.
  Import alias `@/` → `src/`. Multi-tenant isolation: every tenant query goes through
  `requireTenantAuth()`/`requireTenantRole()` or `validateCompanyApiKey()` — never trust a
  `companyId` from the request body/params.
- `servicebox-repair`: plain JS (no TypeScript), Tailwind + CSS Modules, no test suite — don't add
  one solely for this feature.
- Two repos, two working directories: `/Users/tom/Desktop/crm-repair` (has its own git remote,
  already up to date with `origin/main`) and `/Users/tom/Desktop/servicebox-repair` (this repo).
  **Before touching `crm-repair`, run `git status` there — it already has unrelated in-progress,
  uncommitted changes (`src/app/api/v1/orders/route.ts` modified, `src/app/api/payroll/[id]/route.ts`
  untracked) from other work. Do not commit those files; only ever `git add` the exact paths this
  plan creates/modifies, the same discipline documented for `servicebox-repair` in this repo's
  memory (`feedback-git-commits.md`) — never a bare `git commit` relying on whatever happens to be
  staged.**
- `crm-repair`'s existing `client_message` notify event (`src/lib/notify.ts`) already has
  Telegram/email/push templates wired up — call `notifyStaff()`, do not build new notification
  plumbing.

---

### Task 1: `InboxConversation` and `InboxMessage` models (crm-repair)

**Files:**
- Create: `/Users/tom/Desktop/crm-repair/src/models/InboxConversation.ts`
- Create: `/Users/tom/Desktop/crm-repair/src/models/InboxMessage.ts`
- Modify: `/Users/tom/Desktop/crm-repair/src/lib/models.ts`

No dedicated test file for this task: checked `find src -iname "*.test.ts"` in `crm-repair` —
every existing vitest test covers a pure-logic `lib/` function (`barcode`, `notify`, `taskRules`,
`permissions`, `crypto`, etc.); no Mongoose model has a DB-backed unit test anywhere in this
codebase, and `mongodb-memory-server` isn't a dependency. Introducing that pattern for one model
would be new, unestablished infrastructure, not a fix that follows this project's actual
convention — these models get exercised through Task 2's route instead, and end-to-end in Task 8.

**Interfaces:**
- Produces: `getInboxConversationModel(conn)`, `getInboxMessageModel(conn)` — same factory
  pattern as `getChatRoomModel`/`getChatMessageModel` in the existing `ChatRoom.ts`/`ChatMessage.ts`.
  `getModels(conn)` return type gains `InboxConversation` and `InboxMessage` keys, used by every
  later task in this plan.

- [ ] **Step 1: Write `InboxConversation.ts`**

```typescript
import mongoose, { Document, Model, Schema } from 'mongoose'

export type InboxChannel = 'website'
export type InboxConversationStatus = 'open' | 'closed'

export interface IInboxConversation extends Document {
  _id: mongoose.Types.ObjectId
  sessionId: string
  visitorName: string
  visitorPhone?: string
  channel: InboxChannel
  status: InboxConversationStatus
  lastMessageAt: Date
  unreadCount: number
  orderId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const InboxConversationSchema = new Schema<IInboxConversation>(
  {
    sessionId: { type: String, required: true, unique: true, trim: true },
    visitorName: { type: String, required: true, trim: true },
    visitorPhone: { type: String, trim: true },
    channel: { type: String, enum: ['website'], default: 'website', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
)

InboxConversationSchema.index({ lastMessageAt: -1 })

const InboxConversation: Model<IInboxConversation> =
  mongoose.models.InboxConversation ??
  mongoose.model<IInboxConversation>('InboxConversation', InboxConversationSchema)
export default InboxConversation

export function getInboxConversationModel(conn: mongoose.Connection) {
  if (conn.models.InboxConversation) return conn.models.InboxConversation as Model<IInboxConversation>
  return conn.model<IInboxConversation>('InboxConversation', InboxConversationSchema)
}
```

- [ ] **Step 2: Write `InboxMessage.ts`**

```typescript
import mongoose, { Document, Model, Schema } from 'mongoose'

export type InboxMessageAuthor = 'visitor' | 'staff'

export interface IInboxMessage extends Document {
  _id: mongoose.Types.ObjectId
  conversationId: mongoose.Types.ObjectId
  author: InboxMessageAuthor
  text: string
  createdAt: Date
  updatedAt: Date
}

const InboxMessageSchema = new Schema<IInboxMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'InboxConversation', required: true },
    author: { type: String, enum: ['visitor', 'staff'], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

InboxMessageSchema.index({ conversationId: 1, createdAt: 1 })

const InboxMessage: Model<IInboxMessage> =
  mongoose.models.InboxMessage ??
  mongoose.model<IInboxMessage>('InboxMessage', InboxMessageSchema)
export default InboxMessage

export function getInboxMessageModel(conn: mongoose.Connection) {
  if (conn.models.InboxMessage) return conn.models.InboxMessage as Model<IInboxMessage>
  return conn.model<IInboxMessage>('InboxMessage', InboxMessageSchema)
}
```

- [ ] **Step 3: Register both in `getModels()`**

Edit `/Users/tom/Desktop/crm-repair/src/lib/models.ts` — add imports and registry entries:

```typescript
import { getInboxConversationModel } from '@/models/InboxConversation'
import { getInboxMessageModel } from '@/models/InboxMessage'
```

Inside the returned object (after the existing `ChatRoom: getChatRoomModel(conn),` line), add:

```typescript
    InboxConversation: getInboxConversationModel(conn),
    InboxMessage: getInboxMessageModel(conn),
```

- [ ] **Step 4: Typecheck**

```bash
cd /Users/tom/Desktop/crm-repair && npx tsc --noEmit
```

Expected: no new errors involving `InboxConversation`, `InboxMessage`, or `models.ts`.

- [ ] **Step 5: Commit**

```bash
cd /Users/tom/Desktop/crm-repair
git add src/models/InboxConversation.ts src/models/InboxMessage.ts src/lib/models.ts
git commit -m "feat: add InboxConversation/InboxMessage models for website chat"
```

---

### Task 2: External API — `POST/GET /api/v1/chat/messages` (crm-repair)

**Files:**
- Create: `/Users/tom/Desktop/crm-repair/src/app/api/v1/chat/messages/route.ts`

No test file: confirmed `find src/app/api -iname "*.test.ts"` in `crm-repair` returns nothing —
API routes in this codebase aren't unit-tested (only pure `lib/` functions are, per Task 1's
note); this route is exercised end-to-end in Task 8 instead.

**Interfaces:**
- Consumes: `validateCompanyApiKey(request)` and `apiUnauthorized()` from `@/lib/apiAuth`
  (Task 1 dependency: none — these already exist). `getTenantConnection` from `@/lib/tenantDb`.
  `getInboxConversationModel`/`getInboxMessageModel` from Task 1.
  `checkRateLimit`/`getClientIp` from `@/lib/rate-limit`.
  `notifyStaff` from `@/lib/notify` — signature `notifyStaff(companyId: string, dbName: string, event: NotifyEvent, payload: NotifyPayload): void`, event `'client_message'` already defined.
- Produces: `POST` returns `{ success: true, data: { conversationId, messageId } }`. `GET` returns
  `{ success: true, data: { conversation, messages } }`.

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCompanyApiKey, apiUnauthorized } from '@/lib/apiAuth'
import { getTenantConnection } from '@/lib/tenantDb'
import { getModels } from '@/lib/models'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { notifyStaff } from '@/lib/notify'

const PostSchema = z.object({
  sessionId: z.string().min(1),
  visitorName: z.string().min(1),
  text: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const company = await validateCompanyApiKey(request)
  if (!company) return apiUnauthorized()

  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId обязателен' }, { status: 400 })
  }

  const conn = await getTenantConnection(company.dbName)
  const { InboxConversation, InboxMessage } = getModels(conn)

  const conversation = await InboxConversation.findOne({ sessionId }).lean()
  if (!conversation) {
    return NextResponse.json({ success: true, data: { conversation: null, messages: [] } })
  }

  const messages = await InboxMessage.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .lean()

  return NextResponse.json({ success: true, data: { conversation, messages } })
}

export async function POST(request: NextRequest) {
  const company = await validateCompanyApiKey(request)
  if (!company) return apiUnauthorized()

  const ip = getClientIp(request)
  const rl = checkRateLimit(`chat:${company.companyId}:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({ success: false, error: 'Слишком много сообщений, попробуйте позже' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Некорректный запрос' }, { status: 400 })
  }

  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Некорректные данные' }, { status: 400 })
  }
  const { sessionId, visitorName, text } = parsed.data

  const conn = await getTenantConnection(company.dbName)
  const { InboxConversation, InboxMessage } = getModels(conn)

  let conversation = await InboxConversation.findOne({ sessionId })
  if (!conversation) {
    conversation = await InboxConversation.create({ sessionId, visitorName, channel: 'website' })
  } else {
    conversation.lastMessageAt = new Date()
    conversation.unreadCount += 1
    conversation.status = 'open'
    await conversation.save()
  }

  const message = await InboxMessage.create({
    conversationId: conversation._id,
    author: 'visitor',
    text,
  })

  notifyStaff(company.companyId, company.dbName, 'client_message', {
    senderName: visitorName,
    messageText: text.slice(0, 200),
    url: '/inbox',
  })

  return NextResponse.json({
    success: true,
    data: { conversationId: conversation._id.toString(), messageId: message._id.toString() },
  })
}
```

- [ ] **Step 2: Manual smoke test against the real tenant DB**

```bash
ssh root@185.26.121.141 "grep '^MONGODB_URI' /var/www/crm-repair/.env | head -1"
```

(confirms the DB the route will actually hit once deployed — no local .env changes needed for
this step, this just documents the target). Full end-to-end verification happens in Task 8 once
both repos are deployed together — don't deploy this route standalone before Task 6 exists,
since there'd be no way to read the conversations it creates yet.

- [ ] **Step 3: Commit**

```bash
cd /Users/tom/Desktop/crm-repair
git add src/app/api/v1/chat/messages/route.ts
git commit -m "feat: add external POST/GET /api/v1/chat/messages for website chat widget"
```

---

### Task 3: Internal API — list conversations, thread, reply (crm-repair)

**Files:**
- Create: `/Users/tom/Desktop/crm-repair/src/app/api/inbox/conversations/route.ts`
- Create: `/Users/tom/Desktop/crm-repair/src/app/api/inbox/conversations/[id]/route.ts`
- Create: `/Users/tom/Desktop/crm-repair/src/app/api/inbox/conversations/[id]/reply/route.ts`

**Interfaces:**
- Consumes: `requireTenantRole(['owner', 'admin', 'manager'])`, `ok`, `err` from
  `@/lib/api-helpers` (destructures `{ session, models: { InboxConversation, InboxMessage } }`
  from Task 1's registered models).
- Produces: `GET /api/inbox/conversations` → `{ success: true, data: Array<{_id, visitorName, visitorPhone, lastMessageAt, unreadCount, status}> }`.
  `GET /api/inbox/conversations/[id]` → `{ success: true, data: { conversation, messages } }`, and
  marks it read (resets `unreadCount` to 0) as a side effect.
  `POST /api/inbox/conversations/[id]/reply` body `{ text: string }` → creates a staff
  `InboxMessage`, returns `{ success: true, data: message }`.

- [ ] **Step 1: List route**

`requireTenantRole()`'s `models` comes from `getModels()` — since Task 1 added
`InboxConversation`/`InboxMessage` to that function's return type, `models.InboxConversation` is
already correctly typed, no cast needed:

```typescript
import { NextResponse } from 'next/server'
import { requireTenantRole } from '@/lib/api-helpers'

export async function GET() {
  const result = await requireTenantRole(['owner', 'admin', 'manager'])
  if (result.error) return result.error
  const { models } = result

  const conversations = await models.InboxConversation.find({})
    .sort({ lastMessageAt: -1 })
    .limit(200)
    .lean()

  return NextResponse.json({ success: true, data: conversations })
}
```

- [ ] **Step 2: Thread route (get + mark read)**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireTenantRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantRole(['owner', 'admin', 'manager'])
  if (result.error) return result.error
  const { models } = result
  const { id } = await params

  const conversation = await models.InboxConversation.findById(id).lean()
  if (!conversation) {
    return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 })
  }

  const messages = await models.InboxMessage.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .lean()

  await models.InboxConversation.updateOne({ _id: id }, { $set: { unreadCount: 0 } })

  return NextResponse.json({ success: true, data: { conversation, messages } })
}
```

- [ ] **Step 3: Reply route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTenantRole } from '@/lib/api-helpers'

const ReplySchema = z.object({ text: z.string().min(1) })

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantRole(['owner', 'admin', 'manager'])
  if (result.error) return result.error
  const { models } = result
  const { id } = await params

  const body = await request.json().catch(() => null)
  const parsed = ReplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Укажите текст ответа' }, { status: 400 })
  }

  const conversation = await models.InboxConversation.findById(id)
  if (!conversation) {
    return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 })
  }

  const message = await models.InboxMessage.create({
    conversationId: id,
    author: 'staff',
    text: parsed.data.text,
  })

  conversation.lastMessageAt = new Date()
  await conversation.save()

  return NextResponse.json({ success: true, data: message })
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/tom/Desktop/crm-repair
git add src/app/api/inbox/conversations/route.ts src/app/api/inbox/conversations/[id]/route.ts src/app/api/inbox/conversations/[id]/reply/route.ts
git commit -m "feat: add internal /api/inbox conversation list/thread/reply routes"
```

---

### Task 4: "Создать заказ" from a conversation (crm-repair)

**Files:**
- Create: `/Users/tom/Desktop/crm-repair/src/app/api/inbox/conversations/[id]/convert-to-order/route.ts`

**Interfaces:**
- Consumes: `requireTenantRole`, the existing `POST /api/orders` route (self-fetch, reusing its
  validated creation logic rather than duplicating order-number/client-dedup/reception-field
  logic from `src/app/api/orders/route.ts:109-170`).
- Produces: `{ success: true, data: { orderId, orderNumber } }`; sets
  `InboxConversation.orderId`.

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireTenantRole } from '@/lib/api-helpers'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantRole(['owner', 'admin', 'manager'])
  if (result.error) return result.error
  const { models } = result
  const { id } = await params

  const conversation = await models.InboxConversation.findById(id)
  if (!conversation) {
    return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 })
  }
  if (conversation.orderId) {
    return NextResponse.json({ success: false, error: 'Заказ уже создан из этого диалога' }, { status: 400 })
  }

  const messages = await models.InboxMessage.find({ conversationId: id }).sort({ createdAt: 1 }).lean()
  const transcript = messages.map(m => `${m.author === 'visitor' ? conversation.visitorName : 'Сотрудник'}: ${m.text}`).join('\n')

  // Self-fetch the existing, already-validated order-creation endpoint instead of
  // duplicating its client-dedup/order-numbering/reception-field logic here.
  const createRes = await fetch(new URL('/api/orders', request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') ?? '',
    },
    body: JSON.stringify({
      type: 'repair',
      clientName: conversation.visitorName,
      clientPhone: conversation.visitorPhone,
      source: 'сайт (чат)',
      deviceType: 'Не указано (из чата)',
      defectDescription: transcript || 'Без сообщений',
    }),
  })

  const createData = await createRes.json()
  if (!createRes.ok || !createData.success) {
    return NextResponse.json({ success: false, error: createData.error ?? 'Не удалось создать заказ' }, { status: 502 })
  }

  conversation.orderId = createData.data._id
  await conversation.save()

  return NextResponse.json({
    success: true,
    data: { orderId: createData.data._id, orderNumber: createData.data.number },
  })
}
```

Confirmed against the current code: `POST /api/orders` ends with `return ok(order, 201)`
(`src/app/api/orders/route.ts:259`), and `ok<T>(data, status)` wraps as `{ success: true, data }`
— so `createData.data._id` and `createData.data.number` above are correct as written.

- [ ] **Step 2: Commit**

```bash
cd /Users/tom/Desktop/crm-repair
git add src/app/api/inbox/conversations/[id]/convert-to-order/route.ts
git commit -m "feat: add convert-to-order action from inbox conversation"
```

---

### Task 5: "Инбокс" dashboard page + nav (crm-repair)

**Files:**
- Create: `/Users/tom/Desktop/crm-repair/src/app/(dashboard)/inbox/page.tsx`
- Create: `/Users/tom/Desktop/crm-repair/src/app/(dashboard)/inbox/loading.tsx`
- Create: `/Users/tom/Desktop/crm-repair/src/app/(dashboard)/inbox/error.tsx`
- Modify: `/Users/tom/Desktop/crm-repair/src/components/layout/Sidebar.tsx`
- Modify: `/Users/tom/Desktop/crm-repair/src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `GET/POST` routes from Tasks 3–4. `useSession()` from `next-auth/react`, `useQuery`/
  `useMutation`/`useQueryClient` from `@tanstack/react-query` (same as `(dashboard)/chat/page.tsx`
  and `(dashboard)/tasks/page.tsx`), `cn` from `@/lib/utils`.

- [ ] **Step 1: `loading.tsx`** (copy of `(dashboard)/tasks/loading.tsx` verbatim)

```typescript
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )
}
```

- [ ] **Step 2: `error.tsx`** (mirrors `(dashboard)/tasks/error.tsx`)

```typescript
'use client'

export default function InboxError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground mb-3">Не удалось загрузить инбокс</p>
      <button type="button" onClick={reset} className="px-4 py-2 border rounded-lg text-sm">
        Повторить
      </button>
    </div>
  )
}
```

- [ ] **Step 3: `page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Conversation {
  _id: string
  visitorName: string
  visitorPhone?: string
  lastMessageAt: string
  unreadCount: number
  status: 'open' | 'closed'
  orderId?: string
}

interface InboxMessage {
  _id: string
  author: 'visitor' | 'staff'
  text: string
  createdAt: string
}

export default function InboxPage() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [text, setText] = useState('')

  const { data: conversations = [], isLoading: loadingList } = useQuery<Conversation[]>({
    queryKey: ['inbox', 'conversations'],
    queryFn: async () => {
      const res = await fetch('/api/inbox/conversations')
      const json = await res.json()
      return json.data
    },
    refetchInterval: 5000,
  })

  const { data: thread, isLoading: loadingThread } = useQuery<{ conversation: Conversation; messages: InboxMessage[] }>({
    queryKey: ['inbox', 'thread', activeId],
    queryFn: async () => {
      const res = await fetch(`/api/inbox/conversations/${activeId}`)
      const json = await res.json()
      return json.data
    },
    enabled: !!activeId,
    refetchInterval: 3000,
  })

  const replyMutation = useMutation({
    mutationFn: async (replyText: string) => {
      const res = await fetch(`/api/inbox/conversations/${activeId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      })
      return res.json()
    },
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['inbox', 'thread', activeId] })
      queryClient.invalidateQueries({ queryKey: ['inbox', 'conversations'] })
    },
  })

  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/inbox/conversations/${activeId}/convert-to-order`, { method: 'POST' })
      return res.json()
    },
    onSuccess: (json) => {
      if (json.success) window.location.href = `/orders/${json.data.orderId}`
    },
  })

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r overflow-y-auto">
        {loadingList ? (
          <div className="p-4 text-sm text-muted-foreground">Загрузка...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Нет диалогов</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={cn(
                'w-full text-left p-3 border-b hover:bg-gray-50',
                activeId === c._id && 'bg-blue-50'
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{c.visitorName}</span>
                {c.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2">{c.unreadCount}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.lastMessageAt).toLocaleString('ru-RU')}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <MessageCircle className="w-6 h-6 mr-2" /> Выберите диалог
          </div>
        ) : loadingThread ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            <div className="p-3 border-b flex justify-between items-center">
              <div>
                <div className="font-semibold">{thread?.conversation.visitorName}</div>
                {thread?.conversation.visitorPhone && (
                  <div className="text-xs text-muted-foreground">{thread.conversation.visitorPhone}</div>
                )}
              </div>
              {!thread?.conversation.orderId ? (
                <button
                  onClick={() => convertMutation.mutate()}
                  disabled={convertMutation.isPending}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"
                >
                  {convertMutation.isPending ? 'Создаю...' : 'Создать заказ'}
                </button>
              ) : (
                <a href={`/orders/${thread.conversation.orderId}`} className="text-sm text-blue-600 underline">
                  Открыть заказ
                </a>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {thread?.messages.map((m) => (
                <div key={m._id} className={cn('max-w-[70%] p-3 rounded-lg', m.author === 'staff' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100')}>
                  {m.text}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (text.trim()) replyMutation.mutate(text.trim())
              }}
              className="p-3 border-t flex gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ответ..."
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button type="submit" disabled={replyMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Register in the sidebar**

Edit `/Users/tom/Desktop/crm-repair/src/components/layout/Sidebar.tsx`. Add `MessageCircle` (or
another available icon — check the existing import block near the top of the file for icons
already imported and reuse `MessageCircle` since it's already imported for `'Чат'`) and add a
nav entry near the top-level items (not nested under "Управление" — this is a daily-use screen,
put it as a sibling of `{ label: 'Главная', href: '/dashboard', icon: Home }`):

```typescript
  { label: 'Инбокс', href: '/inbox', icon: MessageCircle },
```

- [ ] **Step 5: Register the page title**

Edit `/Users/tom/Desktop/crm-repair/src/components/layout/Header.tsx`, add next to the existing
`'/chat': 'Чат',` line:

```typescript
  '/inbox': 'Инбокс',
```

- [ ] **Step 6: Commit**

```bash
cd /Users/tom/Desktop/crm-repair
git add src/app/\(dashboard\)/inbox src/components/layout/Sidebar.tsx src/components/layout/Header.tsx
git commit -m "feat: add Инбокс dashboard page for website chat conversations"
```

---

### Task 6: servicebox-repair — re-point `/api/chat/messages` to the CRM

**Files:**
- Modify: `/Users/tom/Desktop/servicebox-repair/src/app/api/chat/messages/route.js`

**Interfaces:**
- Consumes: `process.env.CRM_API_URL`, `process.env.CRM_API_KEY` (already set in both
  `.env.production` files per this repo's `deployment.md` memory).
- Produces: same external contract the widget (`Chat.js`) already expects —
  `POST { sessionId, text, senderName, author }` and `GET ?sessionId=X&limit=100` returning
  `{ messages: [...] }`.

- [ ] **Step 1: Replace the route implementation**

```javascript
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId обязателен' }, { status: 400 });
  }

  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;
  if (!crmApiUrl || !crmApiKey) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  let crmRes;
  try {
    crmRes = await fetch(`${crmApiUrl}/api/v1/chat/messages?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${crmApiKey}` },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[chat/messages GET] CRM request failed:', err);
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  if (!crmRes.ok) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  const crmData = await crmRes.json();
  const messages = (crmData.data?.messages || []).map((m) => ({
    _id: m._id,
    author: m.author === 'staff' ? 'admin' : 'user',
    text: m.text,
    senderName: crmData.data?.conversation?.visitorName,
    createdAt: m.createdAt,
  }));

  return NextResponse.json({ messages, total: messages.length });
}

export async function POST(request) {
  const body = await request.json();
  const { sessionId, text, senderName } = body;

  if (!sessionId || !text?.trim()) {
    return NextResponse.json({ error: 'sessionId и text обязательны' }, { status: 400 });
  }

  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;
  if (!crmApiUrl || !crmApiKey) {
    return NextResponse.json({ error: 'Чат временно недоступен' }, { status: 503 });
  }

  let crmRes;
  try {
    crmRes = await fetch(`${crmApiUrl}/api/v1/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${crmApiKey}`,
      },
      body: JSON.stringify({ sessionId, visitorName: senderName || 'Гость', text: text.trim() }),
    });
  } catch (err) {
    console.error('[chat/messages POST] CRM request failed:', err);
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  if (!crmRes.ok) {
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 503 });
  }

  const crmData = await crmRes.json();
  return NextResponse.json({ message: 'Отправлено', data: crmData.data });
}
```

- [ ] **Step 2: Manual check (after Tasks 1-3 are deployed to crm-repair)**

```bash
curl -s -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-session-1","text":"тестовое сообщение","senderName":"Тест","author":"user"}'
```

Expected: `{"message":"Отправлено","data":{...}}`, and the conversation shows up under
`GET https://service-box-35.ru/api/inbox/conversations` (via the CRM's own logged-in session, not this
curl — API-key auth only covers the `v1` route).

- [ ] **Step 3: Commit**

```bash
cd /Users/tom/Desktop/servicebox-repair
git add src/app/api/chat/messages/route.js
git commit -m "feat: proxy site chat widget through CRM inbox instead of local storage"
```

---

### Task 7: servicebox-repair — remove Chatwoot and the unfinished bespoke chat

**Files:**
- Modify: `/Users/tom/Desktop/servicebox-repair/src/app/layout.js` (remove `ChatwootScript`
  import and `<ChatwootScript />` usage — confirmed at import line 4 and render line 160 per
  earlier server inspection; re-check exact line numbers with
  `grep -n "ChatwootScript" src/app/layout.js` before editing, since this repo's `layout.js` may
  have shifted since that check).
- Delete: `/Users/tom/Desktop/servicebox-repair/src/components/ChatwootScript/`
- Delete: `/Users/tom/Desktop/servicebox-repair/src/models/ChatMessage.js`,
  `src/models/ChatMessage 2.js`, `src/models/ChatMessage 3.js`
- Delete: `/Users/tom/Desktop/servicebox-repair/src/components/Admin/AdminChat/` (whole directory,
  including the `AdminChatPanel 2.js`/`3.js` and `.module 2.css`/`3.css` duplicate files)
- Delete: `/Users/tom/Desktop/servicebox-repair/src/app/admin-panel/chat/` (whole directory,
  including `page 2.js`/`page 3.js`)
- Delete: `/Users/tom/Desktop/servicebox-repair/src/app/api/chat/admin/` (whole directory,
  including `route 2.ts`/`route 3.ts`)
- Modify: `/Users/tom/Desktop/servicebox-repair/src/app/admin-panel/layout.js` — remove only the
  `{ href: '/admin-panel/chat', label: 'Чат', icon: '💬' }` nav line added in the still-staged,
  not-yet-committed diff for this file (leave the neighboring `{ href: '/admin-panel/analytics', ... }`
  line untouched — that's an unrelated feature). Confirm the exact current line with
  `git diff -- src/app/admin-panel/layout.js` before editing, since it's uncommitted work from
  earlier in this session, not yet in `HEAD`.

**Interfaces:** none (pure deletion/cleanup, no new interfaces).

- [ ] **Step 1: Remove ChatwootScript from the root layout**

```bash
grep -n "ChatwootScript" src/app/layout.js
```

Remove the matching `import ChatwootScript from '@/components/ChatwootScript/ChatwootScript'`
line and the `<ChatwootScript />` JSX usage line.

- [ ] **Step 2: Delete the files**

```bash
cd /Users/tom/Desktop/servicebox-repair
rm -rf src/components/ChatwootScript
rm -f "src/models/ChatMessage.js" "src/models/ChatMessage 2.js" "src/models/ChatMessage 3.js"
rm -rf src/components/Admin/AdminChat
rm -rf src/app/admin-panel/chat
rm -rf src/app/api/chat/admin
```

- [ ] **Step 3: Remove the `/admin-panel/chat` nav line**

```bash
git diff -- src/app/admin-panel/layout.js
```

Find the line `{ href: '/admin-panel/chat', label: 'Чат', icon: '💬' }` and delete it, leaving the
`/admin-panel/analytics` line directly above/below it untouched.

- [ ] **Step 4: Verify the app still builds/runs**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Expected: `200`, and no references to `Chat.js`'s old `/api/telegram/send` fire-and-forget call
remain dangling — check:

```bash
grep -rn "ChatwootScript\|AdminChatPanel\|admin-panel/chat\|api/chat/admin" src/ 2>/dev/null
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
cd /Users/tom/Desktop/servicebox-repair
git add -A src/components/ChatwootScript src/models/ChatMessage.js "src/models/ChatMessage 2.js" "src/models/ChatMessage 3.js" src/components/Admin/AdminChat src/app/admin-panel/chat src/app/api/chat/admin src/app/layout.js src/app/admin-panel/layout.js
git status --porcelain
```

**Before running `git commit`, re-check `git status --porcelain` against this task's file list —
this repo's index has chronically had unrelated staged files sweep into commits earlier in this
project (see `feedback-git-commits.md` memory); only commit the exact paths above.**

```bash
git commit -m "chore: remove Chatwoot widget and unfinished bespoke chat (superseded by CRM inbox)"
```

---

### Task 8: End-to-end verification

**Files:** none — manual verification only.

- [ ] **Step 1:** Open `https://servicebox35.ru/` in a browser, open the chat widget, enter a
  name, send a message.
- [ ] **Step 2:** Log into `https://service-box-35.ru` as the ServiceBox company owner, open «Инбокс»,
  confirm the conversation and message appear.
- [ ] **Step 3:** Reply from the CRM. Confirm the reply appears on the site widget within ~3.5s
  (its existing poll interval).
- [ ] **Step 4:** Click «Создать заказ» in the CRM inbox thread. Confirm it navigates to a new
  order pre-filled with the visitor's name/phone and the conversation transcript as the defect
  description, and that `InboxConversation.orderId` is now set (re-opening the same conversation
  shows "Открыть заказ" instead of the create button).
- [ ] **Step 5:** Confirm no Chatwoot widget appears anywhere on the site
  (`view-source:https://servicebox35.ru/` → search for `chatwoot`, expect zero matches).

---

## Self-Review Notes

- **Spec coverage:** Architecture (Tasks 6-7), data model (Task 1), API contract external (Task 2)
  and internal (Tasks 3-4), UI (Task 5), rollout order (Tasks 1→5 then 6→7), manual E2E (Task 8).
  "Создать лид" intentionally has no task — dropped from scope per the spec correction.
- **Placeholder scan:** No TBD/"add error handling"-style steps; Task 4's Step 1 has one explicit
  self-verification instruction (confirm `POST /api/orders`'s exact response field names before
  finalizing) rather than a vague placeholder — flagged because the plan author read that route's
  request-validation and creation logic but not its final response statement; the implementer
  must check this one field-name detail before treating Task 4 as done.
- **Type/name consistency:** `InboxConversation`/`InboxMessage` field names (`sessionId`,
  `visitorName`, `visitorPhone`, `unreadCount`, `orderId`, `conversationId`, `author`, `text`)
  are used identically across Tasks 1-6 — checked by re-reading each task's code against Task 1's
  schema before finalizing this plan.
