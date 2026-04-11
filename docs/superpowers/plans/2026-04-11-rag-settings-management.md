# RAG Settings Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为管理员增加租户级 RAG 设置管理能力，支持开关、行业默认模板、chunk 参数、导入结构模板与回答模板，并让聊天与导入链路消费这些设置。

**Architecture:** 在租户记录中新增 `ragSettings`，由 `tenant-identity-service` 负责读写；前台租户后台新增独立 `RAG 设置` 面板；聊天链路和导入链路分别读取标准化后的租户 RAG 设置，决定是否启用检索、如何构造提示词、如何切块。

**Tech Stack:** TypeScript, Nuxt/Nitro, existing service gateways, file store, PostgreSQL/pgvector-compatible repository, custom `scripts/verify-*.ts` verification scripts.

---

### Task 1: 定义租户级 RAG 设置模型

**Files:**
- Create: `packages/shared-config/src/rag-settings.ts`
- Modify: `types/index.ts`
- Modify: `packages/contracts/src/tenant/tenant.contract.ts`
- Modify: `server/lib/demo.ts`

- [ ] 定义 `TenantRagSettings` 与行业默认模板。
- [ ] 将 `TenantRecord` 扩展为包含 `ragSettings`。
- [ ] 扩展租户 contract 的 create/update/get/list 返回结构。
- [ ] 给 demo tenant 写入默认关闭的 RAG 设置。

### Task 2: 先写失败验证

**Files:**
- Create: `scripts/verify-rag-settings.ts`
- Modify: `package.json`

- [ ] 写验证脚本，断言默认租户 `ragSettings.enabled === false`。
- [ ] 写验证脚本，断言更新租户后能保留 `chunkSize`、模板与开关。
- [ ] 写验证脚本，断言关闭 RAG 时聊天链路不会进入 `rag` answerSource。
- [ ] 运行脚本并确认先失败。

### Task 3: 打通租户服务与保存链路

**Files:**
- Modify: `services/tenant-identity-service/src/modules/tenants/use-cases/create-tenant.use-case.ts`
- Modify: `services/tenant-identity-service/src/modules/tenants/use-cases/update-tenant.use-case.ts`
- Modify: `services/tenant-identity-service/src/modules/tenants/use-cases/get-tenant.use-case.ts`
- Modify: `server/api/admin/tenants/[tenantId].put.ts`
- Modify: `server/lib/service-gateways/tenant-identity.ts`

- [ ] 在创建租户时填充标准化后的默认 RAG 设置。
- [ ] 在更新租户时合并并标准化 `ragSettings`。
- [ ] 保证 get/list tenant 返回包含完整 `ragSettings`。
- [ ] 让现有 gateway / API 保存链路支持该字段。

### Task 4: 实现后台 RAG 设置面板

**Files:**
- Create: `components/admin/tenant-workspace/RagSettingsPanel.vue`
- Modify: `pages/admin/tenants/[tenantId].vue`

- [ ] 创建独立面板，展示基础设置与高级模板编辑区。
- [ ] 支持行业模板选择、应用默认模板、恢复平台默认值。
- [ ] 将面板接入租户页 `content` 工作区。
- [ ] 保存租户时一并提交 `ragSettings`。

### Task 5: 让聊天与导入链路消费 RAG 设置

**Files:**
- Modify: `server/lib/chat.ts`
- Modify: `server/lib/ingestion/chunk-document.ts`
- Modify: `server/lib/ingestion/execute-job.ts`

- [ ] 聊天链路读取 `ragSettings.enabled`，关闭时跳过检索。
- [ ] 聊天链路读取回答模板与 prompt 模板，覆盖默认生成提示词。
- [ ] 切块逻辑支持 `chunkSize` 与 `chunkOverlap`。
- [ ] 导入任务执行时按租户 `ragSettings` 传入切块参数。

### Task 6: 回归验证

**Files:**
- Modify: `scripts/verify-chat-routing.ts`
- Modify: `scripts/verify-rag-settings.ts`

- [ ] 运行 `node --experimental-strip-types scripts/verify-rag-settings.ts`
- [ ] 运行 `node --experimental-strip-types scripts/verify-chat-routing.ts`
- [ ] 运行 `npx tsc --noEmit`
- [ ] 如有必要补充 UI/保存链路的静态校验。
