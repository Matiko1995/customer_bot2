# Package Scripts Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 整理根 `package.json` 的脚本命名和分组，保留线上发布与常用本地开发/验证两层集合，并同步更新文档与验证脚本。

**Architecture:** 保持脚本行为不变，只统一命名为 `app:* / service:* / stack:* / verify:* / deploy:*` 分组；为高频入口保留少量兼容别名；同步修改 README、部署文档和依赖这些脚本名的本地验证脚本。

**Tech Stack:** npm scripts, Nuxt/Nitro, PM2, PowerShell launcher, existing `verify-*` scripts.

---

### Task 1: 重命名与归组脚本

**Files:**
- Modify: `package.json`

- [ ] 增加 `app:dev / app:build / app:preview / app:widget:build / app:bundle`
- [ ] 增加 `deploy:pm2:start / deploy:pm2:reload / deploy:pm2:logs`
- [ ] 增加 `verify:types`
- [ ] 保留必要兼容别名 `dev / build / preview`

### Task 2: 同步引用这些脚本的代码与文档

**Files:**
- Modify: `scripts/run-local-stack.ps1`
- Modify: `scripts/verify-stack-launcher.ts`
- Modify: `README.md`
- Modify: `docs/deployment-bot.factory.website-aapanel.md`

- [ ] 启动器改为引用新的 `app:*` 脚本
- [ ] 栈启动验证改为检查新的脚本名
- [ ] README 更新本地开发、构建、发布命令
- [ ] 部署文档更新线上命令清单

### Task 3: 回归验证

**Files:**
- Test: `package.json`
- Test: `scripts/verify-stack-launcher.ts`

- [ ] 运行 `npm run verify:stack-launcher`
- [ ] 运行 `npm run verify:types`
- [ ] 运行 `npm run build`
