# 租户只读交付说明

本文档用于把当前系统交付给单个租户客户，只开放“只读查看”能力。

## 客户可访问内容

- 租户登录页：`/tenant/login`
- 租户控制台：`/tenant`
- 本租户概览数据
- 本租户训练记录
- 本租户账单摘要
- 本租户聊天记录：`/tenant/chats`
- 本租户留资记录：`/tenant/leads`
- 首次登录修改密码
- 忘记密码后通过重置码修改密码

## 客户不可执行操作

- 不可编辑资料源
- 不可发起训练
- 不可修改套餐
- 不可修改账单
- 不可查看其他租户
- 不可进入平台后台 `/admin`

## 交付给客户的信息

- 租户登录地址
- 登录邮箱
- 初始密码

示例：

```text
登录地址：https://bot.aifactory.website/tenant/login
登录邮箱：demo@example.com
初始密码：wLAtNAueCa
```

## 首次使用建议

1. 客户使用初始密码登录。
2. 首次进入后立即修改密码。
3. 如忘记密码，可在登录页使用重置码流程。

## 平台侧操作

- 平台管理员可在租户详情页查看租户登录账号。
- 平台管理员可在租户详情页生成重置码。
- 新增租户时系统会自动生成租户登录账号和初始密码。

## 邮件发送

- 默认未配置邮件服务时，系统会把重置邮件写入本地 outbox 文件：
  `.data/customer-bot-mail-outbox.json`
- 配置以下环境变量后，可通过 Resend 真实发送邮件：

```bash
CUSTOMER_BOT_MAIL_PROVIDER=resend
CUSTOMER_BOT_MAIL_FROM=no-reply@your-domain.example
CUSTOMER_BOT_RESEND_API_KEY=re_xxx
```

## 当前限制

- 当前正式邮件发送仅实现了 Resend 渠道。
- 如果你使用企业 SMTP、阿里云邮件推送或其他渠道，需要再补对应 provider。
