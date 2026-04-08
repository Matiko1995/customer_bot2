# Customer Bot 客户安装说明

## 适用范围

本文档面向需要把 `Customer Bot` SaaS 客服挂件安装到自己网站上的客户。

当前版本支持：

- 网页端 AI 客服挂件
- 租户级品牌配置
- 服务端聊天会话
- 留资提交
- Token 用量记录
- 截图附件上传
- 产品参数表回答
- 回答中的参考资料提示
- 租户自助登录查看训练记录、账单摘要、聊天记录与留资

## 你会拿到什么

实施方会提供以下信息：

- `customer-bot.js` 脚本地址
- 你的 `tenantId`
- 你的租户登录邮箱
- 初始密码
- 联系支持渠道

示例：

```text
脚本地址: https://bot.aifactory.website/customer-bot.js
tenantId: tenant-demo
API 地址: https://bot.aifactory.website
租户登录地址: https://bot.aifactory.website/tenant/login
租户登录邮箱: demo@example.com
初始密码: Temp123456
```

## 安装方式

把下面两段脚本插入到你的网站页面底部，通常放在 `</body>` 前面：

```html
<script src="https://bot.aifactory.website/customer-bot.js"></script>
<script>
  CustomerBot.init({
    tenantId: 'tenant-demo',
    apiBaseUrl: 'https://bot.aifactory.website'
  })
</script>
```

## 可选配置

如果你希望脚本从 iframe 模式加载，可以使用：

```html
<script src="https://bot.aifactory.website/customer-bot.js"></script>
<script>
  CustomerBot.init({
    tenantId: 'tenant-demo',
    apiBaseUrl: 'https://bot.aifactory.website',
    mode: 'iframe',
    iframeSrc: 'https://bot.aifactory.website/customer-bot-frame.html'
  })
</script>
```

## 安装完成后的验证步骤

1. 打开网站页面，右下角应出现 `AI 客服` 按钮。
2. 点击按钮后，挂件应正常展开。
3. 发送一条测试消息，例如 `请介绍一下你们的服务`。
4. 页面应返回 AI 回复。
5. 可再上传一张截图附件，发送 `请结合截图说明问题` 做验证。
6. 在管理员后台中，应能看到：
   - 聊天记录
   - Token 用量
   - 若提交联系表单，则能看到留资记录
   - 若上传截图，则能在聊天详情中看到附件缩略图

## SaaS 服务端安装方说明

如果你是实施方，需要先把 SaaS 服务端部署起来，再把 `customer-bot.js` 地址和 `tenantId` 发给客户。

```bash
npm install
npm run build
npm run preview
```

默认数据文件：

```text
.data/customer-bot-storage.json
```

如需改到自定义位置，可设置：

```bash
CUSTOMER_BOT_DATA_FILE=/absolute/path/customer-bot-storage.json
CUSTOMER_BOT_PUBLIC_BASE_URL=https://bot.aifactory.website
CUSTOMER_BOT_STAGING_BASE_URL=https://bot.aifactory.website
CUSTOMER_BOT_MAIL_PROVIDER=resend
CUSTOMER_BOT_MAIL_FROM=no-reply@bot.aifactory.website
CUSTOMER_BOT_RESEND_API_KEY=re_xxx
```

邮件发送说明：

- 未配置邮件服务时，系统会把重置邮件写入本地 outbox 文件，便于演示
- 配置 `CUSTOMER_BOT_MAIL_PROVIDER=resend` 后，会通过 Resend 真实发送重置邮件
- 本地 outbox 默认文件为 `.data/customer-bot-mail-outbox.json`

租户详情页安装面板支持切换“测试环境 / 正式环境”，并可一键复制：

- Tenant ID
- Embed Key
- 脚本地址
- API 地址
- 完整安装代码

默认后台入口：

```text
/admin/login
admin@example.com / admin123456
```

租户自助入口：

```text
/tenant/login
```

租户首次收到账号后建议：

1. 用初始密码登录
2. 首次进入后立即修改密码
3. 如果忘记密码，可使用登录页的重置码流程

租户登录后当前可只读查看：

- 控制台概览：`/tenant`
- 聊天记录：`/tenant/chats`
- 留资记录：`/tenant/leads`

租户内容维护入口：

```text
/admin/tenants/{tenantId}
```

在租户详情页中可直接粘贴或导入 JSON，维护该租户的：

- 知识条目
- 文档摘要
- 产品参数表
- 咨询服务

也可以在同一页面维护“资料源”，作为问答训练内容参与检索：

- 网页：可填写页面 URL，并粘贴正文摘录
- 邮件：可填写邮件主题/发件人，并粘贴邮件正文
- 文档：可填写文件名，并粘贴文档摘要或原文片段
- 表格：建议上传 CSV/TSV 或粘贴表格文本，作为 Excel 类资料源

当前内容运营后台还支持：

- 资料源启用 / 停用
- 按资料分类筛选查看
- 聊天记录中查看“命中资料源”
- 在租户详情页查看资料源命中次数排行

## 常见问题

### 1. 页面上没有出现客服按钮

请检查：

- `customer-bot.js` 地址是否可访问
- 页面是否加载了脚本
- `tenantId` 是否填写正确

### 2. 挂件打开了，但发送消息没有回复

请检查：

- SaaS 服务端是否运行正常
- 该 `tenantId` 是否处于 `active` 状态
- 浏览器控制台是否有接口报错

### 3. 留资提交失败

请检查：

- 是否使用了正确的 SaaS 服务域名
- 联系方式字段是否已填写

## 推荐接入环境

- 正式环境优先使用 HTTPS
- 若站点有 CSP，请放行挂件脚本域名和 API 域名
- 若站点有反向代理，请确认不会拦截 `/api/embed/config`、`/api/chat`、`/api/contact`

## 对接支持

如需帮助，请联系实施方并提供：

- 页面 URL
- `tenantId`
- 浏览器报错截图
- 问题发生时间
