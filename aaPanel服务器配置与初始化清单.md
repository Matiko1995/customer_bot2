# aaPanel 服务器配置与初始化清单

适用范围：

- 当前仓库的可运行发布链路
- 部署方式：`aaPanel + Nginx + PM2 + 单域名路径前缀`
- 域名：`bot.factory.website`
- 文件存储：服务器本地磁盘

说明：

- 这份清单按当前代码真实依赖编写
- 当前上线必需依赖是 `Node.js 22+`、`PM2`、`PostgreSQL 15+`、`pgvector`
- `MySQL` 不是当前上线硬依赖，可以先不装

## 1. 服务器规格建议

测试/单租户演示：

- `2 vCPU`
- `4 GB RAM`
- `40 GB SSD`

小规模正式使用：

- `4 vCPU`
- `8 GB RAM`
- `80 GB SSD`

有资料导入、RAG、邮件同步预期：

- `8 vCPU`
- `16 GB RAM`
- `150 GB SSD`

补充建议：

- 系统选择 `Ubuntu 22.04 LTS` 或 `Ubuntu 24.04 LTS`
- 架构选择 `x86_64`
- 服务器需要能正常访问外部 `LLM API`、邮件服务器、系统包源

## 2. 当前线上进程与端口

- 前端主应用：`3203`
- `tenant-identity-service`：`3301`
- `knowledge-indexing-service`：`3302`
- `agent-runtime-service`：`3303`
- `embed-delivery-service`：`3304`

对外开放端口建议：

- `80`
- `443`
- `22`

不建议对外开放：

- `3203`
- `3301`
- `3302`
- `3303`
- `3304`
- `5432`

## 3. aaPanel 中建议安装的软件

至少安装：

- `Nginx`
- `PM2 管理器` 或系统级 `pm2`
- `PostgreSQL 15+`

建议同时准备：

- `Node.js 22.x`
- `Git`
- `zip/unzip`

注意：

- 如果 aaPanel 上的 PostgreSQL 插件版本不理想，可以直接用系统包安装 PostgreSQL，aaPanel 只负责站点、证书和反向代理

## 4. 服务器初始化命令

以下命令以 `Ubuntu` 为例。

先更新系统：

```bash
sudo apt update
sudo apt upgrade -y
sudo timedatectl set-timezone Asia/Shanghai
```

安装基础工具：

```bash
sudo apt install -y curl wget git unzip build-essential ca-certificates gnupg lsb-release
```

安装 Node.js 22：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

安装 PM2：

```bash
sudo npm install -g pm2
pm2 -v
```

## 5. PostgreSQL 与 pgvector 初始化

安装 PostgreSQL：

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

安装 `pgvector`：

```bash
sudo apt install -y postgresql-15-pgvector
```

如果你的系统仓库没有这个包，就改用对应 PostgreSQL 版本的 `pgvector` 包，或者源码安装。

创建数据库和用户：

```bash
sudo -u postgres psql
```

进入 `psql` 后执行：

```sql
CREATE USER customer_bot WITH PASSWORD '请替换成强密码';
CREATE DATABASE customer_bot_indexing OWNER customer_bot;
\c customer_bot_indexing
CREATE EXTENSION IF NOT EXISTS vector;
GRANT ALL PRIVILEGES ON DATABASE customer_bot_indexing TO customer_bot;
```

## 6. 项目目录建议

推荐目录结构：

```text
/www/wwwroot/bot.factory.website/
  ├─ app/
  └─ shared/
      ├─ .data/
      ├─ logs/
      └─ env/
```

创建目录：

```bash
sudo mkdir -p /www/wwwroot/bot.factory.website
sudo mkdir -p /www/wwwroot/bot.factory.website/shared/.data
sudo mkdir -p /www/wwwroot/bot.factory.website/shared/logs
sudo mkdir -p /www/wwwroot/bot.factory.website/shared/env
```

如果你使用 `www` 用户运行站点，建议赋权：

```bash
sudo chown -R www:www /www/wwwroot/bot.factory.website
sudo chmod -R 775 /www/wwwroot/bot.factory.website/shared
```

## 7. 上传代码后第一轮命令

假设代码目录是 `/www/wwwroot/bot.factory.website/app`：

```bash
cd /www/wwwroot/bot.factory.website/app
npm install
npm run verify:types
npm run app:build
npm run db:migrate
```

如果构建和迁移通过，再启动：

```bash
cd /www/wwwroot/bot.factory.website/app
npm run deploy:pm2:start
pm2 save
pm2 status
```

## 8. 当前必须填写的环境项

最少需要准备：

- `CUSTOMER_BOT_SHARED_DIR`
- `CUSTOMER_BOT_DATABASE_URL`
- `CUSTOMER_BOT_LLM_ENDPOINT`
- `CUSTOMER_BOT_LLM_API_KEY`
- `CUSTOMER_BOT_LLM_MODEL`
- `CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT`
- `CUSTOMER_BOT_PLATFORM_LLM_API_KEY`
- `CUSTOMER_BOT_PLATFORM_LLM_MODEL`
- `TENANT_IDENTITY_SERVICE_URL`
- `KNOWLEDGE_INDEXING_SERVICE_URL`
- `AGENT_RUNTIME_SERVICE_URL`
- `EMBED_DELIVERY_SERVICE_URL`

推荐数据库连接串格式：

```bash
postgres://customer_bot:你的强密码@127.0.0.1:5432/customer_bot_indexing
```

## 9. aaPanel 站点层配置

站点：

- 新建站点：`bot.factory.website`
- 绑定已有 HTTPS 证书
- 配置反向代理到本机端口

当前路径前缀映射：

- `/` -> `127.0.0.1:3203`
- `/identity/` -> `127.0.0.1:3301`
- `/indexing/` -> `127.0.0.1:3302`
- `/runtime/` -> `127.0.0.1:3303`
- `/embed/` -> `127.0.0.1:3304`

## 10. 上线前检查

- `node -v` 为 `22.x`
- `pm2 status` 有 5 个进程
- PostgreSQL 可连接
- `vector` 扩展已启用
- 共享目录存在且可写
- `npm run app:build` 成功
- `npm run db:migrate` 成功
- `/identity/health`
- `/indexing/health`
- `/runtime/health`
- `/embed/health`
- `/admin/login` 可访问

## 11. 你现在可以按这个顺序执行

1. 购买 `4C8G 80G SSD` 的 Ubuntu 服务器
2. 安装 aaPanel、Nginx、Node.js 22、PM2、PostgreSQL 15+
3. 创建 `customer_bot_indexing` 数据库并启用 `vector`
4. 创建 `/www/wwwroot/bot.factory.website/shared/`
5. 上传代码到 `/www/wwwroot/bot.factory.website/app`
6. 填好 `deploy/pm2/ecosystem.config.cjs` 中的真实值
7. 执行 `npm install`
8. 执行 `npm run app:build`
9. 执行 `npm run db:migrate`
10. 执行 `npm run deploy:pm2:start`
11. 在 aaPanel 配置 `bot.factory.website` 的反向代理
12. 用浏览器检查后台和健康接口

## 12. 关联文档

- [aaPanel上线流程.md](D:/ai/aifactory_website/customer_bot/aaPanel上线流程.md)
- [deployment-bot.factory.website-aapanel.md](D:/ai/aifactory_website/customer_bot/docs/deployment-bot.factory.website-aapanel.md)
- [ecosystem.config.cjs](D:/ai/aifactory_website/customer_bot/deploy/pm2/ecosystem.config.cjs)
