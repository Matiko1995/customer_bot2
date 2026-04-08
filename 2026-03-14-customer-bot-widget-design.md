# Customer Bot Widget Design

## Goal

将当前 `customer_bot` 从 Nuxt 示例改造成可嵌入任意网站的浏览器端 JS 插件，接入方式为：

```html
<script src="/customer-bot.js"></script>
<script>
  CustomerBot.init({...})
</script>
```

## Chosen Shape

采用单文件浏览器插件，而不是继续依赖 Vue/Nuxt。

## Public API

- `CustomerBot.init(options)`
- `CustomerBot.open()`
- `CustomerBot.close()`
- `CustomerBot.destroy()`

## Rendering Strategy

- 原生 DOM 创建挂件容器
- 动态注入带 `cbot-` 前缀的样式
- 在页面右下角渲染触发按钮和展开面板

## Data Strategy

- 优先读取 `init` 传入的 `knowledge`、`products`、`consultingServices`、`contact`
- 未传入时回退到本地 demo 数据
- 联系表单如果配置 `submitEndpoint`，则通过 `fetch` 提交；否则返回本地成功提示

## Reuse

保留并继续复用：

- `lib/customer-bot.ts` 中的纯查询与回答逻辑
- `config/ai-assistant-knowledge.ts`
- `config/customer-bot-data.ts`

## Packaging

- 使用 `tsup` 打包为浏览器端 IIFE 文件
- 输出 `dist/customer-bot.js`

## Verification

- Vitest 覆盖 `init/open/close/destroy` 与基础渲染
- 打包成功输出 `dist/customer-bot.js`
