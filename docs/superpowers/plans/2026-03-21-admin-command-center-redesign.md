# Admin Command Center Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the admin backend into an operations-first command center with a real `/admin` dashboard and a tabbed tenant workspace.

**Architecture:** Keep the current Nuxt admin pages and server APIs, but add one lightweight overview aggregation path and reorganize the tenant detail UI into tabs. Preserve existing operational features while changing navigation and layout hierarchy.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Nitro server APIs, Vitest

---

## File Structure

- Modify: `pages/admin/index.vue`
  Replace redirect with a command center dashboard.
- Modify: `pages/admin/tenants/[tenantId].vue`
  Refactor the long stacked tenant page into a tabbed workspace.
- Modify: `pages/admin/tenants/index.vue`
  Reframe the tenant list into a queue-oriented page.
- Create: `lib/admin-overview.ts`
  Aggregate dashboard metrics from tenants, sessions, leads, usage, and content hit stats.
- Create: `server/api/admin/overview.get.ts`
  Return command center data.
- Create: `tests/admin-overview.test.ts`
  Cover dashboard aggregation logic.
- Modify: `README.md`
  Record the new admin structure and capabilities.

## Chunk 1: Dashboard Aggregation

### Task 1: Add failing test for admin overview aggregation

**Files:**
- Create: `tests/admin-overview.test.ts`
- Create: `lib/admin-overview.ts`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `npm test -- tests/admin-overview.test.ts` and verify FAIL**
- [ ] **Step 3: Implement minimal overview aggregation**
- [ ] **Step 4: Re-run `npm test -- tests/admin-overview.test.ts` and verify PASS**

## Chunk 2: `/admin` Command Center

### Task 2: Build the command center page

**Files:**
- Modify: `pages/admin/index.vue`
- Create: `server/api/admin/overview.get.ts`

- [ ] **Step 1: Add dashboard data loading to `/admin`**
- [ ] **Step 2: Replace redirect with KPI, priority queue, and alerts layout**
- [ ] **Step 3: Keep navigation into tenants, chats, leads, and billing**
- [ ] **Step 4: Run targeted build/tests if needed**

## Chunk 3: Tenant Workspace

### Task 3: Turn tenant detail into tabs

**Files:**
- Modify: `pages/admin/tenants/[tenantId].vue`

- [ ] **Step 1: Introduce workspace tabs**
- [ ] **Step 2: Group existing modules into Overview / Content Ops / Conversation Trace / Commercial / Install & Config**
- [ ] **Step 3: Add a stronger summary header and quick links**
- [ ] **Step 4: Preserve current save and content-management behavior**

## Chunk 4: Tenant Queue

### Task 4: Reframe tenants list as an operations queue

**Files:**
- Modify: `pages/admin/tenants/index.vue`

- [ ] **Step 1: Move from plain table page to queue-style layout**
- [ ] **Step 2: Keep create-tenant flow available but secondary**
- [ ] **Step 3: Highlight status and navigation into tenant workspaces**

## Chunk 5: Verification and Docs

### Task 5: Update docs and verify

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Record the command center structure in docs**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run build`**

Plan complete and saved to `docs/superpowers/plans/2026-03-21-admin-command-center-redesign.md`. Ready to execute.
