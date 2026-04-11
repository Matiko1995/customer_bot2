# DDD Service Split Design

Date: 2026-04-10

## Goal

Refactor the current single Nuxt/Nitro application into a domain-driven multi-service architecture while preserving the current SaaS customer bot product direction:

- tenant isolation
- agent runtime
- knowledge ingestion and indexing
- embeddable website delivery

The split should reduce responsibility overlap, make deployment boundaries explicit, and prepare the codebase for independent scaling of tenant identity, ingestion, and agent runtime.

## Current Problem

The current repository mixes too many responsibilities in one runtime:

- tenant registration and authentication
- tenant CRUD and billing
- source management
- file storage
- ingestion jobs
- chunking and embeddings
- RAG retrieval
- LLM fallback orchestration
- widget runtime delivery
- admin and tenant web UI

This creates four structural problems:

1. One deployable unit owns unrelated concerns.
2. Storage is mixed across file store, local assets, local agent docs, optional Postgres, and in-memory repository fallback.
3. Chat runtime and ingestion runtime are coupled even though they have different scaling and failure profiles.
4. Public embed delivery, tenant identity, and knowledge indexing do not have clean trust boundaries.

## Recommended Bounded Contexts

Use DDD boundaries, not technical-layer boundaries.

### 1. Tenant Identity Context

Owns:

- tenant registration
- admin login
- tenant user login
- RBAC and session model
- subscription and quota metadata
- ownership of agents, sources, files, jobs

Does not own:

- document parsing
- embeddings
- reply generation
- raw file transformation

Recommended service name:

- `tenant-identity-service`

Recommended storage:

- MySQL or PostgreSQL

### 2. Knowledge Ingestion and Indexing Context

Owns:

- file upload intake
- website crawling
- IMAP pulling
- document normalization
- text cleaning
- chunking
- embeddings
- vector index writes
- sync job lifecycle
- retry and schedule execution
- agent markdown bundle generation from imported knowledge

This is not just “training”.
It is primarily a knowledge ingestion and indexing service. Fine-tuning can be added later, but should not define the service boundary now.

Recommended service name:

- `knowledge-indexing-service`

Recommended storage:

- PostgreSQL + pgvector
- object storage or dedicated file storage for raw assets

### 3. Agent Runtime Context

Owns:

- agent definitions
- agent reply policies
- FAQ fast-path
- price fast-path
- RAG retrieval orchestration
- shared-platform LLM fallback
- citations
- response provenance
- chat sessions and message records
- usage accounting tied to reply generation

Recommended service name:

- `agent-runtime-service`

Recommended storage:

- PostgreSQL

### 4. Embed / Delivery Context

Owns:

- public embed config
- embed key validation
- domain restrictions
- embeddable script delivery
- widget runtime configuration

This is broader than “front-end integration service”. It is the public delivery boundary for tenant-facing website integration.

Recommended service name:

- `embed-delivery-service`

Recommended storage:

- minimal database need
- may read tenant-owned delivery config from tenant identity service

## Service Responsibilities

### Tenant Identity Service

Primary APIs:

- tenant registration
- admin login
- tenant login
- tenant CRUD
- subscription CRUD
- ownership lookup for agents, sources, files, jobs

Suggested tables:

- `tenants`
- `admin_users`
- `tenant_users`
- `tenant_password_resets`
- `subscriptions`
- `agent_ownership`
- `source_ownership`

### Knowledge Indexing Service

Primary APIs:

- create source
- upload source asset
- trigger sync
- list sync jobs
- retry job
- query document and chunk stats
- read/write generated agent docs

Suggested tables:

- `data_sources`
- `ingestion_jobs`
- `source_documents`
- `document_chunks`
- `document_versions`

Suggested file/object storage:

- raw assets
- parsed attachment artifacts
- generated agent markdown bundle

### Agent Runtime Service

Primary APIs:

- chat completion
- contact escalation
- agent configuration
- usage detail and provenance
- conversation history

Suggested tables:

- `agents`
- `agent_rules`
- `chat_sessions`
- `chat_messages`
- `llm_usage_records`

### Embed Delivery Service

Primary APIs:

- public runtime config
- widget script config
- embed validation

This service should not own tenant authentication or indexing. It should consume those contexts.

## Cross-Service Data Ownership

This is the key rule set.

### Owned by Tenant Identity

- tenant identity
- auth and RBAC
- subscription and quota
- ownership mapping

### Owned by Knowledge Indexing

- source definitions
- raw source assets
- sync jobs
- normalized documents
- chunks and vectors
- generated agent markdown files

### Owned by Agent Runtime

- agent prompt/rule config
- chat sessions
- assistant messages
- citations stored with replies
- usage provenance

### Owned by Embed Delivery

- public embed runtime projection
- widget delivery rules

## Communication Model

Prefer mixed communication:

### Synchronous HTTP

Use for:

- admin UI -> tenant identity
- admin UI -> knowledge indexing
- widget -> embed delivery
- widget -> agent runtime
- agent runtime -> tenant identity ownership lookup

### Asynchronous Events / Queue

Use for:

- source created
- source uploaded
- sync requested
- indexing completed
- indexing failed
- agent docs regenerated

Suggested first step:

- Redis streams or RabbitMQ

Do not over-engineer Kafka first unless there is already platform-wide usage.

## Database Split Recommendation

Recommended split:

- `tenant-identity-service`: MySQL or PostgreSQL
- `knowledge-indexing-service`: PostgreSQL + pgvector
- `agent-runtime-service`: PostgreSQL
- `embed-delivery-service`: small relational store or projection cache

Do not introduce MongoDB only for job logs unless there is a stronger need. Job status, source metadata, documents, chunks, and vectors fit the indexing database naturally.

## Monorepo Recommendation

Do not jump directly to multiple repositories.

Recommended structure:

- one monorepo
- multiple NestJS apps
- shared contracts package
- shared UI or admin SDK package if needed

This gives clean service boundaries without multiplying CI/CD complexity too early.

## Migration Strategy

Do not split all services at once.

### Phase 1

Extract Tenant Identity first.

Why:

- authentication and ownership are the cleanest domain boundary
- everything else depends on tenant identity

### Phase 2

Extract Knowledge Ingestion and Indexing.

Why:

- source/job/document/chunk flow is already becoming its own subsystem
- it has different operational profile from chat runtime

### Phase 3

Extract Agent Runtime.

Why:

- by this point retrieval storage and ownership lookup already have clear upstream services

### Phase 4

Extract Embed Delivery if still needed as a separate runtime.

Why:

- this is the lightest boundary
- it can remain near the web app longer than the others if desired

## Mapping from Current Codebase

### Candidate Tenant Identity Files

- `server/lib/auth.ts`
- `server/lib/tenant-users.ts`
- `server/lib/tenant-resolver.ts`
- `server/lib/tenants.ts`
- `server/api/admin/login.post.ts`
- `server/api/admin/tenants*.ts`
- `server/api/tenant/*.ts`

### Candidate Knowledge Indexing Files

- `server/lib/assets/*`
- `server/lib/ingestion/*`
- `server/lib/db/*`
- `server/lib/repositories/postgres-rag-repository.ts`
- `server/api/admin/tenants/[tenantId]/sources*`
- `server/api/admin/tenants/[tenantId]/jobs*`
- `server/lib/agent-docs/*`

### Candidate Agent Runtime Files

- `server/lib/chat.ts`
- `server/lib/rag/*`
- `src/llm-adapter.ts`
- `server/api/chat.post.ts`
- `server/api/contact.post.ts`
- `server/lib/billing.ts`

### Candidate Embed Delivery Files

- `src/widget.ts`
- `src/index.ts`
- `src/iframe-host.ts`
- `server/api/embed/config.get.ts`
- `server/routes/customer-bot.js.get.ts`

## Acceptance Criteria for the Split

The split is successful when:

1. Tenant auth and tenant CRUD no longer require ingestion/runtime code.
2. Source ingestion can run independently of chat runtime deployment.
3. Chat runtime can answer questions without owning file parsing or chunk generation code.
4. Embed config delivery can operate without full admin runtime coupling.
5. Databases reflect domain ownership rather than technical convenience.
6. The monorepo clearly separates service boundaries and shared contracts.

## Recommendation Summary

Yes, the system should be split.

But the split should follow DDD service boundaries:

- `tenant-identity-service`
- `knowledge-indexing-service`
- `agent-runtime-service`
- `embed-delivery-service`

The most important correction is that the current “training service” idea should be renamed and scoped as a knowledge ingestion and indexing context, not a generic model training platform.
