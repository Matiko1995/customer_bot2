# customer_bot2 人工接管 + 座席制 API JSON 契约文档

## 文档目标
给前后端统一的接口请求/响应结构，优先覆盖 MVP 必须接口。

---

## 1. 客户侧接口

### 1.1 POST /api/chat

用途：
- 客户发送消息
- 根据会话状态决定继续走 AI，还是进入人工等待模式

#### Request

```json
{
  "tenantId": "tenant-1",
  "sessionId": "session-1",
  "sessionToken": "session-token-1",
  "visitorId": "visitor-1",
  "message": "请介绍一下产品",
  "attachments": []
}
```

#### Response: AI 正常回复

```json
{
  "reply": "您好，这里是 AI 客服，可以先为您介绍基础信息。",
  "sessionId": "session-1",
  "sessionToken": "session-token-1",
  "conversationMode": "ai",
  "assignedAgentName": "",
  "answerSource": "general_fallback",
  "credentialSource": "platform_shared",
  "retrievalConfidence": "low",
  "citations": [],
  "usage": {
    "inputTokens": 12,
    "outputTokens": 8,
    "totalTokens": 20
  }
}
```

#### Response: 已请求人工，等待中

```json
{
  "reply": "已为你转接人工客服，请稍候。",
  "sessionId": "session-1",
  "sessionToken": "session-token-1",
  "conversationMode": "human_waiting",
  "assignedAgentName": "",
  "answerSource": "general_fallback",
  "credentialSource": "platform_shared",
  "retrievalConfidence": "low",
  "citations": [],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0
  }
}
```

#### Response: 已有座席接管

```json
{
  "reply": "人工客服已接管，请稍候。",
  "sessionId": "session-1",
  "sessionToken": "session-token-1",
  "conversationMode": "human_active",
  "assignedAgentName": "张三",
  "answerSource": "general_fallback",
  "credentialSource": "platform_shared",
  "retrievalConfidence": "low",
  "citations": [],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0
  }
}
```

---

### 1.2 POST /api/chat/handover

用途：
- 客户主动申请转人工

#### Request

```json
{
  "tenantId": "tenant-1",
  "sessionId": "session-1",
  "sessionToken": "session-token-1"
}
```

#### Response

```json
{
  "ok": true,
  "status": "handover_requested"
}
```

#### Error

```json
{
  "statusCode": 401,
  "statusMessage": "Invalid session token"
}
```

---

### 1.3 GET /api/chat/session

用途：
- 客户轮询查看当前会话状态和人工回复

#### Query

```text
/api/chat/session?tenantId=tenant-1&sessionId=session-1&sessionToken=session-token-1
```

#### Response

```json
{
  "session": {
    "id": "session-1",
    "status": "human_active",
    "assignedTenantUserId": "user-1",
    "assignedAgentName": "张三",
    "unreadForCustomer": 1,
    "lastMessageAt": 1760000000000
  },
  "messages": [
    {
      "id": "message-1",
      "role": "user",
      "senderType": "customer",
      "content": "我想问下价格",
      "createdAt": 1760000000000
    },
    {
      "id": "message-2",
      "role": "assistant",
      "senderType": "agent",
      "senderTenantUserId": "user-1",
      "senderName": "张三",
      "content": "您好，我来为您处理。",
      "createdAt": 1760000005000
    }
  ],
  "polledAt": 1760000008000
}
```

---

## 2. 座席侧接口

### 2.1 GET /api/tenant/chats

用途：
- 左侧会话摘要列表

#### Query 示例

```text
/api/tenant/chats?status=handover_requested&assignedTo=all&keyword=报价
```

#### Response

```json
{
  "items": [
    {
      "sessionId": "session-1",
      "status": "handover_requested",
      "visitorId": "visitor-1",
      "customerDisplayName": "王先生",
      "customerContact": "138****0000",
      "latestMessagePreview": "想问下最小起订量",
      "lastMessageAt": 1760000000000,
      "startedAt": 1759999900000,
      "unreadForAgent": 2,
      "messageCount": 8,
      "assignedAgent": null
    }
  ]
}
```

---

### 2.2 GET /api/tenant/chats/:sessionId

用途：
- 右侧会话详情

#### Response

```json
{
  "session": {
    "id": "session-1",
    "tenantId": "tenant-1",
    "visitorId": "visitor-1",
    "status": "human_active",
    "assignedTenantUserId": "user-1",
    "startedAt": 1759999900000,
    "lastMessageAt": 1760000005000,
    "customerDisplayName": "王先生",
    "customerContact": "138****0000",
    "latestMessagePreview": "您好，我来为您处理。"
  },
  "assignedAgent": {
    "id": "user-1",
    "displayName": "张三",
    "seatRole": "agent"
  },
  "customer": {
    "displayName": "王先生",
    "contact": "138****0000",
    "visitorId": "visitor-1"
  },
  "messages": [
    {
      "id": "message-1",
      "role": "user",
      "senderType": "customer",
      "content": "你好",
      "createdAt": 1760000000000
    },
    {
      "id": "message-2",
      "role": "assistant",
      "senderType": "ai",
      "content": "您好，请问有什么可以帮您？",
      "createdAt": 1760000001000
    },
    {
      "id": "message-3",
      "role": "assistant",
      "senderType": "system",
      "content": "客户请求人工服务",
      "createdAt": 1760000002000
    },
    {
      "id": "message-4",
      "role": "assistant",
      "senderType": "agent",
      "senderTenantUserId": "user-1",
      "senderName": "张三",
      "content": "您好，我来继续为您服务。",
      "createdAt": 1760000005000
    }
  ]
}
```

---

### 2.3 POST /api/tenant/chats/:sessionId/takeover

用途：
- 当前座席接管会话

#### Request

```json
{}
```

#### Response

```json
{
  "ok": true,
  "session": {
    "id": "session-1",
    "status": "human_active",
    "assignedTenantUserId": "user-1",
    "assignedAt": 1760000003000,
    "handoverStartedAt": 1760000003000
  }
}
```

---

### 2.4 POST /api/tenant/chats/:sessionId/reply

用途：
- 人工客服发送消息

#### Request

```json
{
  "content": "您好，我来帮您确认报价和交期。"
}
```

#### Response

```json
{
  "ok": true,
  "message": {
    "id": "message-5",
    "role": "assistant",
    "senderType": "agent",
    "senderTenantUserId": "user-1",
    "senderName": "张三",
    "content": "您好，我来帮您确认报价和交期。",
    "createdAt": 1760000007000
  },
  "session": {
    "id": "session-1",
    "status": "human_active",
    "lastMessageAt": 1760000007000,
    "latestMessagePreview": "您好，我来帮您确认报价和交期。",
    "unreadForCustomer": 1
  }
}
```

---

### 2.5 POST /api/tenant/chats/:sessionId/release

用途：
- 结束人工服务，恢复 AI

#### Request

```json
{}
```

#### Response

```json
{
  "ok": true,
  "session": {
    "id": "session-1",
    "status": "ai_active",
    "handoverEndedAt": 1760000010000
  }
}
```

---

## 3. 管理端接口

### 3.1 GET /api/admin/tenants/:tenantId/users

用途：
- 获取该租户所有座席账号

#### Response

```json
{
  "items": [
    {
      "id": "user-1",
      "tenantId": "tenant-1",
      "email": "agent1@example.com",
      "displayName": "张三",
      "seatRole": "agent",
      "status": "active",
      "mustChangePassword": false,
      "lastOnlineAt": 1760000000000
    }
  ]
}
```

---

### 3.2 POST /api/admin/tenants/:tenantId/users

用途：
- 创建新座席账号

#### Request

```json
{
  "email": "agent2@example.com",
  "displayName": "李四",
  "seatRole": "agent"
}
```

#### Response

```json
{
  "ok": true,
  "user": {
    "id": "user-2",
    "tenantId": "tenant-1",
    "email": "agent2@example.com",
    "displayName": "李四",
    "seatRole": "agent",
    "status": "active",
    "mustChangePassword": true
  },
  "temporaryPassword": "Abc12345"
}
```

---

## 4. 错误响应约定

建议沿用 Nuxt `createError` 风格：

```json
{
  "statusCode": 400,
  "statusMessage": "tenantId is required"
}
```

常见错误：
- 400：缺少参数、内容为空
- 401：未登录、session token 不合法
- 403：无权接管/回复/释放该会话
- 404：会话不存在
- 409：状态不允许当前操作

### 示例：未接管前直接回复

```json
{
  "statusCode": 409,
  "statusMessage": "Session is not in human_active state"
}
```

---

## 5. 前端调用约定

### 客户侧 widget
- 发消息：`POST /api/chat`
- 转人工：`POST /api/chat/handover`
- 轮询：`GET /api/chat/session`

### 租户工作台
- 左列表：`GET /api/tenant/chats`
- 右详情：`GET /api/tenant/chats/:sessionId`
- 接管：`POST /api/tenant/chats/:sessionId/takeover`
- 回复：`POST /api/tenant/chats/:sessionId/reply`
- 恢复 AI：`POST /api/tenant/chats/:sessionId/release`

### 管理端
- 座席列表：`GET /api/admin/tenants/:tenantId/users`
- 创建座席：`POST /api/admin/tenants/:tenantId/users`

---

## 6. 推荐版本策略

MVP 先按本文件字段固定下来，再进入开发。
如后续新增：
- 转派 assign
- mark-read
- internal note
- incremental since polling

建议以新增字段和新增接口方式扩展，不破坏本版基础契约。
