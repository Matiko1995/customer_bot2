# Cloudflare Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Cloudflare 原生迁移建立第一阶段基础层，使当前仓库具备 Workers/D1/R2/Queues/Vectorize 的运行抽象和绑定入口。

**Architecture:** 不直接迁业务逻辑，先把 Nuxt 运行目标、资源绑定、provider 抽象和本地依赖入口统一起来。这样后续身份、索引、聊天模块可以按 provider 平滑切换，而不是到处直接依赖 `.data`、`process.env` 和本地文件路径。

**Tech Stack:** Nuxt/Nitro, Cloudflare Workers, Wrangler, TypeScript, existing service split, current local providers as fallback.

---

### Task 1: 增加 Cloudflare 基础配置骨架

**Files:**
- Create: `wrangler.toml`
- Create: `server/lib/cloudflare/bindings.ts`
- Create: `server/lib/cloudflare/runtime.ts`
- Modify: `nuxt.config.ts`

- [ ] 定义 Cloudflare Worker 项目名、兼容日期和基础入口配置。
- [ ] 增加 D1/R2/Queues/Vectorize 绑定类型定义。
- [ ] 建立统一的 runtime/bindings 读取入口。
- [ ] 在 `nuxt.config.ts` 中补 Cloudflare 目标所需配置占位。

### Task 2: 抽象本地文件与对象存储边界

**Files:**
- Create: `server/lib/object-storage/object-storage.ts`
- Create: `server/lib/object-storage/local-object-storage.ts`
- Create: `server/lib/object-storage/r2-object-storage.ts`
- Modify: `server/lib/assets/file-asset-store.ts`
- Modify: `server/lib/agent-docs/paths.ts`

- [ ] 为上传文件和 Agent 文档建立 object storage 接口。
- [ ] 提供 local provider 作为当前 fallback。
- [ ] 提供 R2 provider 骨架。
- [ ] 把直接路径拼接逻辑改为通过 provider。

### Task 3: 抽象结构化存储与索引 provider

**Files:**
- Create: `server/lib/providers/storage-provider.ts`
- Create: `server/lib/providers/rag-provider.ts`
- Modify: `server/lib/storage/index.ts`
- Modify: `server/lib/repositories/rag-repository.ts`

- [ ] 建立统一的 storage provider 入口。
- [ ] 建立统一的 rag/index provider 入口。
- [ ] 保持现有 file/local provider 可用。
- [ ] 为 D1 / Vectorize provider 预留切换位。

### Task 4: 抽象异步任务发布层

**Files:**
- Create: `server/lib/tasks/queue-publisher.ts`
- Create: `server/lib/tasks/local-queue-publisher.ts`
- Create: `server/lib/tasks/cloudflare-queue-publisher.ts`
- Modify: `server/lib/ingestion/execute-job.ts`

- [ ] 定义导入/重建任务发布接口。
- [ ] 当前本地实现继续直接执行或本地模拟。
- [ ] 增加 Cloudflare Queues 发布骨架。
- [ ] 让导入链不再默认只能本地同步执行。

### Task 5: 验证与文档

**Files:**
- Create: `scripts/verify-cloudflare-foundation.ts`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `aaPanel上线流程.md`

- [ ] 增加 Cloudflare 基础层静态验证脚本。
- [ ] 增加 `verify:cloudflare-foundation` 脚本。
- [ ] 更新 README，说明 Cloudflare 迁移基础层已引入。
- [ ] 明确 aaPanel 文档仍是当前生产路线，Cloudflare 为迁移中路线。
