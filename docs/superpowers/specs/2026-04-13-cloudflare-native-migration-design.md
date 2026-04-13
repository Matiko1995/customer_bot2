# Cloudflare Native Migration Design

Date: 2026-04-13

## Goal

将当前项目从 `Linux + aaPanel + PM2 + 本地文件 + PostgreSQL/pgvector` 的部署模型，迁移到以 Cloudflare 原生能力为核心的运行架构，目标保留完整业务能力：

- Nuxt 前端与 `server/api/*`
- 租户身份与后台 API
- 文件上传与 Agent 文档
- 资料导入、索引、重建
- RAG 检索
- 聊天运行时与嵌入交付

## Current Constraints

当前仓库已经具备以下特征：

- 根应用：Nuxt/Nitro
- 多服务分层：`tenant-identity-service`、`knowledge-indexing-service`、`agent-runtime-service`、`embed-delivery-service`
- 本地文件依赖：
  - `.data/source-assets/`
  - `.data/agent-docs/`
  - `.data/customer-bot-storage.json`
- 现有 RAG 与导入流程仍有明显的 Node/local 假设

因此，这次迁移不是“改部署配置”，而是“替换平台能力与运行时边界”。

## Target Architecture

### Cloudflare Resource Mapping

- `Workers`
  - 承载 Nuxt 前端
  - 承载 `server/api/*`
  - 承载聊天运行时与嵌入交付
- `D1`
  - 租户身份
  - 租户配置
  - 聊天元数据
  - 任务元数据
- `R2`
  - 上传文件
  - 导入中间产物
  - Agent 文档
- `Queues`
  - 资料导入异步任务
  - 重建索引任务
  - 重试任务
- `Cron Triggers`
  - 周期同步任务
- `Vectorize`
  - chunk embedding 索引
  - 检索召回

### Service Mapping

#### 1. Frontend + BFF

当前 Nuxt 应用迁移到 Cloudflare Workers，保留：

- 页面渲染
- `server/api/*`
- `customer-bot.js`

#### 2. Tenant Identity

迁移到 Worker + D1，负责：

- 管理员登录
- 租户 CRUD
- 租户用户
- 重置码
- `ragSettings`

#### 3. Knowledge Indexing

迁移到 Worker + D1 + R2 + Queues + Vectorize，负责：

- 资料源管理
- 文件上传
- 文档解析
- 切块
- embedding
- 向量写入
- Agent 文档生成

#### 4. Agent Runtime

迁移到 Worker + D1 + Vectorize，负责：

- classify
- structured fast-path
- retrieval
- grounded answer
- fallback
- usage / provenance

#### 5. Embed Delivery

迁移到 Worker + D1，负责：

- embed config
- 脚本交付
- runtime config

## Why Vectorize Instead Of D1 For Retrieval

本次路线选定为 Cloudflare 原生优先，因此：

- `D1` 用于业务元数据
- `Vectorize` 用于真正的向量索引和召回

不建议把向量检索伪装进 `D1`，否则后期仍然要二次迁移。

## Phase Breakdown

### Phase 1: Platform Foundation

目标：建立 Cloudflare 运行壳与资源绑定层。

包括：

- Nuxt 切到 Cloudflare 目标
- `wrangler` 配置
- D1/R2/Queues/Vectorize 绑定抽象
- local/file/env 依赖 provider 化

### Phase 2: Tenant Identity On D1

目标：先把后台登录、租户、租户用户、重置码迁到 D1。

原因：

- 这是所有后续业务的配置基础
- `ragSettings` 也归属这一层

### Phase 3: Knowledge Indexing On R2 + Queues + Vectorize

目标：迁移文件、导入、切块、embedding、重建索引、Agent 文档。

这是迁移里最核心的一段，也是 RAG 完整迁移的关键。

### Phase 4: Agent Runtime + Embed Delivery On Workers

目标：迁移聊天运行时、引用、fallback、usage、嵌入交付与 runtime config。

## Data Model Direction

### D1

建议最少拆分这些表：

- `admin_users`
- `tenants`
- `tenant_users`
- `tenant_password_resets`
- `chat_sessions`
- `chat_messages`
- `leads`
- `usage_records`
- `data_sources`
- `ingestion_jobs`
- `source_documents`

### R2

对象前缀建议：

- `source-assets/<tenantId>/...`
- `agent-docs/<tenantId>/latest/...`
- `ingestion-cache/<tenantId>/...`

### Vectorize

向量索引至少按租户维度隔离，可在 metadata 中保留：

- `tenantId`
- `documentId`
- `chunkId`
- `sourceId`
- `title`
- `mimeType`

## Key Compatibility Strategy

迁移过程中的关键原则：

- 尽量保留当前对外 API 入口不变
- 先替换资源和 provider，再替换业务实现
- 尽量保持：
  - `/api/chat`
  - `/api/contact`
  - `/api/embed/config`
  - `customer-bot.js`
  - 后台页面路由

这样可以最大限度降低前端和嵌入端的破坏面。

## Risks

### 1. Worker Runtime Limits

资料解析、批量切块、embedding 写入不适合继续按“本地同步函数直接执行”的方式运行，必须通过 `Queues` 和较细粒度任务拆分来避免超时。

### 2. File System Assumptions

当前项目大量默认本地文件路径，迁移时必须统一替换成对象存储抽象，否则代码会持续混用本地路径和云对象 key。

### 3. Existing Local Storage Coupling

`TenantRecord`、聊天记录和训练数据目前仍然在本地文件仓储模型里耦合较深，这要求 Phase 1 先建立 provider 层，否则后续每个模块都会重复返工。

## Success Criteria

完整迁移完成时，至少满足：

- 前端、后台、嵌入入口都运行在 Cloudflare
- 身份与租户配置运行在 D1
- 文件与 Agent 文档运行在 R2
- 导入与重建运行在 Queues + Cron
- 向量检索运行在 Vectorize
- 聊天运行时完整保留：
  - structured
  - rag
  - general_fallback
  - citations
  - usage
  - provenance

## Recommended First Execution Scope

推荐立即开始：

- `Phase 1: Platform Foundation`

不建议一开始直接改业务层。

## Official References

- Nuxt on Cloudflare: https://nuxt.com/deploy/cloudflare
- Cloudflare Nuxt guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/nuxt/
- D1: https://developers.cloudflare.com/d1/
- R2: https://developers.cloudflare.com/r2/
- Queues: https://developers.cloudflare.com/queues/
- Vectorize: https://developers.cloudflare.com/vectorize/
- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
