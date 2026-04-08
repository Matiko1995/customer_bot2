以下能力已经落地，并且从代码结构上看是可演示、可安装、可运营的：

- 多租户基础能力：租户创建、编辑、状态管理、tenantId / embedKey 管理，见 pages/admin/tenants/index.vue 和 pages/admin/tenants/[tenantId].vue
- 租户运行时配置下发：挂件可按租户读取品牌、联系方式、提示词等，见 server/api/embed/config.get.ts
- 嵌入式网页客服挂件：支持客户站点通过 customer-bot.js 接入，见 server/routes/customer-bot.js.get.ts 和 src/widget.ts
- 跨站挂载能力：支持 apiBaseUrl，可独立部署 bot 服务再嵌入第三方站点，见 src/widget.ts
- 聊天记录持久化：会话、消息、附件、留资、用量均已落盘到本地文件，见 server/lib/storage/file-store.ts
- 多轮上下文：同一 sessionId 下会读取历史消息再继续回答，见 server/lib/chat.ts
- 截图附件随会话保存：聊天支持图片附件上传并持久化，后台也能看到，见 server/api/chat.post.ts 和 src/widget.ts
- 留资能力：前台可提交联系人信息，后台可按租户查看，见 server/api/contact.post.ts 和 pages/admin/leads.vue
- Token 用量记录与月度汇总：已能记录 input/output/total tokens，并按租户汇总，见 server/lib/billing.ts 和 pages/admin/billing.vue
- 统一计费骨架：当前已经有用量记录和金额字段，适合先做统一费率，不做模型差异计费，见 types/index.ts
- 租户级知识库配置：支持知识条目、文档摘要、产品参数、咨询服务的结构化配置，见 pages/admin/tenants/[tenantId].vue
- 多来源资料源：已支持网页、邮件、文档、表格资料源录入并参与回答检索，见 types/index.ts 和 lib/customer-bot.ts
- 回答引用来源：回答中会输出参考资料，利于客服和客户核对，见 lib/customer-bot.ts
- 后台管理员登录：已有基础后台登录态，适合你内部代运营使用，见 pages/admin/login.vue
- 客户安装说明：已具备客户安装文档和嵌入代码说明，见 customer-install.md

当前还不算完成的部分
如果目标是“对外收费试运营”，现在缺的不是功能数量，而是交易闭环和运营闭环里最短的一段：

- 还没有真正的“金额计算规则落地”页面或结算视图。现在有用量记录，但 amount 仍然是骨架字段，不足以对账收费。
- 还没有套餐配置能力。用户前面定的是“套餐计费 + 按 token 计算费用”，目前只完成了“按 token 记录”，还没完成“套餐规则”。
- 还没有租户级账单明细页。当前更像统计页，不像可给客户对账的账单页。
- 还没有运营告警和手工纠错机制。比如模型失败、知识命中差、附件异常，没有后台提示。
- 还没有正式的内容导入工作流。现在资料源是人工录入型 MVP，不是自动抓取/解析型。
- 还没有客户自助开通、支付、续费。这一点你此前已经明确不优先，所以现在不算 blocker。
- 还没有权限分层。现在是单后台管理员，更适合你内部代运营，不适合多运营角色协作。
