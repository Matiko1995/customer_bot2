# SaaS Customer Bot MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a paid-trial SaaS MVP for the customer bot with real tenant isolation, server-side chat handling, token-based usage billing, and an internal admin backend for operations.

**Architecture:** Keep the current Nuxt app as the unified frontend and admin shell, but move runtime chat orchestration to server APIs. Store tenant config, chat sessions, leads, and usage records in a server-side persistence layer with a clean repository boundary so the initial MVP can use file-backed storage or simple DB-backed storage without rewriting business logic.

**Tech Stack:** Nuxt 4, Vue 3, Nitro server APIs, TypeScript, Vitest, existing widget/embed code, server-side LLM adapter integration

---

## File Structure

### Existing files to modify

- Modify: `types/index.ts`
  Add tenant, session, lead, usage, billing, and admin-facing domain types.
- Modify: `src/widget.ts`
  Change embed runtime to load tenant config from backend and send chat requests to backend instead of direct browser-to-LLM calls.
- Modify: `src/llm-adapter.ts`
  Support server-side usage capture and normalized response payloads that include token counts.
- Modify: `components/AiSupportWidget.vue`
  Convert demo widget behavior from local-only data access to tenant-backed runtime APIs where appropriate.
- Modify: `server/api/contact.post.ts`
  Rework to persist leads under tenant/session context instead of returning a stub success only.
- Modify: `tests/widget.test.ts`
  Cover tenant-backed widget boot flow and server-chat submission wiring.
- Modify: `tests/llm-adapter.test.ts`
  Cover usage extraction and fallback behavior with usage metadata.

### New server domain files

- Create: `server/lib/storage/types.ts`
  Shared persistence interfaces for tenants, sessions, messages, leads, and usage records.
- Create: `server/lib/storage/memory-store.ts`
  MVP persistence adapter for local development and tests.
- Create: `server/lib/storage/index.ts`
  Storage factory and singleton access point.
- Create: `server/lib/tenants.ts`
  Tenant resolution, embed key lookup, status checks.
- Create: `server/lib/chat.ts`
  Chat session orchestration, message persistence, LLM call flow, usage recording.
- Create: `server/lib/billing.ts`
  Monthly aggregation helpers and billing summary calculation.
- Create: `server/lib/auth.ts`
  Minimal admin authentication guard for internal backend pages and APIs.

### New server APIs

- Create: `server/api/embed/config.get.ts`
  Return runtime widget config for a tenant.
- Create: `server/api/chat.post.ts`
  Accept user messages, continue/create sessions, call LLM, persist history and usage.
- Create: `server/api/admin/login.post.ts`
  Minimal admin login entry point.
- Create: `server/api/admin/tenants.get.ts`
  List tenants for admin pages.
- Create: `server/api/admin/tenants.post.ts`
  Create tenants.
- Create: `server/api/admin/tenants/[tenantId].get.ts`
  Return one tenant and related config.
- Create: `server/api/admin/tenants/[tenantId].put.ts`
  Update tenant config.
- Create: `server/api/admin/chats.get.ts`
  List sessions/messages by tenant and time range.
- Create: `server/api/admin/leads.get.ts`
  List lead submissions by tenant and time range.
- Create: `server/api/admin/billing.get.ts`
  Return billing summaries and usage detail by tenant/month.

### New frontend/admin files

- Create: `pages/admin/login.vue`
  Internal admin login page.
- Create: `pages/admin/index.vue`
  Redirect or simple admin home.
- Create: `pages/admin/tenants.vue`
  Tenant list page.
- Create: `pages/admin/tenants/[tenantId].vue`
  Tenant configuration page.
- Create: `pages/admin/chats.vue`
  Chat records page.
- Create: `pages/admin/leads.vue`
  Lead records page.
- Create: `pages/admin/billing.vue`
  Billing page.
- Create: `composables/useAdminApi.ts`
  Shared admin API fetch helper.

### New tests

- Create: `tests/server/embed-config.test.ts`
  Tenant config API behavior.
- Create: `tests/server/chat-api.test.ts`
  Session creation, message persistence, usage recording.
- Create: `tests/server/billing.test.ts`
  Monthly usage aggregation behavior.
- Create: `tests/server/tenant-admin.test.ts`
  Tenant CRUD behavior.
- Create: `tests/server/contact-api.test.ts`
  Lead persistence under tenant/session context.

## Chunk 1: Domain Model and Persistence Skeleton

### Task 1: Add SaaS domain types

**Files:**
- Modify: `types/index.ts`
- Test: `tests/server/billing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import type { BillingSummary } from '../../types'

describe('billing summary type shape', () => {
  it('supports tenant monthly totals', () => {
    const summary: BillingSummary = {
      tenantId: 'tenant-1',
      month: '2026-03',
      inputTokens: 1200,
      outputTokens: 800,
      totalTokens: 2000,
      amount: 12.34
    }

    expect(summary.totalTokens).toBe(2000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/billing.test.ts`
Expected: FAIL because `BillingSummary` or related types do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add exact types for:

- `TenantRecord`
- `AdminUserRecord`
- `ChatSessionRecord`
- `ChatMessageRecord`
- `LeadRecord`
- `LlmUsageRecord`
- `BillingSummary`
- `RuntimeWidgetConfig`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/billing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/index.ts tests/server/billing.test.ts
git commit -m "feat: add saas domain types"
```

### Task 2: Add storage interfaces and in-memory store

**Files:**
- Create: `server/lib/storage/types.ts`
- Create: `server/lib/storage/memory-store.ts`
- Create: `server/lib/storage/index.ts`
- Test: `tests/server/tenant-admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'

describe('memory store', () => {
  it('creates and returns tenants by id', async () => {
    const store = createMemoryStore()
    await store.saveTenant({ id: 'tenant-1', name: 'Tenant 1', status: 'active' })

    const tenant = await store.getTenantById('tenant-1')
    expect(tenant?.name).toBe('Tenant 1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: FAIL because storage files do not exist.

- [ ] **Step 3: Write minimal implementation**

Implement repository methods for:

- tenants
- sessions
- messages
- leads
- usage records

Use in-memory arrays/maps first to keep tests green and interfaces stable.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/storage/types.ts server/lib/storage/memory-store.ts server/lib/storage/index.ts tests/server/tenant-admin.test.ts
git commit -m "feat: add mvp storage layer"
```

## Chunk 2: Tenant Runtime and Server-Side Chat

### Task 3: Add tenant config resolution API

**Files:**
- Create: `server/lib/tenants.ts`
- Create: `server/api/embed/config.get.ts`
- Test: `tests/server/embed-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getRuntimeConfigForTenant } from '../../server/lib/tenants'

describe('tenant runtime config', () => {
  it('returns active tenant widget config', async () => {
    const result = await getRuntimeConfigForTenant('tenant-1')
    expect(result.tenantId).toBe('tenant-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/embed-config.test.ts`
Expected: FAIL because tenant resolver does not exist.

- [ ] **Step 3: Write minimal implementation**

Resolver behavior:

- load tenant by id or embed key
- reject missing tenants
- reject disabled tenants for chat runtime
- return runtime-safe config only

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/embed-config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/tenants.ts server/api/embed/config.get.ts tests/server/embed-config.test.ts
git commit -m "feat: add tenant runtime config api"
```

### Task 4: Add server-side chat orchestration

**Files:**
- Create: `server/lib/chat.ts`
- Create: `server/api/chat.post.ts`
- Modify: `src/llm-adapter.ts`
- Test: `tests/server/chat-api.test.ts`
- Test: `tests/llm-adapter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { processChatMessage } from '../../server/lib/chat'

describe('chat service', () => {
  it('creates a session, stores messages, and records usage', async () => {
    const result = await processChatMessage({
      tenantId: 'tenant-1',
      message: '你好'
    })

    expect(result.reply).toBeTruthy()
    expect(result.sessionId).toBeTruthy()
    expect(result.usage.totalTokens).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/chat-api.test.ts tests/llm-adapter.test.ts`
Expected: FAIL because chat service and usage-aware adapter behavior do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement:

- session create/continue
- recent history load
- server-side LLM call
- reply persistence
- usage record persistence
- fallback path with explicit status when usage is unknown or failed

Update `src/llm-adapter.ts` to normalize:

- `reply`
- `inputTokens`
- `outputTokens`
- `totalTokens`
- `model`
- `status`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/chat-api.test.ts tests/llm-adapter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/chat.ts server/api/chat.post.ts src/llm-adapter.ts tests/server/chat-api.test.ts tests/llm-adapter.test.ts
git commit -m "feat: add server side chat and usage tracking"
```

### Task 5: Rewire widget runtime to backend chat APIs

**Files:**
- Modify: `src/widget.ts`
- Modify: `components/AiSupportWidget.vue`
- Test: `tests/widget.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('loads tenant config and sends messages to backend chat api', async () => {
  // boot widget with tenant id
  // assert config fetch occurs
  // assert chat submission hits /api/chat
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/widget.test.ts`
Expected: FAIL because widget still uses local demo data or direct LLM flow.

- [ ] **Step 3: Write minimal implementation**

Widget behavior for MVP:

- accept `tenantId` or `embedKey`
- fetch runtime config from `/api/embed/config`
- send user messages to `/api/chat`
- keep browser-local history only as UX cache
- use backend session id for continuity

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/widget.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/widget.ts components/AiSupportWidget.vue tests/widget.test.ts
git commit -m "feat: connect widget to tenant backend apis"
```

## Chunk 3: Leads and Billing

### Task 6: Persist leads under tenant/session context

**Files:**
- Modify: `server/api/contact.post.ts`
- Test: `tests/server/contact-api.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import contactHandler from '../../server/api/contact.post'

describe('contact api', () => {
  it('stores a lead with tenant and session context', async () => {
    // invoke handler with tenantId + sessionId + lead body
    // assert persisted lead belongs to tenant
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/contact-api.test.ts`
Expected: FAIL because contact API does not persist tenant-scoped leads yet.

- [ ] **Step 3: Write minimal implementation**

Required behavior:

- validate required lead fields
- require `tenantId`
- accept optional `sessionId`
- persist to store
- return success payload with stored lead id

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/contact-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/contact.post.ts tests/server/contact-api.test.ts
git commit -m "feat: persist tenant lead records"
```

### Task 7: Add billing aggregation helpers and API

**Files:**
- Create: `server/lib/billing.ts`
- Create: `server/api/admin/billing.get.ts`
- Test: `tests/server/billing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { buildMonthlyBillingSummary } from '../../server/lib/billing'

describe('billing aggregation', () => {
  it('groups usage records by tenant and month', () => {
    const result = buildMonthlyBillingSummary([
      {
        tenantId: 'tenant-1',
        createdAt: 1771000000000,
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        amount: 1.5,
        status: 'success'
      }
    ])

    expect(result[0]?.amount).toBe(1.5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/billing.test.ts`
Expected: FAIL because aggregation helper does not exist.

- [ ] **Step 3: Write minimal implementation**

Rules:

- include only successful usage in bill totals by default
- preserve unknown/failed records for detail views
- compute month key using server-local UTC or explicitly documented timezone rule

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/billing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/billing.ts server/api/admin/billing.get.ts tests/server/billing.test.ts
git commit -m "feat: add monthly billing summaries"
```

## Chunk 4: Internal Admin Backend

### Task 8: Add minimal admin auth

**Files:**
- Create: `server/lib/auth.ts`
- Create: `server/api/admin/login.post.ts`
- Create: `pages/admin/login.vue`

- [ ] **Step 1: Write the failing test**

```ts
it('rejects invalid admin credentials', async () => {
  // call login handler with wrong password and expect unauthorized
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: FAIL because admin auth is missing.

- [ ] **Step 3: Write minimal implementation**

MVP behavior:

- hardcoded env-backed admin credentials or seeded admin record
- session cookie for admin pages
- guard helper for admin APIs

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/auth.ts server/api/admin/login.post.ts pages/admin/login.vue tests/server/tenant-admin.test.ts
git commit -m "feat: add admin auth"
```

### Task 9: Add tenant CRUD admin pages and APIs

**Files:**
- Create: `server/api/admin/tenants.get.ts`
- Create: `server/api/admin/tenants.post.ts`
- Create: `server/api/admin/tenants/[tenantId].get.ts`
- Create: `server/api/admin/tenants/[tenantId].put.ts`
- Create: `pages/admin/index.vue`
- Create: `pages/admin/tenants.vue`
- Create: `pages/admin/tenants/[tenantId].vue`
- Create: `composables/useAdminApi.ts`
- Test: `tests/server/tenant-admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('creates and updates a tenant through admin apis', async () => {
  // create tenant
  // update tenant config
  // assert persisted values
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: FAIL because tenant admin APIs are missing.

- [ ] **Step 3: Write minimal implementation**

Include:

- tenant list
- tenant create
- tenant edit
- embed key display
- system prompt and contact settings

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/tenant-admin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/admin/tenants.get.ts server/api/admin/tenants.post.ts server/api/admin/tenants/[tenantId].get.ts server/api/admin/tenants/[tenantId].put.ts pages/admin/index.vue pages/admin/tenants.vue pages/admin/tenants/[tenantId].vue composables/useAdminApi.ts tests/server/tenant-admin.test.ts
git commit -m "feat: add tenant admin management"
```

### Task 10: Add admin views for chats, leads, and billing

**Files:**
- Create: `server/api/admin/chats.get.ts`
- Create: `server/api/admin/leads.get.ts`
- Create: `pages/admin/chats.vue`
- Create: `pages/admin/leads.vue`
- Create: `pages/admin/billing.vue`
- Test: `tests/server/chat-api.test.ts`
- Test: `tests/server/contact-api.test.ts`
- Test: `tests/server/billing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('returns tenant-filtered billing, chat, and lead views', async () => {
  // seed records for two tenants
  // assert admin APIs return only requested tenant data
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/chat-api.test.ts tests/server/contact-api.test.ts tests/server/billing.test.ts`
Expected: FAIL because admin read APIs and pages are incomplete.

- [ ] **Step 3: Write minimal implementation**

Expose:

- tenant-filtered session/message listing
- tenant-filtered lead listing
- tenant/month billing summary and detail listing

Keep pages simple table-first UIs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/chat-api.test.ts tests/server/contact-api.test.ts tests/server/billing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/admin/chats.get.ts server/api/admin/leads.get.ts pages/admin/chats.vue pages/admin/leads.vue pages/admin/billing.vue tests/server/chat-api.test.ts tests/server/contact-api.test.ts tests/server/billing.test.ts
git commit -m "feat: add admin operations views"
```

## Chunk 5: End-to-End Verification

### Task 11: Run full verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-03-20-saas-customer-bot-mvp-design.md`

- [ ] **Step 1: Add/update operator documentation**

Document:

- required env vars
- admin login flow
- tenant creation flow
- embed usage
- billing assumptions

- [ ] **Step 2: Run test suite**

Run: `npm test`
Expected: PASS with all existing and new tests green.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS with successful output artifact generation.

- [ ] **Step 4: Manual smoke checks**

Run app locally and verify:

- admin login works
- tenant creation works
- embed config loads
- chat creates usage rows
- leads appear in admin
- billing totals update

- [ ] **Step 5: Commit**

```bash
git add README.md docs/superpowers/specs/2026-03-20-saas-customer-bot-mvp-design.md
git commit -m "docs: finalize saas mvp operator guidance"
```

## Notes for Execution

- Keep TDD strict: every task starts red, then minimal green, then refactor.
- Do not add payment integration in this plan.
- Do not add tenant self-service in this plan.
- Keep pricing global and explicit.
- Keep admin UI table-first and operational, not decorative.
- Prefer simple persistence interfaces first; swap backing storage later if needed.
