# Customer Bot 系统发布文档

本文档用于将当前 `Customer Bot` 系统发布到正式环境 `https://bot.aifactory.website`，并作为后续版本发版、回滚和验收的统一操作说明。

## 1. 发布目标

当前系统用于：

- 对外提供可嵌入客户网站的 AI 客服挂件
- 提供平台后台进行租户管理、内容运营、训练与账单查看
- 提供租户只读后台，供客户查看训练记录、聊天记录、留资和账单摘要

当前正式域名约定：

- Bot 正式域名：`https://bot.aifactory.website`
- 挂件脚本地址：`https://bot.aifactory.website/customer-bot.js`
- 租户登录地址：`https://bot.aifactory.website/tenant/login`
- 平台后台地址：`https://bot.aifactory.website/admin/login`

## 2. 当前发布内容

本次发布包含以下核心能力：

- 多租户 AI 客服挂件接入
- 按租户下发品牌配置与运行时配置
- 聊天记录、附件、留资、Token 用量持久化
- 多轮上下文会话
- 网页 / 邮件 / 文档 / 表格资料源维护
- 训练模拟与训练消耗记录
- 套餐计费骨架与月度账单汇总
- 平台管理员后台
- 租户只读后台
- 邮箱重置码改密

## 3. 部署前准备

发布前请确认：

- 已准备好正式域名 `bot.aifactory.website`
- 已配置反向代理或 Node 服务监听端口
- 服务器已安装 Node.js 20+ 与 npm
- 服务器具备可写数据目录
- 如需真实发送邮件，已准备 Resend Key 与发信域名

建议目录结构：

```text
/srv/customer-bot/
  ├─ current/
  ├─ releases/
  └─ shared/
      ├─ .data/
      └─ .env
```

## 4. 环境变量

正式环境建议至少配置以下变量：

```bash
CUSTOMER_BOT_PUBLIC_BASE_URL=https://bot.aifactory.website
CUSTOMER_BOT_STAGING_BASE_URL=https://bot.aifactory.website

CUSTOMER_BOT_ADMIN_EMAIL=admin@example.com
CUSTOMER_BOT_ADMIN_PASSWORD=admin123456

CUSTOMER_BOT_DATA_FILE=/srv/customer-bot/shared/.data/customer-bot-storage.json
CUSTOMER_BOT_MAIL_OUTBOX_FILE=/srv/customer-bot/shared/.data/customer-bot-mail-outbox.json

CUSTOMER_BOT_MAIL_PROVIDER=resend
CUSTOMER_BOT_MAIL_FROM=no-reply@bot.aifactory.website
CUSTOMER_BOT_RESEND_API_KEY=re_xxx
```

如果暂时不启用真实邮件，可不设置：

- `CUSTOMER_BOT_MAIL_PROVIDER`
- `CUSTOMER_BOT_MAIL_FROM`
- `CUSTOMER_BOT_RESEND_API_KEY`

此时系统会将重置邮件写入本地 outbox 文件，便于演示和排查。

## 5. 构建与发布步骤

### 5.1 获取代码

```bash
git pull origin main
```

也可以直接使用一键部署脚本：

```bash
bash scripts/deploy-current.sh
```

### 5.2 安装依赖

```bash
npm install
```

### 5.3 测试校验

```bash
npm test
```

发布前要求：

- 所有测试通过
- 无关键功能回归

### 5.4 生产构建

```bash
npm run build
```

构建后产物：

- 挂件脚本：`dist/customer-bot.js`
- Nuxt 服务端：`.output/`

### 5.5 启动服务

```bash
npm run preview
```

等价于：

```bash
node .output/server/index.mjs
```

生产环境建议使用 `pm2` 或 `systemd` 守护。

## 6. systemd 示例

可在服务器上创建如下服务文件：

```ini
[Unit]
Description=Customer Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/customer-bot/current
EnvironmentFile=/srv/customer-bot/shared/.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable customer-bot
sudo systemctl restart customer-bot
sudo systemctl status customer-bot
```

## 7. Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name bot.aifactory.website;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bot.aifactory.website;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 8. 首次上线初始化

系统首次启动后需要完成：

1. 打开平台后台：`https://bot.aifactory.website/admin/login`
2. 使用管理员账号登录
3. 新建至少一个租户
4. 为租户补充品牌信息、资料源和套餐信息
5. 复制安装代码给客户站点接入
6. 使用租户账号登录 `https://bot.aifactory.website/tenant/login` 验证只读后台

## 9. 发布后验收清单

### 9.1 平台侧验收

- `/admin/login` 能正常登录
- `/admin` 控制台加载正常
- `/admin/tenants` 可查看租户列表
- 租户详情页安装面板显示正式域名 `https://bot.aifactory.website`
- 新增租户后可自动生成租户登录账号

### 9.2 Bot 验收

- 访问 `https://bot.aifactory.website/customer-bot.js` 可返回脚本
- 客户页面嵌入后挂件正常弹出
- 发送消息后可得到回复
- 上传截图附件后会话内可见
- 若触发留资，后台可看到记录

### 9.3 租户侧验收

- `/tenant/login` 可正常登录
- `/tenant` 可查看概览、训练记录和账单摘要
- `/tenant/chats` 可只读查看聊天记录、命中资料和附件
- `/tenant/leads` 可只读查看留资记录
- 忘记密码时可生成重置码并成功改密

## 10. 交付客户资料

给客户的最小交付内容如下：

- 租户 ID
- 安装代码
- 租户登录地址
- 客户登录邮箱
- 初始密码

参考安装文档：

- [install-bot.aifactory.website.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/install-bot.aifactory.website.md)
- [customer-install.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/customer-install.md)
- [tenant-readonly-delivery.md](/Users/matiko/Documents/Webstrom/aifactory_website/customer_bot/tenant-readonly-delivery.md)

## 11. 回滚方案

若新版本上线异常，建议使用“版本目录 + current 软链”的方式回滚：

1. 保留旧版本构建产物
2. 将 `current` 链接切回上一版本
3. 重启 Node 服务
4. 验证核心页面和挂件恢复正常

回滚后优先检查：

- 后台登录是否恢复
- 挂件脚本是否可访问
- 客户站点消息是否恢复
- 数据文件路径是否仍指向共享目录

注意：

- 数据文件必须放在共享目录，不能随发布目录一起覆盖
- `.env` 也应放在共享目录，避免回滚时丢失配置

## 12. 常见故障排查

### 12.1 安装面板仍显示 localhost

请检查：

- 是否配置了 `CUSTOMER_BOT_PUBLIC_BASE_URL`
- 是否已重启应用
- 当前版本是否已包含正式域名默认值

### 12.2 挂件脚本无法访问

请检查：

- `npm run build` 是否成功
- `dist/customer-bot.js` 是否已生成
- Nginx 是否正确转发到 Node 服务

### 12.3 聊天正常但重置邮件未发送

请检查：

- `CUSTOMER_BOT_MAIL_PROVIDER` 是否为 `resend`
- `CUSTOMER_BOT_MAIL_FROM` 是否已配置
- `CUSTOMER_BOT_RESEND_API_KEY` 是否有效
- 若未配置邮件服务，请查看本地 outbox 文件

### 12.4 数据丢失

请检查：

- `CUSTOMER_BOT_DATA_FILE` 是否配置为共享持久化路径
- 发布目录切换时是否误删 `.data`

## 13. 当前版本建议

当前版本适合：

- 对外收费试运营
- 你方代运营多个租户
- 先跑通客户接入、训练、计费、查看闭环

当前版本还建议后续继续补：

- 正式账单导出
- 更多邮件 provider
- 自动抓取 / 解析内容源
- 更细的运营权限分层
- 线上监控与告警
