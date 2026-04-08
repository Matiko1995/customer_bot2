# Customer Bot Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在独立目录中产出一个最小可运行的 Nuxt 版 customer bot，脱离当前站点后仍可完成文档问答、价格查询和联系提交。

**Architecture:** 复制现有客服组件的交互结构，但将站点接口依赖改为本地配置与演示 API。把可测试的查询与组装逻辑拆到独立工具模块，先用测试锁定行为，再接入 UI。

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Vitest

---

## Chunk 1: Bootstrap

### Task 1: 建立独立最小工程骨架

**Files:**
- Create: `customer_bot/package.json`
- Create: `customer_bot/nuxt.config.ts`
- Create: `customer_bot/tsconfig.json`
- Create: `customer_bot/app.vue`

- [ ] **Step 1: 建立最小工程文件**
- [ ] **Step 2: 配置 Nuxt 与测试脚本**
- [ ] **Step 3: 挂载客服组件占位入口**

## Chunk 2: Core Logic

### Task 2: 先抽取可测试纯函数

**Files:**
- Create: `customer_bot/lib/customer-bot.ts`
- Create: `customer_bot/tests/customer-bot.test.ts`

- [ ] **Step 1: 先写文档问答与价格匹配失败测试**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 实现最小查询与回答组装逻辑**
- [ ] **Step 4: 运行测试确认通过**

## Chunk 3: Data And UI

### Task 3: 接入本地配置与组件

**Files:**
- Create: `customer_bot/config/ai-assistant-knowledge.ts`
- Create: `customer_bot/config/customer-bot-data.ts`
- Create: `customer_bot/types/index.ts`
- Create: `customer_bot/components/AiSupportWidget.vue`

- [ ] **Step 1: 迁移最小类型与知识配置**
- [ ] **Step 2: 将组件改为依赖本地配置和纯函数**
- [ ] **Step 3: 保持三模块交互与样式**

## Chunk 4: Contact Demo

### Task 4: 提供最小可提交链路

**Files:**
- Create: `customer_bot/server/api/contact.post.ts`

- [ ] **Step 1: 提交本地演示接口失败测试或手动验证方案**
- [ ] **Step 2: 实现演示接口**
- [ ] **Step 3: 验证表单提交成功提示**

## Chunk 5: Verification

### Task 5: 完整验证

**Files:**
- Modify: `customer_bot/README.md`

- [ ] **Step 1: 安装依赖**
- [ ] **Step 2: 运行测试**
- [ ] **Step 3: 运行构建或类型检查**
- [ ] **Step 4: 补充运行说明**
