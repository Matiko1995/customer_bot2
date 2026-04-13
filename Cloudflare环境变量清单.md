# Cloudflare 环境变量清单

用于 Cloudflare + GitHub 部署时的环境变量和资源绑定整理。

## 1. Wrangler 资源绑定

当前 `wrangler.toml` 需要绑定这些资源：

- `TENANT_IDENTITY_DB`
- `CUSTOMER_BOT_BUCKET`
- `INGESTION_QUEUE`
- `CUSTOMER_BOT_VECTOR_INDEX`
- `ASSETS`

当前配置文件：

- [wrangler.toml](D:/ai/aifactory_website/customer_bot/wrangler.toml)

## 2. Cloudflare 侧建议配置的变量

### 基础站点

```text
CUSTOMER_BOT_PUBLIC_BASE_URL=https://your-domain.example
CUSTOMER_BOT_STAGING_BASE_URL=https://your-domain.example
CUSTOMER_BOT_WIDGET_VERSION=prod
CUSTOMER_BOT_DEPLOYMENT_TARGET=cloudflare
CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE=phase4
```

### 管理员登录

```text
CUSTOMER_BOT_ADMIN_EMAIL=admin@example.com
CUSTOMER_BOT_ADMIN_PASSWORD=your-strong-password
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

## 3. 当前不应继续使用的旧变量

这些是传统服务器模式下的变量，切 Cloudflare 后不应再依赖：

- `CUSTOMER_BOT_DATA_FILE`
- `CUSTOMER_BOT_DATABASE_URL`
- `TENANT_IDENTITY_SERVICE_URL`
- `KNOWLEDGE_INDEXING_SERVICE_URL`
- `AGENT_RUNTIME_SERVICE_URL`
- `EMBED_DELIVERY_SERVICE_URL`

## 4. 资源实际作用

### D1

当前用于：

- 租户
- 租户用户
- 重置码
- 资料源元数据
- 索引任务元数据
- 聊天 session / message / lead / usage

### R2

当前用于：

- 上传源文件
- Agent 文档

### Queue

当前用于：

- `knowledge-indexing.sync`

### Vectorize

当前用于：

- chunk embedding upsert
- 检索召回

## 5. GitHub 接入时的建议

如果使用 Cloudflare GitHub 集成，至少要确保：

1. 仓库构建命令使用：

```bash
npm install && npm run app:build:cloudflare
```

2. 资源绑定已经在 Cloudflare 侧创建完成
3. 所有模型相关环境变量已在 Cloudflare 控制台中配置
