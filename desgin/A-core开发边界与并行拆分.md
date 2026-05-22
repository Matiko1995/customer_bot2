# customer_bot2 人工接管 + 座席制 Core 开发边界与并行拆分

## 1. 目标

在不推翻现有 AI 会话体系的前提下，分两层推进：

- Core 基础层：先把“会话状态机 + 消息身份 + 座席基础身份 + 存储兼容”打通
- Feature 并行层：在 Core 完成后，拆成多个互不踩文件的开发任务并行推进

这样可以避免多个 subagent 同时改 `types/index.ts`、`server/lib/chat.ts`、`storage/*` 这类共享高冲突文件。

---

## 2. Core 的定义

Core 只解决“系统能不能支撑人工接管”这个问题，不直接追求完整 UI。

### 2.1 Core 必须包含

1. 共享类型扩展
- `types/index.ts`
- 增加 session / message / tenant user 新字段

2. 存储层兼容
- `server/lib/storage/types.ts`
- `server/lib/storage/file-store.ts`
- `server/lib/storage/memory-store.ts`
- 确保新字段可读写，旧数据有 fallback

3. 聊天核心状态流
- `server/lib/chat.ts`
- 支持：
  - 新建 session 默认 `ai_active`
  - 用户消息写入时带 `senderType='customer'`
  - AI 回复写入时带 `senderType='ai'`
  - 人工接管中的 session 再收到用户消息时，不再继续走 AI 自动回复
  - 返回 `conversationMode`

4. 座席基础身份
- `server/lib/tenant-users.ts`
- 新建 tenant user 时补齐 `displayName`、`seatRole`

5. 核心回归测试
- `tests/server/chat-api.test.ts`
- `tests/server/tenant-users.test.ts`
- 至少覆盖：
  - 默认 session 状态
  - senderType 写入
  - tenant user 默认 seat 字段
  - human_active 时阻断 AI 自动回复

### 2.2 Core 不包含

以下内容不算 Core，可后续并行：
- widget 转人工按钮 UI
- widget 轮询人工消息 UI
- `/tenant/chats` 双栏工作台
- 管理端座席管理页面
- 自动分配 / 转派 / 快捷回复 / 内部备注

---

## 3. Core 完成判定

满足以下条件，即可进入并行开发：

1. `ChatSessionRecord` 已具备状态字段与接管字段
2. `ChatMessageRecord` 已具备 senderType / senderName / senderTenantUserId
3. `TenantUserRecord` 已具备 displayName / seatRole
4. `processChatMessage()` 能识别 `human_active` 与 `handover_requested`
5. 存储层能保存新字段且旧测试不崩
6. Core 相关测试通过

---

## 4. Core 之后的并行拆分

在 Core 完成后，拆成 3 条并行开发流。

### Stream A：客户侧转人工链路

目标：客户可请求人工，widget 可感知人工状态

文件边界：
- `server/api/chat.post.ts`
- `server/api/chat/handover.post.ts`（新建）
- `server/api/chat/session.get.ts`（新建）
- `packages/contracts/src/agent/chat.contract.ts`
- `src/widget.ts`
- `tests/widget.test.ts`
- 新增相关 server/widget 测试文件

职责：
- `/api/chat` 返回 `conversationMode`
- 新增客户请求人工接口
- 新增客户轮询接口
- widget 支持人工等待 / 已接管提示

不负责：
- tenant 座席工作台页面
- admin 座席管理

---

### Stream B：租户座席工作台 + 座席接口

目标：子账户能查看会话、接管、回复、恢复 AI

文件边界：
- `server/api/tenant/chats.get.ts`
- `server/api/tenant/chats/[sessionId].get.ts`（新建）
- `server/api/tenant/chats/[sessionId]/takeover.post.ts`（新建）
- `server/api/tenant/chats/[sessionId]/reply.post.ts`（新建）
- `server/api/tenant/chats/[sessionId]/release.post.ts`（新建）
- `pages/tenant/chats.vue`
- 如需要可新增 `components/tenant/*`

职责：
- 会话列表摘要接口
- 会话详情接口
- 接管/回复/恢复 AI 动作
- `/tenant/chats` 左列表右详情工作台

不负责：
- widget
- admin 座席管理

---

### Stream C：管理端座席管理补齐

目标：管理员可查看并创建租户座席

文件边界：
- `server/api/admin/tenants/[tenantId]/users.get.ts`（新建）
- `server/api/admin/tenants/[tenantId]/users.post.ts`（新建）
- `pages/admin/tenants/[tenantId].vue`
- `packages/contracts/src/tenant/tenant-user.contract.ts`
- 新增相关测试

职责：
- 座席列表
- 新建座席
- 输出临时密码
- admin 页面入口补齐

不负责：
- widget
- tenant 双栏工作台会话交互

---

## 5. 为什么这样拆

### 5.1 避免共享文件冲突

高冲突共享文件：
- `types/index.ts`
- `server/lib/chat.ts`
- `server/lib/storage/file-store.ts`
- `server/lib/storage/memory-store.ts`
- `server/lib/tenant-users.ts`

这些文件统一放入 Core，一次做完。

### 5.2 并行流之间依赖清晰

- Stream A 依赖 Core，但和 Stream B/C 基本不改同一批文件
- Stream B 依赖 Core，但和 Stream A/C 文件交集极少
- Stream C 依赖 Core，但基本只动 admin 与 tenant-user contract

---

## 6. 推荐执行顺序

### Phase 1：Core 串行
1. 测试先行
2. 完成共享类型/存储/chat 基础流
3. 跑核心测试

### Phase 2：并行开发
1. subagent-1：Stream A
2. subagent-2：Stream B
3. subagent-3：Stream C

### Phase 3：集成验证
1. 汇总差异
2. 跑 `npm test`
3. 跑 `npm run verify:types`
4. 如可行，再做一次页面/API 手工检查

---

## 7. 本次建议的 subagent 任务定义

### Task 0（先行）
Core 基础层实现：
- 类型扩展
- 存储兼容
- chat 状态流
- tenant user 默认 seat 字段
- 核心测试

### Task 1（并行）
客户侧转人工 + widget 轮询

### Task 2（并行）
tenant 座席工作台 + 接管/回复/恢复 AI

### Task 3（并行）
admin 座席管理接口 + 页面补齐

---

## 8. 当前结论

现在可以认为：
- B/C/D 文档已落盘
- Core 边界已经清晰
- 下一步应先完成 Task 0（Core）
- Core 完成后立即并行派发 Task 1/2/3
