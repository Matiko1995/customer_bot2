# customer_bot2 人工接管 + 座席制

## 文档目标
本文件给出本次 MVP 需要新增或扩展的核心字段，覆盖：
1. 会话 ChatSessionRecord
2. 消息 ChatMessageRecord
3. 租户子账户 TenantUserRecord
4. 前后端契约字段

原则：
- 尽量复用现有存储模型，不另起第二套人工客服数据结构
- 尽量兼容现有 role='user' | 'assistant' 的消息模型
- MVP 优先，先支持人工接管，再考虑自动分配、备注、质检等增强能力

---

## 1. ChatSessionRecord 字段扩展

当前已存在：
- id
- tenantId
- visitorId
- startedAt
- lastMessageAt

建议扩展后：

```ts
interface ChatSessionRecord {
  id: string
  tenantId: string
  visitorId: string
  startedAt: number
  lastMessageAt: number

  status: 'ai_active' | 'handover_requested' | 'human_active' | 'closed'

  assignedTenantUserId?: string
  assignedAt?: number
  handoverRequestedAt?: number
  handoverStartedAt?: number
  handoverEndedAt?: number

  lastCustomerMessageAt?: number
  lastAgentMessageAt?: number

  unreadForAgent?: number
  unreadForCustomer?: number

  customerDisplayName?: string
  customerContact?: string
  latestMessagePreview?: string

  sessionPublicToken?: string
}
```

### 字段说明

1. status
- ai_active：AI 正常接待
- handover_requested：客户请求人工，待座席接管
- human_active：已由座席接管，AI 暂停回复
- closed：当前轮服务结束

2. assignedTenantUserId
- 当前接管该会话的座席账号 ID
- 用于“我的会话”和权限判断

3. assignedAt / handoverRequestedAt / handoverStartedAt / handoverEndedAt
- 记录人工介入全过程时间点
- 方便后续统计转人工率、接管时长、服务时长

4. lastCustomerMessageAt / lastAgentMessageAt
- 可用于后续列表排序、超时提醒、未回复检测

5. unreadForAgent / unreadForCustomer
- 分别服务于座席工作台红点和客户端新消息提示

6. customerDisplayName / customerContact
- 客户留资后回填到 session 上
- 便于左侧列表直观识别客户

7. latestMessagePreview
- 左侧列表直接展示最后一句摘要，避免前端每次遍历 messages

8. sessionPublicToken
- 客户端轮询会话详情时的公开令牌
- 避免只凭 sessionId 就能拉取聊天数据

---

## 2. ChatMessageRecord 字段扩展

当前已存在核心字段：
- id
- sessionId
- tenantId
- role
- content
- createdAt
- attachments?
- citations?
- answerSource?
- credentialSource?
- retrievalConfidence?

建议扩展后：

```ts
interface ChatMessageRecord {
  id: string
  sessionId: string
  tenantId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number

  attachments?: MessageAttachment[]
  citations?: CitationRecord[]
  answerSource?: string
  credentialSource?: string
  retrievalConfidence?: string

  senderType?: 'customer' | 'ai' | 'agent' | 'system'
  senderTenantUserId?: string
  senderName?: string
  deliveryStatus?: 'sent' | 'delivered' | 'read'
  internalOnly?: boolean
}
```

### 字段说明

1. senderType
- customer：客户消息
- ai：AI 回复
- agent：人工座席回复
- system：系统事件消息，如“客户请求人工”“张三已接管会话”

2. senderTenantUserId
- 当 senderType='agent' 时记录具体座席

3. senderName
- 用于消息区直接展示“人工客服 张三”
- 减少前端额外查用户表

4. deliveryStatus
- MVP 可先写 sent
- 二期可扩展 delivered/read

5. internalOnly
- 预留给后续“内部备注”功能
- MVP 先不启用，但字段设计上可兼容后续演进

### 兼容策略

消息 role 暂不推翻：
- customer -> role='user'
- ai -> role='assistant'
- agent -> role='assistant'
- system -> role='assistant'

这样能兼容现有消息渲染与历史逻辑，只新增 senderType 做精细区分。

---

## 3. TenantUserRecord 字段扩展

建议扩展：

```ts
interface TenantUserRecord {
  id: string
  tenantId: string
  email: string
  passwordHash: string
  temporaryPassword?: string
  mustChangePassword: boolean
  status: 'active' | 'disabled'
  createdAt: number
  updatedAt: number

  displayName: string
  seatRole: 'owner' | 'supervisor' | 'agent'
  maxConcurrentChats?: number
  autoAssignable?: boolean
  lastOnlineAt?: number
}
```

### 字段说明

1. displayName
- 座席显示名
- 不能只用 email，否则聊天工作台体验会很差

2. seatRole
- owner：租户主账号，最高权限
- supervisor：主管，可看全部、可转派
- agent：普通座席

3. maxConcurrentChats
- 后续自动分配时可作为并发上限
- MVP 先保留字段

4. autoAssignable
- 后续自动分配开关
- MVP 先默认 true

5. lastOnlineAt
- 可用于后续在线状态展示

---

## 4. API 契约字段扩展

### 4.1 ChatRequest

```ts
interface ChatRequest {
  tenantId: string
  message: string
  sessionId?: string
  sessionToken?: string
  visitorId?: string
  attachments?: MessageAttachment[]
}
```

### 4.2 ChatResponse

```ts
interface ChatResponse {
  reply: string
  sessionId: string
  sessionToken?: string
  conversationMode: 'ai' | 'human_waiting' | 'human_active'
  assignedAgentName?: string
  answerSource?: string
  credentialSource?: string
  retrievalConfidence?: string
  citations?: CitationRecord[]
  polledAt?: number
}
```

---

## 5. 默认值建议

### 新建 session 时
- status = 'ai_active'
- unreadForAgent = 1
- unreadForCustomer = 0
- latestMessagePreview = 用户首条消息摘要
- sessionPublicToken = 随机 token

### AI 消息写入时
- senderType = 'ai'

### 用户消息写入时
- senderType = 'customer'

### 人工消息写入时
- role = 'assistant'
- senderType = 'agent'
- senderTenantUserId = 当前座席 ID
- senderName = 当前座席 displayName

### 系统事件消息写入时
- role = 'assistant'
- senderType = 'system'

### 新建 tenant user 时
- displayName = tenant.name 或 email 前缀
- seatRole = 'owner'
- maxConcurrentChats = 20
- autoAssignable = true

---

## 6. 兼容旧数据策略

旧会话没有新增字段时，读取层做 fallback：
- status -> 'ai_active'
- unreadForAgent -> 0
- unreadForCustomer -> 0
- latestMessagePreview -> ''

旧用户没有新增字段时：
- displayName -> email
- seatRole -> 'owner'

旧消息没有 senderType 时：
- role='user' -> 推断为 customer
- role='assistant' -> 推断为 ai

---

## 7. 本文件对应代码落点

优先修改：
- `types/index.ts`
- `packages/contracts/src/agent/chat.contract.ts`
- `packages/contracts/src/tenant/tenant-user.contract.ts`
- `server/lib/chat.ts`
- `server/lib/tenant-users.ts`
- `server/lib/storage/file-store.ts`
- `server/lib/storage/memory-store.ts`

---

## 8. MVP 必须字段与可延期字段

### MVP 必须
- ChatSessionRecord.status
- ChatSessionRecord.assignedTenantUserId
- ChatSessionRecord.unreadForAgent
- ChatSessionRecord.unreadForCustomer
- ChatSessionRecord.latestMessagePreview
- ChatSessionRecord.sessionPublicToken
- ChatMessageRecord.senderType
- ChatMessageRecord.senderTenantUserId
- ChatMessageRecord.senderName
- TenantUserRecord.displayName
- TenantUserRecord.seatRole

### 可延期到第二期
- maxConcurrentChats
- autoAssignable
- lastOnlineAt
- deliveryStatus
- internalOnly
- customerContact 精细结构化字段

---

## 9. 推荐实施顺序

1. 先扩类型与默认值
2. 再扩 `/api/chat` 与聊天路由状态流
3. 再补人工接管接口
4. 最后改 UI 与座席工作台
