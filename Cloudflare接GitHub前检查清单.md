# Cloudflare 接 GitHub 前检查清单

这份清单用于判断当前仓库是否适合直接接入 Cloudflare + GitHub 自动部署。

## 1. 本地验证

需要先全部通过：

```bash
npm run verify:types
npm run verify:cloudflare-foundation
npm run verify:cloudflare-tenant-identity
npm run verify:cloudflare-tenant-identity-gateway
npm run verify:cloudflare-knowledge-indexing
npm run verify:cloudflare-ingestion-consumer
npm run verify:cloudflare-agent-runtime
npm run verify:cloudflare-embed-delivery
npm run verify:cloudflare-deployability
npm run app:build:cloudflare
```

## 2. Wrangler 配置

确认：

- [wrangler.toml](D:/ai/aifactory_website/customer_bot/wrangler.toml) 已填真实资源信息
- `database_id` 不是占位值
- `bucket_name` 不是占位值
- `queue` 不是占位值
- `index_name` 不是占位值

## 3. Cloudflare 资源

确认已经在 Cloudflare 创建：

- D1
- R2
- Queue
- Vectorize

## 4. 构建入口

当前建议的最终发布入口是：

- `main = "./.output/server/index.mjs"`

也就是以 Nitro Cloudflare 构建产物为主入口。

保留文件：

- [workers/cloudflare-entry.mjs](D:/ai/aifactory_website/customer_bot/workers/cloudflare-entry.mjs)

当前作为备用/扩展入口，不作为第一发布入口。

## 5. 运行方式

当前建议生产方式：

```bash
npm run app:build:cloudflare
npx wrangler deploy .output/server/index.mjs --assets .output/public
```

如果你后面要完全交给 Cloudflare GitHub 自动构建，则需要让 Cloudflare 项目采用同样的构建结果和入口。

## 6. 业务层确认

确认这些功能已经按 Cloudflare 路线跑通：

- 管理员登录
- 租户 CRUD
- 资料源创建
- 文件上传
- 同步任务入队
- 队列消费后生成文档和 chunk
- Vectorize 检索
- `/api/chat`
- `/api/contact`
- `/api/embed/config`
- `customer-bot.js`

## 7. 当前结论

如果以上各项都完成，就可以开始接 Cloudflare + GitHub 自动部署。

如果仍有一项未完成，不建议直接切生产。
