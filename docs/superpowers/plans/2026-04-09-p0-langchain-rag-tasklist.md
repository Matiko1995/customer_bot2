# P0 LangChain RAG Tasklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前单项目 Nuxt/Nitro 应用内落地租户隔离的 `LangChain + RAG + Postgres/pgvector` 流水线，并保留 FAQ/价格直达与平台共享模型兜底。

**Architecture:** 新增 Postgres-backed ingestion 与 retrieval 子系统，现有 `/api/chat` 和租户后台继续保留。聊天链路改为 classify -> structured fast-path -> RAG -> shared fallback；资料链路改为 source -> sync job -> document -> chunk -> embedding -> vector retrieval。

**Tech Stack:** Nuxt 4, Nitro, TypeScript, Vitest, Postgres, pgvector, LangChain.js, IMAP client, document parsers

---

## File Structure

### Existing files to modify

- Modify: `package.json`
- Modify: `README.md`
- Modify: `types/index.ts`
- Modify: `server/lib/storage/types.ts`
- Modify: `server/lib/storage/index.ts`
- Modify: `server/lib/chat.ts`
- Modify: `server/api/chat.post.ts`
- Modify: `server/lib/billing.ts`
- Modify: `server/api/admin/billing.get.ts`
- Modify: `pages/admin/tenants/[tenantId].vue`
- Modify: `composables/useAdminApi.ts`
- Modify: `server/lib/ingestion/execute-job.ts`
- Modify: `tests/server/chat-api.test.ts`
- Modify: `tests/server/billing.test.ts`

### New files to create

- Create: `server/lib/db/client.ts`
- Create: `server/lib/db/run-migrations.ts`
- Create: `server/lib/db/migrations/0001_rag_core.sql`
- Create: `server/lib/db/migrations/0002_usage_provenance.sql`
- Create: `server/lib/repositories/rag-repository.ts`
- Create: `server/lib/repositories/postgres-rag-repository.ts`
- Create: `server/lib/assets/file-asset-store.ts`
- Create: `server/lib/ingestion/types.ts`
- Create: `server/lib/ingestion/jobs.ts`
- Create: `server/lib/ingestion/scheduler.ts`
- Create: `server/lib/ingestion/normalize-document.ts`
- Create: `server/lib/ingestion/chunk-document.ts`
- Create: `server/lib/ingestion/embed-chunks.ts`
- Create: `server/lib/ingestion/execute-job.ts`
- Create: `server/lib/ingestion/sources/webpage-source.ts`
- Create: `server/lib/ingestion/sources/file-source.ts`
- Create: `server/lib/ingestion/sources/imap-source.ts`
- Create: `server/lib/agent-docs/generate-agent-doc-bundle.ts`
- Create: `server/lib/agent-docs/render-agent-doc.ts`
- Create: `server/lib/rag/query-classifier.ts`
- Create: `server/lib/rag/structured-fast-path.ts`
- Create: `server/lib/rag/retriever.ts`
- Create: `server/lib/rag/build-context.ts`
- Create: `server/lib/rag/answer-chain.ts`
- Create: `server/lib/rag/fallback-chain.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources.get.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId].put.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId].delete.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId]/upload.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId]/sync.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/jobs.get.ts`
- Create: `server/api/admin/tenants/[tenantId]/jobs/[jobId]/retry.post.ts`
- Create: `components/admin/tenant-workspace/SourceLibraryPanel.vue`
- Create: `components/admin/tenant-workspace/SyncJobsPanel.vue`
- Create: `components/admin/tenant-workspace/IndexHealthPanel.vue`
- Create: `tests/server/db-migrations.test.ts`
- Create: `tests/server/rag-repository.test.ts`
- Create: `tests/server/file-source.test.ts`
- Create: `tests/server/webpage-source.test.ts`
- Create: `tests/server/imap-source.test.ts`
- Create: `tests/server/ingestion-execute-job.test.ts`
- Create: `tests/server/agent-docs.test.ts`
- Create: `tests/server/query-classifier.test.ts`

## Task 1: Add Postgres foundation and migrations

**Files:**
- Modify: `package.json`
- Create: `server/lib/db/client.ts`
- Create: `server/lib/db/run-migrations.ts`
- Create: `server/lib/db/migrations/0001_rag_core.sql`
- Create: `server/lib/db/migrations/0002_usage_provenance.sql`
- Test: `tests/server/db-migrations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(listMigrationFiles()).toEqual([
  '0001_rag_core.sql',
  '0002_usage_provenance.sql'
])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/db-migrations.test.ts`
Expected: FAIL because migration utilities do not exist.

- [ ] **Step 3: Write minimal implementation**

Add:

- Postgres client bootstrap
- migration runner
- `vector` extension enablement
- tables for `data_sources`, `ingestion_jobs`, `source_documents`, `document_chunks`
- usage provenance columns

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/db-migrations.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json server/lib/db server/lib/db/migrations tests/server/db-migrations.test.ts
git commit -m "feat: add rag database foundation"
```

## Task 2: Add RAG domain types and repository contract

**Files:**
- Modify: `types/index.ts`
- Modify: `server/lib/storage/types.ts`
- Modify: `server/lib/storage/index.ts`
- Create: `server/lib/repositories/rag-repository.ts`
- Create: `server/lib/repositories/postgres-rag-repository.ts`
- Test: `tests/server/rag-repository.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(sampleUsage.credentialSource).toBe('platform_shared')
expect(sampleCitation.documentId).toBe('doc-1')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/rag-repository.test.ts`
Expected: FAIL because new type shapes and repository contract do not exist.

- [ ] **Step 3: Write minimal implementation**

Add types for:

- `DataSourceRecord`
- `IngestionJobRecord`
- `SourceDocumentRecord`
- `DocumentChunkRecord`
- `CitationRecord`
- `AnswerSource`
- `CredentialSource`

Expose repository methods for source CRUD, job lifecycle, document upsert, chunk replacement, and tenant-scoped reads.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/rag-repository.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/index.ts server/lib/storage/types.ts server/lib/storage/index.ts server/lib/repositories tests/server/rag-repository.test.ts
git commit -m "feat: add rag repository contract"
```

## Task 3: Add file asset storage and parsers

**Files:**
- Create: `server/lib/assets/file-asset-store.ts`
- Create: `server/lib/ingestion/normalize-document.ts`
- Create: `server/lib/ingestion/sources/file-source.ts`
- Test: `tests/server/file-source.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(documents[0]?.contentText).toContain('SKU')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/file-source.test.ts`
Expected: FAIL because upload parsing does not exist.

- [ ] **Step 3: Write minimal implementation**

Support:

- Word paragraph extraction
- Excel sheet flattening
- CSV row normalization
- local asset storage under `.data/source-assets/`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/file-source.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/assets/file-asset-store.ts server/lib/ingestion/normalize-document.ts server/lib/ingestion/sources/file-source.ts tests/server/file-source.test.ts
git commit -m "feat: add file ingestion parsers"
```

## Task 4: Add website and IMAP ingestion adapters

**Files:**
- Create: `server/lib/ingestion/sources/webpage-source.ts`
- Create: `server/lib/ingestion/sources/imap-source.ts`
- Test: `tests/server/webpage-source.test.ts`
- Test: `tests/server/imap-source.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(Array.isArray(docs)).toBe(true)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/webpage-source.test.ts tests/server/imap-source.test.ts`
Expected: FAIL because the source adapters do not exist.

- [ ] **Step 3: Write minimal implementation**

Support:

- website crawl filters, text extraction, URL normalization
- IMAP polling, email body extraction, attachment handoff

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/webpage-source.test.ts tests/server/imap-source.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/ingestion/sources/webpage-source.ts server/lib/ingestion/sources/imap-source.ts tests/server/webpage-source.test.ts tests/server/imap-source.test.ts
git commit -m "feat: add webpage and imap ingestion"
```

## Task 5: Add chunking, embeddings, and ingestion execution

**Files:**
- Create: `server/lib/ingestion/types.ts`
- Create: `server/lib/ingestion/jobs.ts`
- Create: `server/lib/ingestion/chunk-document.ts`
- Create: `server/lib/ingestion/embed-chunks.ts`
- Create: `server/lib/ingestion/execute-job.ts`
- Test: `tests/server/ingestion-execute-job.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(result.chunkCount).toBeGreaterThan(0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/ingestion-execute-job.test.ts`
Expected: FAIL because the pipeline does not exist.

- [ ] **Step 3: Write minimal implementation**

Flow:

1. load source payload
2. normalize documents
3. split into chunks
4. embed chunks
5. replace source documents and chunks
6. mark job success or failure

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/ingestion-execute-job.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/ingestion/types.ts server/lib/ingestion/jobs.ts server/lib/ingestion/chunk-document.ts server/lib/ingestion/embed-chunks.ts server/lib/ingestion/execute-job.ts tests/server/ingestion-execute-job.test.ts
git commit -m "feat: add ingestion execution pipeline"
```

## Task 6: Add source management APIs and scheduler

**Files:**
- Create: `server/lib/ingestion/scheduler.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources.get.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId].put.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId].delete.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId]/upload.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/sources/[sourceId]/sync.post.ts`
- Create: `server/api/admin/tenants/[tenantId]/jobs.get.ts`
- Create: `server/api/admin/tenants/[tenantId]/jobs/[jobId]/retry.post.ts`
- Test: `tests/server/ingestion-execute-job.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(response.status).toBe('queued')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/ingestion-execute-job.test.ts`
Expected: FAIL because source admin APIs do not exist.

- [ ] **Step 3: Write minimal implementation**

Add:

- source CRUD
- file upload
- manual sync trigger
- job history
- failed-job retry
- in-process scheduled scan for due sources

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/ingestion-execute-job.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/ingestion/scheduler.ts server/api/admin/tenants tests/server/ingestion-execute-job.test.ts
git commit -m "feat: add source admin apis and scheduler"
```

## Task 7: Add Chinese agent documentation bundle generation

**Files:**
- Create: `server/lib/agent-docs/generate-agent-doc-bundle.ts`
- Create: `server/lib/agent-docs/render-agent-doc.ts`
- Modify: `server/lib/ingestion/execute-job.ts`
- Test: `tests/server/agent-docs.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(files).toEqual([
  'AGENTS.md',
  'BOOTSTRAP.md',
  'HEARTBEAT.md',
  'IDENTITY.md',
  'SOUL.md',
  'TOOLS.md',
  'USER.md'
])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/agent-docs.test.ts`
Expected: FAIL because agent doc generation does not exist.

- [ ] **Step 3: Write minimal implementation**

在资料导入 job 成功后，基于租户资料生成中文 markdown 文档包，落盘到：

- `.data/agent-docs/<tenantId>/latest/`

固定生成：

- `AGENTS.md`
- `BOOTSTRAP.md`
- `HEARTBEAT.md`
- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `TOOLS.md`

要求：

- 内容来自导入数据与租户配置
- 不允许跨租户混入内容
- 每次成功同步后覆盖更新

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/agent-docs.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/agent-docs/generate-agent-doc-bundle.ts server/lib/agent-docs/render-agent-doc.ts server/lib/ingestion/execute-job.ts tests/server/agent-docs.test.ts
git commit -m "feat: generate chinese agent doc bundle after sync"
```

## Task 8: Add query classification and structured fast-path

**Files:**
- Create: `server/lib/rag/query-classifier.ts`
- Create: `server/lib/rag/structured-fast-path.ts`
- Test: `tests/server/query-classifier.test.ts`
- Modify: `tests/server/chat-api.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(classifyQuery('这个产品多少钱')).toBe('price')
expect(classifyQuery('你们支持 IMAP 吗')).toBe('faq')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/query-classifier.test.ts tests/server/chat-api.test.ts`
Expected: FAIL because routing helpers do not exist.

- [ ] **Step 3: Write minimal implementation**

Rules:

- FAQ 优先 `knowledgeEntries`
- 价格问题只走 `products` / `consultingServices`
- 价格问题禁止自由生成
- 未分类成功再进入 document flow

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/query-classifier.test.ts tests/server/chat-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/rag/query-classifier.ts server/lib/rag/structured-fast-path.ts tests/server/query-classifier.test.ts tests/server/chat-api.test.ts
git commit -m "feat: add query classification and fast path"
```

## Task 9: Add tenant-scoped retrieval and grounded answer chain

**Files:**
- Create: `server/lib/rag/retriever.ts`
- Create: `server/lib/rag/build-context.ts`
- Create: `server/lib/rag/answer-chain.ts`
- Modify: `server/lib/chat.ts`
- Modify: `server/api/chat.post.ts`
- Modify: `tests/server/chat-api.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(result.answerSource).toBe('rag')
expect(result.citations.length).toBeGreaterThan(0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/chat-api.test.ts`
Expected: FAIL because chat does not return RAG metadata.

- [ ] **Step 3: Write minimal implementation**

The chat path should become:

1. classify
2. structured fast-path or retrieval
3. build citation context from chunks
4. grounded answer generation
5. save citations and retrieval confidence

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/chat-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/rag/retriever.ts server/lib/rag/build-context.ts server/lib/rag/answer-chain.ts server/lib/chat.ts server/api/chat.post.ts tests/server/chat-api.test.ts
git commit -m "feat: add tenant rag answer flow"
```

## Task 10: Add shared-platform fallback and usage provenance

**Files:**
- Create: `server/lib/rag/fallback-chain.ts`
- Modify: `server/lib/chat.ts`
- Modify: `server/lib/billing.ts`
- Modify: `server/api/admin/billing.get.ts`
- Modify: `tests/server/chat-api.test.ts`
- Modify: `tests/server/billing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(result.answerSource).toBe('general_fallback')
expect(result.credentialSource).toBe('platform_shared')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/server/chat-api.test.ts tests/server/billing.test.ts`
Expected: FAIL because fallback provenance is not tracked.

- [ ] **Step 3: Write minimal implementation**

Add:

- platform shared LLM env vars
- fallback only for non-price misses
- usage records with `answerSource` and `credentialSource`
- billing breakdown for tenant vs platform-shared usage

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/server/chat-api.test.ts tests/server/billing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/lib/rag/fallback-chain.ts server/lib/chat.ts server/lib/billing.ts server/api/admin/billing.get.ts tests/server/chat-api.test.ts tests/server/billing.test.ts
git commit -m "feat: add shared fallback and billing provenance"
```

## Task 11: Replace simulated training UI with source and index operations

**Files:**
- Modify: `pages/admin/tenants/[tenantId].vue`
- Modify: `composables/useAdminApi.ts`
- Create: `components/admin/tenant-workspace/SourceLibraryPanel.vue`
- Create: `components/admin/tenant-workspace/SyncJobsPanel.vue`
- Create: `components/admin/tenant-workspace/IndexHealthPanel.vue`

- [ ] **Step 1: Write the failing test**

```ts
expect('source controls visible').toBeTruthy()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/widget.test.ts`
Expected: FAIL because the tenant workspace still centers simulated training.

- [ ] **Step 3: Write minimal implementation**

Add:

- source list and create form
- upload action
- manual sync button
- job history
- index status panel

Keep JSON 编辑能力，但降级为人工兜底入口。

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/widget.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pages/admin/tenants/[tenantId].vue composables/useAdminApi.ts components/admin/tenant-workspace tests/widget.test.ts
git commit -m "feat: add source and index operations to tenant workspace"
```

## Task 12: Final verification and docs

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-09-p0-langchain-rag-design.md`

- [ ] **Step 1: Update operator docs**

Document:

- Postgres setup
- pgvector enablement
- migration command
- asset directory
- platform LLM env vars
- IMAP source setup
- sync workflow
- agent 文档包输出目录与文件说明

- [ ] **Step 2: Run targeted tests**

Run: `npx vitest run tests/server/db-migrations.test.ts tests/server/rag-repository.test.ts tests/server/file-source.test.ts tests/server/webpage-source.test.ts tests/server/imap-source.test.ts tests/server/ingestion-execute-job.test.ts tests/server/agent-docs.test.ts tests/server/query-classifier.test.ts tests/server/chat-api.test.ts tests/server/billing.test.ts`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Manual smoke checks**

Verify:

- source creation
- upload and sync
- IMAP pull
- 中文 agent 文档包生成
- citations returned
- price questions do not use fallback generation
- non-price misses use platform shared fallback
- billing shows provenance

- [ ] **Step 6: Commit**

```bash
git add README.md docs/superpowers/specs/2026-04-09-p0-langchain-rag-design.md
git commit -m "docs: finalize p0 rag rollout guide"
```

## Notes for Execution

- 先保留现有 `file-store` 兼容层，不要一刀切。
- `LangChain` 只负责编排与检索，不要吞掉业务策略。
- 所有检索都必须 tenant-scoped。
- 价格问题永远不能走通用生成兜底。
- 当前 `training-simulator` 目标是被真实 sync/index 流程替换。
- agent 文档包必须始终用中文生成，且在每次成功导入后刷新。
