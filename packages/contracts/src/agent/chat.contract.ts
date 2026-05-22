import type { CitationRecord, CredentialSource, MessageAttachment, RetrievalConfidence, AnswerSource } from '../../../../types'

export type ConversationModeContract = 'ai_active' | 'handover_requested' | 'human_active'
export type ChatSenderTypeContract = 'customer' | 'ai' | 'agent' | 'system'

export interface ChatRequest {
  tenantId: string
  message: string
  sessionId?: string
  attachments?: MessageAttachment[]
}

export interface ChatResponse {
  reply: string
  sessionId: string
  conversationMode: ConversationModeContract
  answerSource: AnswerSource
  credentialSource: CredentialSource
  citations: CitationRecord[]
  retrievalConfidence: RetrievalConfidence
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export interface TenantChatWorkbenchListItem {
  sessionId: string
  visitorId: string
  conversationMode: ConversationModeContract
  assignedTenantUserId?: string
  assignedTenantUserName?: string
  startedAt: number
  lastMessageAt: number
  messageCount: number
  lastMessagePreview: string
  lastSenderType?: ChatSenderTypeContract
  hasUnreadCustomerMessage: boolean
}

export interface TenantChatWorkbenchListResponse {
  items: TenantChatWorkbenchListItem[]
}

export interface TenantChatWorkbenchAvailableActions {
  canTakeover: boolean
  canReply: boolean
  canRelease: boolean
}

export interface TenantChatWorkbenchSession {
  id: string
  tenantId: string
  visitorId: string
  startedAt: number
  lastMessageAt: number
  conversationMode: ConversationModeContract
  assignedTenantUserId?: string
  assignedTenantUserName?: string
  handoverRequestedAt?: number
  handoverReason?: string
  humanActivatedAt?: number
  humanReleasedAt?: number
}

export interface TenantChatWorkbenchMessage {
  id: string
  sessionId: string
  tenantId: string
  role: 'system' | 'user' | 'assistant'
  senderType: ChatSenderTypeContract
  senderTenantUserId?: string
  senderName?: string
  content: string
  createdAt: number
  attachments?: MessageAttachment[]
}

export interface TenantChatWorkbenchDetailResponse {
  session: TenantChatWorkbenchSession
  messages: TenantChatWorkbenchMessage[]
  availableActions: TenantChatWorkbenchAvailableActions
}

export interface TenantChatWorkbenchReplyRequest {
  content: string
}

export interface TenantChatTakeoverResponse {
  session: TenantChatWorkbenchSession
  availableActions: TenantChatWorkbenchAvailableActions
}

export interface TenantChatReplyResponse {
  session: TenantChatWorkbenchSession
  message: TenantChatWorkbenchMessage
  availableActions: TenantChatWorkbenchAvailableActions
}

export interface TenantChatReleaseResponse {
  session: TenantChatWorkbenchSession
  availableActions: TenantChatWorkbenchAvailableActions
}
