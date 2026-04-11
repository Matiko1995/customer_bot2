# DDD Service Split Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the current single Nuxt/Nitro application toward a DDD-aligned multi-service architecture by first separating tenant identity, knowledge indexing, agent runtime, and embed delivery responsibilities.

**Architecture:** Keep the current repository as a monorepo and introduce multiple NestJS services in phases, starting with tenant identity and knowledge indexing boundaries. Use project-level compatibility shims only as short-term migration aids and steadily move ownership, APIs, storage, and background jobs into service-specific apps.

**Tech Stack:** NestJS monorepo apps, TypeScript, PostgreSQL, pgvector, optional MySQL/PostgreSQL for tenant identity, Redis/RabbitMQ for async events, existing Nuxt frontend retained during migration

---

## File Structure

### Existing files to modify

- Modify: `package.json`
  Add monorepo workspace scripts for service apps and migration tasks.
- Modify: `README.md`
  Document service boundaries, local boot order, and migration state.
- Modify: `docs/superpowers/specs/2026-04-10-ddd-service-split-design.md`
  Keep design decisions updated during migration.

### New service roots to create

- Create: `services/tenant-identity-service/`
- Create: `services/knowledge-indexing-service/`
- Create: `services/agent-runtime-service/`
- Create: `services/embed-delivery-service/`
- Create: `packages/contracts/`
- Create: `packages/shared-config/`

### Current code to map and extract

- Extract from current repo to tenant identity:
  - `server/lib/auth.ts`
  - `server/lib/tenant-users.ts`
  - `server/lib/tenant-resolver.ts`
  - `server/lib/tenants.ts`
  - `server/api/admin/login.post.ts`
  - `server/api/admin/tenants*.ts`
  - `server/api/tenant/*.ts`
- Extract to knowledge indexing:
  - `server/lib/assets/*`
  - `server/lib/ingestion/*`
  - `server/lib/agent-docs/*`
  - `server/lib/db/*`
  - `server/lib/repositories/postgres-rag-repository.ts`
  - `server/api/admin/tenants/[tenantId]/sources*`
  - `server/api/admin/tenants/[tenantId]/jobs*`
- Extract to agent runtime:
  - `server/lib/chat.ts`
  - `server/lib/rag/*`
  - `src/llm-adapter.ts`
  - `server/api/chat.post.ts`
  - `server/api/contact.post.ts`
  - `server/lib/billing.ts`
- Extract to embed delivery:
  - `src/widget.ts`
  - `src/index.ts`
  - `src/iframe-host.ts`
  - `server/api/embed/config.get.ts`
  - `server/routes/customer-bot.js.get.ts`

## Task 1: Create monorepo service skeleton and shared contracts package

**Files:**
- Modify: `package.json`
- Create: `services/tenant-identity-service/package.json`
- Create: `services/knowledge-indexing-service/package.json`
- Create: `services/agent-runtime-service/package.json`
- Create: `services/embed-delivery-service/package.json`
- Create: `packages/contracts/package.json`
- Create: `packages/shared-config/package.json`

- [ ] **Step 1: Write the failing test**

Create a migration assertion script or test stub that expects service root folders and workspace scripts to exist.

- [ ] **Step 2: Run test to verify it fails**

Run a targeted verification script and confirm the service skeleton is missing.

- [ ] **Step 3: Write minimal implementation**

Add:

- workspace-aware scripts
- four service roots
- shared package roots for DTOs and config

- [ ] **Step 4: Run test to verify it passes**

Verify folders and scripts exist.

- [ ] **Step 5: Commit**

```bash
git add package.json services packages
git commit -m "chore: add ddd service monorepo skeleton"
```

## Task 2: Extract Tenant Identity bounded context first

**Files:**
- Create: `services/tenant-identity-service/src/*`
- Create: `packages/contracts/src/tenant/*`
- Modify: current Nuxt API gateway files that will proxy or adapt to the new service

- [ ] **Step 1: Write the failing test**

Write contract-level tests for:

- admin login
- tenant CRUD
- tenant user login
- ownership lookup

- [ ] **Step 2: Run test to verify it fails**

Confirm the service and contract endpoints do not exist.

- [ ] **Step 3: Write minimal implementation**

Move or re-implement:

- auth
- tenant CRUD
- tenant user auth
- password reset
- ownership metadata

- [ ] **Step 4: Run test to verify it passes**

Verify the tenant identity service responds and the current app can read from it through an adapter or proxy.

- [ ] **Step 5: Commit**

```bash
git add services/tenant-identity-service packages/contracts
git commit -m "feat: extract tenant identity service"
```

## Task 3: Extract Knowledge Indexing service

**Files:**
- Create: `services/knowledge-indexing-service/src/*`
- Create: `packages/contracts/src/indexing/*`
- Move logic currently under `server/lib/ingestion/*`, `server/lib/assets/*`, `server/lib/agent-docs/*`

- [ ] **Step 1: Write the failing test**

Write contract or verification coverage for:

- create source
- upload asset
- trigger sync
- list jobs
- read/write agent docs

- [ ] **Step 2: Run test to verify it fails**

Confirm the new service contracts are absent.

- [ ] **Step 3: Write minimal implementation**

Move:

- file storage
- webpage/IMAP/file source loaders
- normalize/chunk/embed/index
- sync jobs
- generated agent docs

- [ ] **Step 4: Run test to verify it passes**

Verify source/job/agent-doc flows work through the new service boundary.

- [ ] **Step 5: Commit**

```bash
git add services/knowledge-indexing-service packages/contracts
git commit -m "feat: extract knowledge indexing service"
```

## Task 4: Extract Agent Runtime service

**Files:**
- Create: `services/agent-runtime-service/src/*`
- Create: `packages/contracts/src/agent/*`
- Move logic currently under `server/lib/chat.ts`, `server/lib/rag/*`, and chat/contact APIs

- [ ] **Step 1: Write the failing test**

Write coverage for:

- structured answer path
- rag answer path
- general fallback path
- provenance persistence

- [ ] **Step 2: Run test to verify it fails**

Confirm agent runtime service contracts are absent.

- [ ] **Step 3: Write minimal implementation**

Move:

- query classification
- retrieval orchestration
- LLM fallback
- session/message handling
- usage provenance

- [ ] **Step 4: Run test to verify it passes**

Verify chat behavior matches the current contract through the new service.

- [ ] **Step 5: Commit**

```bash
git add services/agent-runtime-service packages/contracts
git commit -m "feat: extract agent runtime service"
```

## Task 5: Extract Embed Delivery service

**Files:**
- Create: `services/embed-delivery-service/src/*`
- Create: `packages/contracts/src/embed/*`
- Move widget delivery and public config logic

- [ ] **Step 1: Write the failing test**

Write coverage for:

- embed config
- embed key validation
- widget runtime delivery metadata

- [ ] **Step 2: Run test to verify it fails**

Confirm the embed delivery contracts do not yet exist.

- [ ] **Step 3: Write minimal implementation**

Move:

- public runtime config
- embed config API
- delivery projection logic

- [ ] **Step 4: Run test to verify it passes**

Verify a website embed can still bootstrap against the new boundary.

- [ ] **Step 5: Commit**

```bash
git add services/embed-delivery-service packages/contracts
git commit -m "feat: extract embed delivery service"
```

## Task 6: Replace direct module coupling with explicit contracts

**Files:**
- Create: shared DTOs, client libraries, or API gateway adapters under `packages/contracts/`
- Modify: Nuxt app integration points to call services through contracts

- [ ] **Step 1: Write the failing test**

Add tests that enforce the current frontend/admin app consumes service clients rather than internal server modules directly.

- [ ] **Step 2: Run test to verify it fails**

Confirm the current app is still directly coupled.

- [ ] **Step 3: Write minimal implementation**

Introduce:

- service client adapters
- DTO contracts
- config package for base URLs and auth headers

- [ ] **Step 4: Run test to verify it passes**

Verify the frontend and BFF layer now talk to service boundaries.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts packages/shared-config
git commit -m "refactor: replace direct coupling with service contracts"
```

## Task 7: Align database ownership with bounded contexts

**Files:**
- Create: service-specific database config and migration directories
- Modify: current repository implementations and bootstraps

- [ ] **Step 1: Write the failing test**

Add verification scripts that assert:

- tenant identity data is not written by indexing service
- indexing data is not owned by agent runtime
- agent runtime usage records are kept within runtime storage

- [ ] **Step 2: Run test to verify it fails**

Confirm mixed ownership still exists.

- [ ] **Step 3: Write minimal implementation**

Split storage responsibilities:

- identity DB
- indexing DB with pgvector
- runtime DB

- [ ] **Step 4: Run test to verify it passes**

Verify ownership separation with service-specific migration and repository checks.

- [ ] **Step 5: Commit**

```bash
git add services packages
git commit -m "refactor: align storage with bounded contexts"
```

## Task 8: Add queue-based indexing events

**Files:**
- Create: event publisher/consumer modules inside tenant identity and indexing services
- Create: queue integration config

- [ ] **Step 1: Write the failing test**

Add a contract test for:

- source-created event
- sync-requested event
- indexing-completed event

- [ ] **Step 2: Run test to verify it fails**

Confirm no queue-based event flow exists.

- [ ] **Step 3: Write minimal implementation**

Introduce queue-backed async communication for indexing lifecycle while keeping HTTP for direct admin/UI reads.

- [ ] **Step 4: Run test to verify it passes**

Verify events propagate correctly between services.

- [ ] **Step 5: Commit**

```bash
git add services
git commit -m "feat: add async indexing event flow"
```

## Task 9: Update operator documentation and migration guide

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-10-ddd-service-split-design.md`
- Create: `docs/superpowers/plans/2026-04-10-ddd-service-split-migration-tasklist.md`

- [ ] **Step 1: Document local boot order**

Document:

- service boot sequence
- env vars per service
- database responsibilities
- queue requirements

- [ ] **Step 2: Document migration state**

Document:

- what still lives in current Nuxt app
- what has been extracted
- temporary adapters or proxies

- [ ] **Step 3: Verification**

Run service-level verification commands and confirm documented steps are correct.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/superpowers/specs/2026-04-10-ddd-service-split-design.md docs/superpowers/plans/2026-04-10-ddd-service-split-migration-tasklist.md
git commit -m "docs: add ddd service split migration guide"
```

## Notes for Execution

- Do not split into four repositories immediately.
- Keep one monorepo until service boundaries are stable.
- Extract tenant identity first.
- Rename “training service” to “knowledge indexing service”.
- Do not let file lifecycle ownership drift into tenant identity.
- Use queue-based async flow only where it materially reduces coupling.
