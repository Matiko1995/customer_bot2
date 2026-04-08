# 当前机器人发布脚本及流程

本文档给出当前 `Customer Bot` 机器人的实际发布脚本和推荐发布流程。

## 1. 当前可用发布脚本

脚本文件：

- [scripts/release-current.sh](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/scripts/release-current.sh)
- [scripts/deploy-current.sh](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/scripts/deploy-current.sh)

默认用途：

- 安装依赖
- 执行测试
- 构建生产产物
- 可选重启 `systemd` 服务
- 一键拉代码、发布、重启并做健康检查

## 2. 最常用执行方式

### 2.1 本地检查版

只做安装、测试、构建，不重启服务：

```bash
bash scripts/release-current.sh
```

### 2.2 服务器正式发布版

构建完成后自动重启服务：

```bash
RUN_RESTART=1 SERVICE_NAME=customer-bot bash scripts/release-current.sh
```

### 2.3 跳过安装

服务器依赖已安装时可用：

```bash
RUN_INSTALL=0 RUN_RESTART=1 SERVICE_NAME=customer-bot bash scripts/release-current.sh
```

### 2.4 服务器一键部署版

直接完成拉代码、发布、重启和健康检查：

```bash
bash scripts/deploy-current.sh
```

如果需要指定分支：

```bash
BRANCH_NAME=main bash scripts/deploy-current.sh
```

## 3. 脚本使用的默认参数

```bash
SERVICE_NAME=customer-bot
ENV_FILE=/srv/customer-bot/shared/.env
SHARED_DIR=/srv/customer-bot/shared
RUN_INSTALL=1
RUN_TESTS=1
RUN_BUILD=1
RUN_RESTART=0
```

你也可以临时覆盖：

```bash
ENV_FILE=/custom/path/.env SHARED_DIR=/custom/shared RUN_RESTART=1 bash scripts/release-current.sh
```

一键部署脚本默认参数：

```bash
BRANCH_NAME=main
REMOTE_NAME=origin
SERVICE_NAME=customer-bot
HEALTHCHECK_URL=https://bot.aifactory.website/admin/login
HEALTHCHECK_RETRIES=12
HEALTHCHECK_INTERVAL=5
RUN_GIT_PULL=1
RUN_INSTALL=1
RUN_TESTS=1
RUN_BUILD=1
ENV_FILE=/srv/customer-bot/shared/.env
SHARED_DIR=/srv/customer-bot/shared
```

## 4. 当前发布流程

### 第一步：推荐直接执行一键部署脚本

```bash
bash scripts/deploy-current.sh
```

### 第二步：脚本会自动执行以下动作

- `git fetch origin`
- `git pull origin main`
- `npm install`
- `npm test`
- `npm run build`
- `sudo systemctl restart customer-bot`
- 访问 `https://bot.aifactory.website/admin/login` 做健康检查

### 第三步：检查服务状态

```bash
sudo systemctl status customer-bot --no-pager
```

### 第四步：上线验收

至少检查以下页面：

- `https://bot.aifactory.website/admin/login`
- `https://bot.aifactory.website/admin`
- `https://bot.aifactory.website/customer-bot.js`
- `https://bot.aifactory.website/tenant/login`

### 第五步：业务验收

至少验证以下动作：

- 后台管理员可登录
- 刷新 `/admin` 后不再掉登录
- 新建租户成功
- 租户详情页安装面板显示正式域名
- 客户站点可正常挂载机器人脚本
- 租户端可查看只读后台

## 5. 当前发布产物

脚本执行完成后，核心产物为：

- 前端挂件脚本：`dist/customer-bot.js`
- Nuxt 服务端：`.output/`

正式对外地址为：

- `https://bot.aifactory.website/customer-bot.js`

## 6. 回滚流程

如果发布后异常：

1. 切回上一版代码或上一版发布目录
2. 重新启动服务
3. 验证后台、挂件和租户登录是否恢复

如果你使用版本目录部署，推荐：

```bash
sudo systemctl restart customer-bot
```

## 7. 配套文档

更完整的文档见：

- [system-release.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/system-release.md)
- [install-bot.aifactory.website.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/install-bot.aifactory.website.md)
- [customer-install.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/customer-install.md)
