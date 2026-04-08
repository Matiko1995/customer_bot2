# Customer Bot Widget Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 customer bot 改造成一个通过 `script + CustomerBot.init()` 接入的浏览器端 JS 插件。

**Architecture:** 保留现有纯逻辑模块，新增原生 DOM 渲染层、配置归一化层和插件 API 暴露层。使用打包工具产出单文件浏览器脚本。

**Tech Stack:** TypeScript, Vitest, tsup

---

## Chunk 1: Runtime Skeleton

### Task 1: 定义插件 API 和失败测试

**Files:**
- Create: `src/widget.ts`
- Create: `tests/widget.test.ts`

- [ ] **Step 1: 先写 `init/open/close/destroy` 的失败测试**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 实现最小 API 外壳**
- [ ] **Step 4: 运行测试确认通过**

## Chunk 2: DOM Renderer

### Task 2: 建立原生 DOM 浮窗

**Files:**
- Create: `src/dom.ts`
- Create: `src/styles.ts`

- [ ] **Step 1: 渲染触发按钮和面板骨架**
- [ ] **Step 2: 注入样式并绑定打开关闭行为**
- [ ] **Step 3: 验证基础 DOM 输出**

## Chunk 3: Data Integration

### Task 3: 接入问答与联系数据

**Files:**
- Modify: `src/widget.ts`
- Modify: `lib/customer-bot.ts`

- [ ] **Step 1: 接入本地数据与自定义配置**
- [ ] **Step 2: 绑定文档问答和价格查询**
- [ ] **Step 3: 绑定联系表单提交**

## Chunk 4: Packaging

### Task 4: 输出单文件浏览器脚本

**Files:**
- Modify: `package.json`
- Create: `tsup.config.ts`
- Create: `src/index.ts`

- [ ] **Step 1: 配置浏览器构建**
- [ ] **Step 2: 产出 `dist/customer-bot.js`**
- [ ] **Step 3: 更新使用说明**
