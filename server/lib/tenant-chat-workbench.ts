import type { StorageRepository } from './storage/types'
import type { ChatMessageRecord, ChatSessionRecord, TenantUserRecord } from '../../types'

export interface TenantChatListFilters {
  conversationMode?: 'ai_active' | 'handover_requested' | 'human_active'
  assignedTenantUserId?: string
  sort?: 'lastMessageAt:asc' | 'lastMessageAt:desc'
}

export interface TenantChatSummary {
  sessionId: string
  visitorId: string
  conversationMode: 'ai_active' | 'handover_requested' | 'human_active'
  assignedTenantUserId?: string
  assignedTenantUserName?: string
  startedAt: number
  lastMessageAt: number
  messageCount: number
  lastMessagePreview: string
  lastSenderType?: 'customer' | 'ai' | 'agent' | 'system'
  hasUnreadCustomerMessage: boolean
}

export interface TenantChatAvailableActions {
  canTakeover: boolean
  canReply: boolean
  canRelease: boolean
}

export interface TenantChatDetail {
  session: ChatSessionRecord & { conversationMode: 'ai_active' | 'handover_requested' | 'human_active' }
  messages: Array<ChatMessageRecord & { senderType: 'customer' | 'ai' | 'agent' | 'system' }>
  availableActions: TenantChatAvailableActions
}

export class TenantChatSessionNotFoundError extends Error {
  constructor() {
    super('Chat session not found')
    this.name = 'TenantChatSessionNotFoundError'
  }
}

export class TenantChatConflictError extends Error {
  constructor(message = 'Chat already assigned to another tenant user') {
    super(message)
    this.name = 'TenantChatConflictError'
  }
}

export class TenantChatForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'TenantChatForbiddenError'
  }
}

export class TenantChatValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TenantChatValidationError'
  }
}

function resolveConversationMode(session: ChatSessionRecord): 'ai_active' | 'handover_requested' | 'human_active' {
  return session.conversationMode ?? 'ai_active'
}

function resolveSenderType(message: ChatMessageRecord): 'customer' | 'ai' | 'agent' | 'system' {
  if (message.senderType) {
    return message.senderType
  }

  if (message.role === 'user') {
    return 'customer'
  }

  return 'ai'
}

function sortMessages(messages: ChatMessageRecord[]): ChatMessageRecord[] {
  return [...messages].sort((left, right) => left.createdAt - right.createdAt)
}

function toSummary(session: ChatSessionRecord, messages: ChatMessageRecord[]): TenantChatSummary {
  const ordered = sortMessages(messages)
  const lastMessage = ordered[ordered.length - 1]
  const lastSenderType = lastMessage ? resolveSenderType(lastMessage) : undefined

  return {
    sessionId: session.id,
    visitorId: session.visitorId,
    conversationMode: resolveConversationMode(session),
    assignedTenantUserId: session.assignedTenantUserId,
    assignedTenantUserName: session.assignedTenantUserName,
    startedAt: session.startedAt,
    lastMessageAt: session.lastMessageAt,
    messageCount: ordered.length,
    lastMessagePreview: lastMessage?.content ?? '',
    lastSenderType,
    hasUnreadCustomerMessage: lastSenderType === 'customer'
  }
}

export function getAvailableActions(
  session: ChatSessionRecord,
  tenantUserId: string
): TenantChatAvailableActions {
  const mode = resolveConversationMode(session)
  const assignedToCurrentUser = session.assignedTenantUserId === tenantUserId

  return {
    canTakeover: mode !== 'human_active',
    canReply: mode === 'human_active' && assignedToCurrentUser,
    canRelease: mode === 'human_active' && assignedToCurrentUser
  }
}

async function getTenantSessionOrThrow(storage: StorageRepository, tenantId: string, sessionId: string): Promise<ChatSessionRecord> {
  const session = await storage.getSessionById(sessionId)
  if (!session || session.tenantId !== tenantId) {
    throw new TenantChatSessionNotFoundError()
  }

  return session
}

async function getTenantUserOrThrow(storage: StorageRepository, tenantUserId: string, tenantId: string): Promise<TenantUserRecord> {
  const user = await storage.getTenantUserById(tenantUserId)
  if (!user || user.status !== 'active' || user.tenantId !== tenantId) {
    throw new TenantChatForbiddenError('Unauthorized')
  }

  return user
}

export async function listTenantChatSummaries(
  storage: StorageRepository,
  tenantId: string,
  filters: TenantChatListFilters = {}
): Promise<TenantChatSummary[]> {
  const sessions = await storage.listSessionsByTenant(tenantId)
  const items = await Promise.all(
    sessions.map(async (session) => toSummary(session, await storage.listMessagesBySession(session.id)))
  )

  const filtered = items.filter((item) => {
    if (filters.conversationMode && item.conversationMode !== filters.conversationMode) {
      return false
    }

    if (filters.assignedTenantUserId && item.assignedTenantUserId !== filters.assignedTenantUserId) {
      return false
    }

    return true
  })

  const direction = filters.sort === 'lastMessageAt:asc' ? 1 : -1
  return filtered.sort((left, right) => (left.lastMessageAt - right.lastMessageAt) * direction)
}

export async function getTenantChatDetail(
  storage: StorageRepository,
  tenantId: string,
  tenantUserId: string,
  sessionId: string
): Promise<TenantChatDetail> {
  const session = await getTenantSessionOrThrow(storage, tenantId, sessionId)
  const messages = sortMessages(await storage.listMessagesBySession(sessionId)).map((message) => ({
    ...message,
    senderType: resolveSenderType(message)
  }))

  return {
    session: {
      ...session,
      conversationMode: resolveConversationMode(session)
    },
    messages,
    availableActions: getAvailableActions(session, tenantUserId)
  }
}

export async function takeoverTenantChat(
  storage: StorageRepository,
  tenantId: string,
  tenantUserId: string,
  sessionId: string,
  now = Date.now()
) {
  const user = await getTenantUserOrThrow(storage, tenantUserId, tenantId)
  const session = await getTenantSessionOrThrow(storage, tenantId, sessionId)
  const mode = resolveConversationMode(session)

  if (mode === 'human_active' && session.assignedTenantUserId && session.assignedTenantUserId !== tenantUserId) {
    throw new TenantChatConflictError()
  }

  const updatedSession: ChatSessionRecord = {
    ...session,
    conversationMode: 'human_active',
    assignedTenantUserId: user.id,
    assignedTenantUserName: user.displayName || user.email,
    humanActivatedAt: now
  }

  await storage.saveSession(updatedSession)

  return {
    session: {
      ...updatedSession,
      conversationMode: 'human_active' as const
    },
    availableActions: getAvailableActions(updatedSession, tenantUserId)
  }
}

export async function replyToTenantChat(
  storage: StorageRepository,
  tenantId: string,
  tenantUserId: string,
  sessionId: string,
  content: string,
  now = Date.now()
) {
  const user = await getTenantUserOrThrow(storage, tenantUserId, tenantId)
  const session = await getTenantSessionOrThrow(storage, tenantId, sessionId)
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new TenantChatValidationError('content is required')
  }

  if (resolveConversationMode(session) !== 'human_active') {
    throw new TenantChatForbiddenError('Chat is not in human takeover mode')
  }

  if (session.assignedTenantUserId !== tenantUserId) {
    throw new TenantChatForbiddenError('Only the assigned tenant user can reply')
  }

  const message: ChatMessageRecord = {
    id: `message-${now}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId: session.id,
    tenantId,
    role: 'assistant',
    senderType: 'agent',
    senderTenantUserId: user.id,
    senderName: user.displayName || user.email,
    content: trimmedContent,
    createdAt: now
  }

  const updatedSession: ChatSessionRecord = {
    ...session,
    lastMessageAt: now
  }

  await storage.saveMessage(message)
  await storage.saveSession(updatedSession)

  return {
    session: {
      ...updatedSession,
      conversationMode: resolveConversationMode(updatedSession)
    },
    message,
    availableActions: getAvailableActions(updatedSession, tenantUserId)
  }
}

export async function releaseTenantChat(
  storage: StorageRepository,
  tenantId: string,
  tenantUserId: string,
  sessionId: string,
  now = Date.now()
) {
  await getTenantUserOrThrow(storage, tenantUserId, tenantId)
  const session = await getTenantSessionOrThrow(storage, tenantId, sessionId)

  if (resolveConversationMode(session) !== 'human_active') {
    throw new TenantChatForbiddenError('Chat is not in human takeover mode')
  }

  if (session.assignedTenantUserId !== tenantUserId) {
    throw new TenantChatForbiddenError('Only the assigned tenant user can release')
  }

  const updatedSession: ChatSessionRecord = {
    ...session,
    conversationMode: 'ai_active',
    humanReleasedAt: now
  }

  await storage.saveSession(updatedSession)

  return {
    session: {
      ...updatedSession,
      conversationMode: 'ai_active' as const
    },
    availableActions: getAvailableActions(updatedSession, tenantUserId)
  }
}
