# Cloudflare + GitHub 部署流程

适用场景：

- 目标平台：Cloudflare
- 代码来源：GitHub 仓库
- 部署目标：Workers / Cloudflare 原生资源
- 当前项目：Nuxt + `server/api/*` + 多个 Cloudflare 迁移中的业务模块

## 当前结论

当前仓库已经具备这些能力：

- `app:build:cloudflare` 已可构建成功
- `wrangler.toml` 已存在
- `tenant-identity` 已有 D1 路线
- `knowledge-indexing` 已有 `D1 + R2 + Queue + Vectorize` 最小闭环
- `agent-runtime` 已有 Cloudflare 路线
- `embed-delivery` 已有 Cloudflare 路线

已通过的关键验证：

- `npm run verify:cloudflare-foundation`
- `npm run verify:cloudflare-tenant-identity`
- `npm run verify:cloudflare-knowledge-indexing`
- `npm run verify:cloudflare-ingestion-consumer`
- `npm run verify:cloudflare-agent-runtime`
- `npm run verify:cloudflare-embed-delivery`
- `npm run app:build:cloudflare`

## 1. 当前 Cloudflare 构建命令

项目已增加专用构建脚本：

```bash
npm run app:build:cloudflare
```

该命令会以：

- `NITRO_PRESET=cloudflare_module`
- `CUSTOMER_BOT_DEPLOYMENT_TARGET=cloudflare`

进行 Nuxt 构建。

当前实际构建结果会生成：

- `.output/server/index.mjs`
- `.output/public`

Nitro 当前给出的 Cloudflare 运行提示为：

```bash
npx wrangler dev .output/server/index.mjs --assets .output/public
npx wrangler deploy .output/server/index.mjs --assets .output/public
```

## 2. 关键配置文件

- Worker 配置：[wrangler.toml](D:/ai/aifactory_website/customer_bot/wrangler.toml)
- Worker 入口：[workers/cloudflare-entry.mjs](D:/ai/aifactory_website/customer_bot/workers/cloudflare-entry.mjs)

当前 `wrangler.toml` 已包含：

- `nodejs_compat`
- `D1`
- `R2`
- `Queues`
- `Vectorize`

## 3. Cloudflare 资源准备

你需要在 Cloudflare 控制台先创建并绑定：

- D1 数据库
- R2 Bucket
- Queue
- Vectorize Index

然后把真实资源值写入 `wrangler.toml` 或对应环境配置。

当前占位项包括：

- `database_id`
- `bucket_name`
- `queue`
- `index_name`

## 4. 数据库迁移文件

当前 Cloudflare D1 侧迁移文件：

- [001-tenant-identity.sql](D:/ai/aifactory_website/customer_bot/deploy/cloudflare/d1/001-tenant-identity.sql)
- [002-knowledge-indexing.sql](D:/ai/aifactory_website/customer_bot/deploy/cloudflare/d1/002-knowledge-indexing.sql)
- [003-agent-runtime.sql](D:/ai/aifactory_website/customer_bot/deploy/cloudflare/d1/003-agent-runtime.sql)

## 5. GitHub 接入前建议先本地确认

先在本地执行：

```bash
npm run verify:types
npm run verify:cloudflare-foundation
npm run verify:cloudflare-tenant-identity
npm run verify:cloudflare-knowledge-indexing
npm run verify:cloudflare-ingestion-consumer
npm run verify:cloudflare-agent-runtime
npm run verify:cloudflare-embed-delivery
npm run app:build:cloudflare
```

## 6. GitHub 接入后的目标形态

理想流程：

1. Cloudflare 连接 GitHub 仓库
2. 触发构建：`npm install && npm run app:build:cloudflare`
3. 使用 `wrangler` + Cloudflare 资源绑定完成发布

## 7. 现阶段仍需注意

虽然当前仓库已经非常接近 Cloudflare 自动部署形态，但你在正式接 GitHub 前还需要最终确认：

- `wrangler` 使用的资源 ID 是否全部为真实值
- `worker entry` 是否与你的目标部署方式一致
- Queue consumer 和 scheduled handler 是否符合你的生产策略
- Cloudflare 控制台中的环境变量是否与本地一致

## 8. 建议的下一步

如果准备正式切 GitHub 自动部署，下一步应做：

1. 填充 `wrangler.toml` 的真实 Cloudflare 资源信息
2. 增加一份 Cloudflare 环境变量清单
3. 明确最终是使用 `wrangler deploy` 直接部署 `.output/server/index.mjs`，还是使用自定义 worker 入口
4. 最后再做一次面向 GitHub 部署的最终回归
