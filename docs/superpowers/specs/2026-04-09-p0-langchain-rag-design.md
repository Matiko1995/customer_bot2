# P0 LangChain RAG Design

Date: 2026-04-09

## Goal

将当前项目从“关键词/规则召回 + 文本拼接 + 可选 LLM 润色”升级为真正的 `LangChain + RAG + 向量库` 流水线，同时保持单项目部署，不拆独立 worker。

P0 必须支持：

- 租户级资料隔离
- 自动化资料接入
- 手动同步与周期同步
- 文档切块、embedding、向量检索
- FAQ / 价格问题结构化直达
- 非价格未命中时的平台共享大模型兜底
- 子租户 token 用量归集
- 资料导入完成后自动生成一套中文 agent 文档包

## Current State

当前项目已有：

- 多租户聊天链路与 `/api/chat`
- 租户后台与资料维护入口
- 留资、账单、聊天记录、usage 统计
- `contentSources`、`knowledgeEntries` 等内容模型

当前项目尚不具备真正 RAG：

- `lib/customer-bot.ts` 主要是关键词匹配和手工打分
- `contentSources` 没有真实向量索引
- `training-simulator` 只是模拟记账，不做 parse/chunk/embed/index
- 引用来源主要来自手工拼接，不是 chunk 级命中

## Scope

### In Scope

- 引入 `Postgres + pgvector`
- 接入网站页面、Word、Excel、CSV、IMAP 邮件
- 新增资料源、同步任务、文档、chunk、检索命中等模型
- 在当前 Nitro 服务内实现 ingestion pipeline
- 聊天链路改为 classify -> structured fast-path -> RAG -> shared fallback
- 返回 citations、answerSource、credentialSource、retrievalConfidence
- 记录平台共享模型的子租户 usage
- 在导入/同步成功后生成 agent markdown 文档

### Out of Scope

- 微信平台或其他外部渠道
- 独立 worker 服务
- 实时 webhook 同步
- 复杂 rerank 实验
- 一次性重做全部后台 UI

## Architecture

P0 保持单项目部署，但在仓库内分成 4 层：

### 1. Admin / Content Console

负责资料源配置、手动同步、计划周期、失败重试、索引状态和命中查看。

### 2. Ingestion Pipeline

负责网页抓取、文件解析、IMAP 拉取、文档标准化、切块、embedding、入库，以及在成功导入后生成 agent 文档包。

### 3. Retrieval / Index

用 `Postgres + pgvector` 存文档元数据与向量；所有检索都必须按 `tenant_id` 过滤。

### 4. Chat Runtime

保留现有 `/api/chat` 对外入口，但内部改成：

1. 问题分类
2. FAQ / 价格直达
3. RAG 检索
4. 资料未命中时的共享模型兜底
5. citations 与 usage 记录

## Data Model

结构化数据继续保留，但角色变化：

- `knowledgeEntries`：人工 FAQ / 标准回复
- `products` / `consultingServices`：价格与参数直达

新增 RAG 主模型：

- `data_sources`
- `ingestion_jobs`
- `source_documents`
- `document_chunks`
- `retrieval_hits`

推荐字段重点：

- `data_sources`: `tenant_id`, `type`, `status`, `sync_mode`, `schedule_cron`, `config_json`
- `ingestion_jobs`: `trigger_mode`, `status`, `error_message`, `stats_json`
- `source_documents`: `data_source_id`, `source_uri`, `content_hash`, `version_hash`
- `document_chunks`: `document_id`, `chunk_index`, `content`, `metadata_json`, `embedding`

## Ingestion Design

### Website

配置项：

- 起始 URL
- 允许域名
- 抓取深度
- 页面上限
- 包含/排除规则
- 周期计划

### Word / Excel / CSV

流程：

1. 上传文件到 `.data/source-assets/`
2. 服务端解析文本
3. 标准化为 document
4. 切块并写入向量库

### IMAP

配置项：

- host / port / secure
- username / password
- mailbox
- lookback window
- 周期计划

流程：

1. 拉取新邮件
2. 提取正文和支持的附件
3. 标准化为 document
4. 切块并写入向量库

## Retrieval Policy

统一问答链路如下：

1. `query classify`
   分成 `faq`、`price`、`document`、`contact`
2. `structured fast-path`
   FAQ 走标准回复；价格只走结构化价格数据
3. `rag retrieval`
   文档问题走 tenant-scoped 向量检索
4. `answer generation`
   基于命中 chunk 生成回答并返回 citations
5. `shared fallback`
   非价格且资料未命中时，调用平台共享模型

关键约束：

- 价格问题禁止自由估价
- FAQ 优先人工口径
- 所有检索必须 tenant-scoped
- `general_fallback` 必须显式标记不是基于租户资料生成

## Shared Platform LLM

由平台总账号统一配置：

- `CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT`
- `CUSTOMER_BOT_PLATFORM_LLM_API_KEY`
- `CUSTOMER_BOT_PLATFORM_LLM_MODEL`

只有“非价格且资料未命中”的问题允许使用这组凭据。

usage 需要新增：

- `answerSource`: `structured` | `rag` | `general_fallback`
- `credentialSource`: `tenant` | `platform_shared`

## Admin Changes

租户后台应新增：

- 资料源管理
- 文件上传
- 手动同步
- 周期计划
- 同步任务历史
- 索引状态
- 最近命中片段查看

当前“模拟训练”入口要被真实同步/建索引入口替代。

## Agent Documentation Bundle

每次资料导入或同步成功后，系统应基于已导入的数据、租户品牌信息、FAQ/产品/资料源配置，自动生成一套中文 markdown 文档，作为 agent 的本地说明与人格档案。

建议输出目录：

- `.data/agent-docs/<tenantId>/latest/`

首期固定输出以下文件：

- `AGENTS.md`
- `BOOTSTRAP.md`
- `HEARTBEAT.md`
- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `TOOLS.md`

推荐内容边界：

- `AGENTS.md`：agent 总体职责、回答边界、资料优先级、引用规则
- `BOOTSTRAP.md`：启动时应加载的关键配置、数据来源、初始化顺序
- `HEARTBEAT.md`：同步状态、索引状态、周期任务、异常检查点
- `IDENTITY.md`：品牌身份、行业定位、回答角色设定
- `SOUL.md`：语气、价值观、禁忌表达、服务风格
- `USER.md`：目标用户、常见诉求、服务分流策略
- `TOOLS.md`：可用资料源、结构化能力、RAG 能力、兜底模型使用规则

这些文档必须：

- 使用中文编写
- 从当前导入数据中提炼，而不是固定模板硬编码
- 在每次成功同步后可覆盖更新
- 与租户隔离，不能混入其他租户资料

## Acceptance Criteria

P0 完成标准：

1. 网站、Word、Excel、CSV、IMAP 资料源可创建。
2. 手动同步能产出 documents 与 chunks。
3. 周期同步能自动创建 job。
4. 问答检索严格限制在本租户内。
5. FAQ / 价格问题不会误走自由生成。
6. 文档问题返回 citations。
7. 非价格未命中问题可以走共享模型兜底。
8. 共享模型 usage 能归集到对应子租户。
9. 账单能区分 tenant 与 platform_shared 消耗。
10. 每次资料导入成功后，本地会生成一套中文 agent 文档包，至少包含 `AGENTS.md`、`BOOTSTRAP.md`、`HEARTBEAT.md`、`IDENTITY.md`、`SOUL.md`、`USER.md`、`TOOLS.md`。
