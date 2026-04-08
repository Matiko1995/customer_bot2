# Customer Bot Design

## Goal

从当前项目中提取 `AI 客服` 功能，在 `/Users/matiko/Documents/Webstrom/aifactory_websitem/customer_bot` 下构建一个最小可运行版本，保留三类能力：

- 文档问答
- 价格查询
- 联系提交

## Source Scope

当前能力主要来自以下文件：

- `app/components/AiSupportWidget.vue`
- `app/config/ai-assistant-knowledge.ts`
- `app/app.vue`

## Recommended Approach

采用最小复制迁移方案，而不是组件包化。

原因：

- 当前实现依赖 Nuxt/Vue 运行时与站点接口
- 这次目标是先独立运行，不是做长期标准组件包
- 最小复制可以在较短路径内保留现有交互与样式

## Target Structure

在 `customer_bot` 下建立一个最小 Nuxt 页面级示例：

- `app.vue`：挂载客服组件
- `components/AiSupportWidget.vue`：迁移后的客服组件
- `config/ai-assistant-knowledge.ts`：知识条目
- `config/customer-bot-data.ts`：本地回退数据与可配置接口
- `types/index.ts`：最小类型定义
- `server/api/contact.post.ts`：本地演示提交接口
- `tests/`：最小行为测试

## Data Strategy

### 文档问答

- 保留知识库优先匹配逻辑
- 若无外部接口，则使用本地静态知识与示例站点信息

### 价格查询

- 使用本地静态产品与咨询服务数据
- 保留模糊匹配与默认示例推荐

### 联系提交

- 默认提交到本地演示接口
- 返回成功提示，保证迁移后功能闭环

## Decoupling Rules

- 去除对原站点 `/api/site-config`、`/api/articles`、`/api/products`、`/api/consulting-services` 的硬依赖
- 去除对原项目 `useSiteConfig` 的依赖
- 将站点文案、联系信息、产品数据收敛到本地配置文件

## Verification

完成标准：

- 项目可安装依赖并启动
- 页面加载后显示浮动 `AI 客服` 入口
- 三个模块可切换
- 文档问答可返回结构化文本
- 价格查询可返回本地价格数据
- 联系表单可提交并返回成功提示
- 至少有一组测试覆盖核心纯函数行为
