# bot.aifactory.website 安装文档

本文档用于客户站点接入 `Customer Bot` 正式版脚本。

## 正式安装代码

将以下代码插入客户网站页面底部，通常放在 `</body>` 前：

```html
<script src="https://bot.aifactory.website/customer-bot.js"></script>
<script>
  CustomerBot.init({
    tenantId: '请替换为你的租户ID',
    apiBaseUrl: 'https://bot.aifactory.website'
  })
</script>
```

## iframe 安装代码

如果客户站点更适合 iframe 方式，可改为：

```html
<script src="https://bot.aifactory.website/customer-bot.js"></script>
<script>
  CustomerBot.init({
    tenantId: '请替换为你的租户ID',
    apiBaseUrl: 'https://bot.aifactory.website',
    mode: 'iframe',
    iframeSrc: 'https://bot.aifactory.website/customer-bot-frame.html'
  })
</script>
```

## 交付客户时需要提供

- 脚本地址：`https://bot.aifactory.website/customer-bot.js`
- API 地址：`https://bot.aifactory.website`
- 租户登录地址：`https://bot.aifactory.website/tenant/login`
- 租户 ID
- 客户登录邮箱
- 初始密码

## 客户验证步骤

1. 打开客户站点页面，确认右下角出现 AI 客服按钮。
2. 发送一条测试消息，确认可以获得回复。
3. 上传一张截图附件，确认聊天正常返回。
4. 如已开放留资流程，提交一条联系方式，确认后台可见。
5. 使用租户账号登录 `https://bot.aifactory.website/tenant/login`，确认可只读查看概览、聊天记录和留资。

## 说明

- 当前默认正式域名已统一为 `https://bot.aifactory.website`
- 如后续切换域名，只需修改环境变量 `CUSTOMER_BOT_PUBLIC_BASE_URL`
