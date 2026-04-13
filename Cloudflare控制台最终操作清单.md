# Cloudflare 控制台最终操作清单

这份文档是给你在 Cloudflare 控制台里直接照着填写用的。

适用目标：

- 代码托管：GitHub
- 运行平台：Cloudflare
- 当前项目：`Nuxt + server/api/* + D1 + R2 + Queue + Vectorize`

---

## 1. 先准备 Cloudflare 资源

在 Cloudflare 控制台先创建：

1. `D1 Database`
   建议名称：
   - `customer-bot-tenant-identity`
   - `de34244a-fa17-4b11-ac48-2f40b5a15c9c`
2. `R2 Bucket`
   建议名称：
   - `customer-bot-assets`

3. `Queue`
   建议名称：
   - `customer-bot-ingestion`

4. `Vectorize Index`
   建议名称：
   - `customer-bot-index`

---

## 2. 修改仓库里的 `wrangler.toml`

文件位置：

- [wrangler.toml](D:/ai/aifactory_website/customer_bot/wrangler.toml)

你需要把这些占位值改成真实值：

```toml
database_id = "replace-with-d1-database-id"
bucket_name = "customer-bot-assets"
queue = "customer-bot-ingestion"
index_name = "customer-bot-index"
```

当前建议入口已经统一为：

```toml
main = "./.output/server/index.mjs"
```

不要改回 `workers/cloudflare-entry.mjs` 作为第一入口。  
当前首选是直接部署 Nitro Cloudflare 构建产物。

---

## 3. GitHub 连接到 Cloudflare

在 Cloudflare 里创建项目并连接 GitHub 仓库。

推荐你选择：

- `Workers & Pages` 相关 Git 集成流程
- 让 Cloudflare 从 GitHub 拉代码并执行构建

---

## 4. Cloudflare 构建设置

构建命令：

```bash
npm install && npm run app:build:cloudflare
```

输出产物关键路径：

- Worker 入口：
  - `.output/server/index.mjs`
- 资源目录：
  - `.output/public`

如果控制台要求你配置部署命令，可以参考 Nitro 当前构建输出：

```bash
npx wrangler deploy .output/server/index.mjs --assets .output/public
```

如果 Cloudflare 的 Git 集成不允许你直接这样写 deploy 命令，就按它的 `wrangler.toml` 默认行为走，但入口仍然要对应当前仓库里的：

- `main = "./.output/server/index.mjs"`

---

## 5. Cloudflare 环境变量

建议在 Cloudflare 控制台中配置这些环境变量：

### 站点基础

```text
CUSTOMER_BOT_PUBLIC_BASE_URL=https://你的域名
CUSTOMER_BOT_STAGING_BASE_URL=https://你的域名
CUSTOMER_BOT_WIDGET_VERSION=prod
CUSTOMER_BOT_DEPLOYMENT_TARGET=cloudflare
CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE=phase4
```

### 管理员登录

```text
CUSTOMER_BOT_ADMIN_EMAIL=admin@example.com
CUSTOMER_BOT_ADMIN_PASSWORD=你自己的强密码
```

### 模型调用

```text
CUSTOMER_BOT_LLM_ENDPOINT=https://your-llm-endpoint.example/v1/chat/completions
CUSTOMER_BOT_LLM_API_KEY=sk_xxx
CUSTOMER_BOT_LLM_MODEL=gpt-4.1-mini

CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT=https://your-platform-llm-endpoint.example/v1/chat/completions
CUSTOMER_BOT_PLATFORM_LLM_API_KEY=sk_platform_xxx
CUSTOMER_BOT_PLATFORM_LLM_MODEL=gpt-4.1-mini
```

详细说明见：

- [Cloudflare环境变量清单.md](D:/ai/aifactory_website/customer_bot/Cloudflare环境变量清单.md)

---

## 6. 资源绑定关系

当前项目需要这些绑定名：

- `TENANT_IDENTITY_DB`
- `CUSTOMER_BOT_BUCKET`
- `INGESTION_QUEUE`
- `CUSTOMER_BOT_VECTOR_INDEX`
- `ASSETS`

其中：

- `TENANT_IDENTITY_DB`
  实际上当前同时承载：
  - tenant identity
  - knowledge indexing metadata
  - agent runtime metadata
- `CUSTOMER_BOT_BUCKET`
  承载：
  - 上传文件
  - agent 文档
- `INGESTION_QUEUE`
  承载：
  - 资料同步任务
- `CUSTOMER_BOT_VECTOR_INDEX`
  承载：
  - 向量检索

---

## 7. 上线前本地最终检查

接 GitHub 之前，本地先确保这些都通过：

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

---

## 8. 接入后首次检查

部署完成后，优先检查：

1. 首页是否能打开
2. `/admin/login` 是否能打开
3. 管理员登录是否成功
4. 租户是否可见
5. `/api/embed/config` 是否可返回租户配置
6. `customer-bot.js` 是否可返回
7. 创建资料源、上传文件、触发同步是否正常
8. 聊天是否能返回：
   - `structured`
   - `rag`
   - `general_fallback`

---

## 9. 当前最终建议

你现在已经可以开始接 Cloudflare + GitHub。  
但我建议按这个顺序操作：

1. 先把 `wrangler.toml` 的真实资源值填好
2. 在 Cloudflare 控制台创建资源并绑定
3. 配置环境变量
4. 再连接 GitHub 仓库
5. 让 Cloudflare 跑第一次构建

---

## 10. 相关文档

- [Cloudflare-GitHub部署流程.md](D:/ai/aifactory_website/customer_bot/Cloudflare-GitHub部署流程.md)
- [Cloudflare环境变量清单.md](D:/ai/aifactory_website/customer_bot/Cloudflare环境变量清单.md)
- [Cloudflare接GitHub前检查清单.md](D:/ai/aifactory_website/customer_bot/Cloudflare接GitHub前检查清单.md)
