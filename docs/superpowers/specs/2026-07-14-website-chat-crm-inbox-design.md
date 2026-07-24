# Website Chat → CRM Inbox Design

**Goal:** Replace the currently-live Chatwoot widget (perceived as unreliable, and its inbox isn't
actually monitored) with a purpose-built chat that lands directly in Tom's own CRM
(`https://service-box-35.ru`, a self-hosted multi-tenant SaaS he owns and operates — repo `crm-repair`
on a separate server), so client messages show up next to orders/leads instead of in a
disconnected third-party tool.

## Background

Two independent, partially-built chat systems already exist and neither is the answer:

- **Chatwoot** (`src/components/ChatwootScript/ChatwootScript.js`, wired into the root
  `layout.js`) is the only chat actually live on the site today. The SDK loads fine (verified:
  200 on both the script and the Chatwoot base URL), so the reported "clients can't reach us" is
  most likely a Chatwoot-side configuration/notification gap, not a code bug — moot either way
  since it's being replaced.
- A **bespoke chat rewrite** (`src/components/Chat/Chat.js`, `src/models/ChatMessage.js`,
  `src/components/Admin/AdminChat/AdminChatPanel.js`, `/admin-panel/chat`, `/api/chat/admin`,
  `/api/chat/messages`) was mostly built in a previous session but never wired into any live page
  and never committed. It also has sync-conflict duplicate files (`page 2.js`, `route 3.js`, etc.)
  that need cleanup regardless of what happens with the chat feature itself.

Separately, `crm-repair` (service-box-35.ru) is a real multi-tenant SaaS CRM for repair service
centers — subscriptions, multi-branch, YooKassa fiscal payments, warehouse, Telegram/MAX staff
bots, etc. — with its own `CLAUDE.md` documenting conventions. That document explicitly states:

> **MODULE: UNIFIED INBOX (Единый инбокс) — Not implemented.** No dialog/thread UI, no
> auto-reply, no "Создать заказ"/"Создать лид" from a dialog exists in code for any channel.

So this is a real, previously-scoped-but-unbuilt module in the CRM, not a workaround. This spec
builds the "website" channel of that module as an MVP — Telegram/MAX channels remain out of scope.

One correction found while digging into the "Создать лид" part of that quote: the CRM's
**Sales Funnel (Воронка продаж) module — which "Создать лид" would target — doesn't actually
exist either**, despite `CLAUDE.md` describing it in full (stages, kanban, manager assignment) as
if it were built. There's no `Lead` model anywhere in the codebase, and `/funnel` is a 62-line
stub that just renders `/api/stats`. So `CLAUDE.md` is accurate about the Inbox being unbuilt but
optimistic about the Funnel. "Создать лид" is dropped from this spec's scope as a result — see
Out of Scope.

The site already talks to this CRM for order tracking (`src/app/api/tracking/search/route.js`),
via `CRM_API_URL`/`CRM_API_KEY` env vars, hitting `https://service-box-35.ru/api/v1/orders` with a
`Bearer` token. The CRM resolves that API key to a `Company` and its own isolated tenant MongoDB
database (`getTenantConnection(company.dbName)`, not just a shared DB with a `companyId` filter).
The new chat feature follows this exact same, already-proven pattern.

## Architecture

```
Site visitor (widget: anonymous or name-captured)
        │  POST/GET /api/chat/messages   (servicebox-repair — existing route, re-pointed)
        ▼
servicebox-repair backend
        │  Authorization: Bearer CRM_API_KEY → https://service-box-35.ru/api/v1/chat/...
        ▼
CRM service-box-35.ru (Servicebox's own isolated tenant DB)
        │  stores conversation/messages, sends push notification to the owner
        ▼
"Инбокс" section in the CRM (list → thread → reply → "Создать заказ")
        │  staff reply flows back through the same path in reverse
        ▼
Widget on the site (polls ~3.5s, same as today) shows the reply
```

`CRM_API_KEY` never reaches the browser — only the site's own backend holds it, exactly like the
existing tracking integration. The Chatwoot script is removed from the site entirely.

**Accepted reliability tradeoff:** chat now depends on both servicebox-repair *and* the CRM being
up, with no local fallback store on the site — if the CRM is unreachable, the widget shows a
"couldn't send, try again" error rather than queuing locally. This avoids dual-write/sync
complexity between two independently-hosted stores; if that turns out to be too fragile in
practice, adding a local retry queue is a contained follow-up, not a rearchitecture.

## Data Model (new, in `crm-repair`, tenant-scoped like `Order`/`Client`)

Added to the existing `getModels(conn)` registry (`src/lib/models.ts`), not reusing the existing
`ChatRoom`/`ChatMessage` models — those serve a different concern (internal staff chat and
inter-company marketplace chat, with their own `scope: global/internal/inter_org` semantics that
don't fit a customer-facing inbox).

**`InboxConversation`**
- `sessionId` (string, matches the browser-generated id the widget already keeps in
  `localStorage`)
- `visitorName` (string, captured by the widget before the first message, same UX as today)
- `visitorPhone` (string, optional)
- `channel` (`'website'` — the only value for this MVP; field exists so Telegram/MAX can join
  the same inbox later without a schema change)
- `status` (`'open' | 'closed'`)
- `lastMessageAt` (Date)
- `unreadCount` (number, staff-facing)
- `orderId` (optional ref, set once converted via the "Создать заказ" button below)

**`InboxMessage`**
- `conversationId` (ref `InboxConversation`)
- `author` (`'visitor' | 'staff'`)
- `text` (string)
- `createdAt` (Date)

## API Contract

**External, in `crm-repair`** (same auth as `/api/v1/orders`: `validateCompanyApiKey()` →
`getTenantConnection(company.dbName)` → `getModels(conn)`):
- `POST /api/v1/chat/messages` — body `{ sessionId, visitorName, text }`. Creates the
  conversation on first message for a given `sessionId`, else appends; triggers a push
  notification via the existing `lib/push.ts`/`lib/notify.ts`.
- `GET /api/v1/chat/messages?sessionId=...` — returns the conversation's messages, for the
  widget's poll.
- Rate-limited the same way `/api/tracking/search/route.js` rate-limits by IP, to block spam.

**Internal, in `crm-repair`** (normal staff session, not API-key):
- `GET /api/inbox/conversations` — list, sorted by `lastMessageAt`.
- `GET /api/inbox/conversations/[id]/messages`
- `POST /api/inbox/conversations/[id]/reply`
- `POST /api/inbox/conversations/[id]/convert-to-order` — pre-fills a new Order from
  `visitorName`/`visitorPhone`/first message text.

**In `servicebox-repair`** (unchanged surface, re-pointed implementation):
- `POST/GET /api/chat/messages` — the widget's existing contract stays the same; the
  implementation switches from writing to the local `ChatMessage` Mongoose model to proxying to
  the CRM's `/api/v1/chat/messages` with the server-held `CRM_API_KEY`.

## UI

- **CRM "Инбокс"** (`/(dashboard)/inbox`): two-pane — conversation list (name, last-message
  preview, unread badge) on the left, thread + reply box on the right, with a "Создать заказ"
  button above the thread. Largely a TypeScript/RSC port of the already-built
  (uncommitted) `AdminChatPanel.js` from servicebox-repair, adapted to the CRM's data and
  conventions (RSC by default, `error.tsx`/`loading.tsx` per route segment, per the CRM's own
  `CLAUDE.md`).
- **Site widget**: visually unchanged from today's `Chat.js` — name-capture modal, bubble,
  polling. Only its backend target changes.

## Rollout Order

1. `crm-repair`: `InboxConversation`/`InboxMessage` models, `/api/v1/chat/*`, `/api/inbox/*`,
   the "Инбокс" dashboard page, push notification wiring.
2. `servicebox-repair`: re-point `/api/chat/messages` to proxy to the CRM; remove
   `ChatwootScript` (component + its import in `layout.js`) and the unfinished/uncommitted
   bespoke chat (`ChatMessage.js` model, `AdminChatPanel`, `/admin-panel/chat`, `/api/chat/admin`)
   including its duplicate sync-conflict files.
3. Manual end-to-end check: send from the site widget → see it in the CRM inbox → reply from the
   CRM → see the reply on the site → "Создать заказ" produces a correctly pre-filled order.

## Testing

- `servicebox-repair` has no test suite today; not adding one solely for this feature, consistent
  with the rest of the codebase.
- `crm-repair` has vitest/Playwright already configured — new API routes get a focused unit test
  on `validateCompanyApiKey` handling and conversation creation, per that project's existing
  convention.

## Out of Scope

- **"Создать лид" / Sales Funnel module.** No `Lead` model or real pipeline exists in the CRM
  today (see the correction in Background) — building it is a separate project. Only "Создать
  заказ" ships in this MVP.
- Telegram/MAX as additional Инбокс channels (the `channel` field is added now so this doesn't
  require a schema migration later, but building those channels is separate work).
- A local durable message queue on the site for CRM-downtime resilience (see the accepted
  tradeoff above) — revisit only if it proves to actually be a problem in practice.
- Any visual redesign of the widget itself.
