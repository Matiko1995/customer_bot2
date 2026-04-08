# AI 客服训练文档

本目录下文件基于以下设计文档整理生成：

- `ai-manufacturing-trade-site/agentDesgin/文案.md`
- `ai-manufacturing-trade-site/agentDesgin/法务.md`
- `ai-manufacturing-trade-site/agentDesgin/财务.md`
- `ai-manufacturing-trade-site/agentDesgin/运营.md`

可直接导入到 `customer_bot` 后台对应模块：

- `knowledgeEntries.json` -> 知识条目
- `articles.json` -> 文档摘要
- `contentSources.json` -> 资料源

说明：

- 当前内容重点用于“页面能力介绍型”问答训练
- 尚未包含真实价格表和明确咨询报价
- 如果后续补充真实产品参数、服务清单和商务口径，可以继续生成 `products.json` 和 `consultingServices.json`
