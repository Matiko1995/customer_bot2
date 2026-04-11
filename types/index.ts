import type { TenantRagSettings } from '../packages/shared-config/src/rag-settings.ts'

export interface SiteConfig {
  brandName: string
  heroTitle: string
  about: string
  phone: string
  email: string
  address: string
}

export interface ArticleListItem {
  id: string
  title: string
  summary: string
  category: string
}

export interface ProductListItem {
  id: string
  name: string
  category: string
  summary: string
  priceText: string
  parameters?: ProductParameter[]
}

export interface ProductParameter {
  label: string
  value: string
}

export interface ConsultingServiceListItem {
  id: string
  name: string
  category: string
  introduction: string
  price: string
  negotiable: boolean
}

export interface AssistantKnowledgeEntry {
  id: string
  title: string
  keywords: string[]
  oneLiner: string
  whatIs: string
  problems: string[]
  workflow: string[]
  scenarios: string[]
  outcomes: string[]
  source: string
}

export type AssistantModuleId = 'md' | 'price' | 'contact'

export type ConversationRole = 'user' | 'assistant'

export interface MessageAttachment {
  id: string
  name: string
  mimeType: string
  size: number
  dataUrl: string
}

export interface ConversationMessage {
  id: string
  role: ConversationRole | 'system'
  content: string
  createdAt: number
  attachments?: MessageAttachment[]
  citations?: CitationRecord[]
  answerSource?: AnswerSource
  credentialSource?: CredentialSource
  retrievalConfidence?: RetrievalConfidence
}

export interface TenantRecord {
  id: string
  name: string
  status: 'active' | 'disabled'
  brandName: string
  themeColor: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  systemPrompt: string
  llmEndpoint?: string
  llmApiKey?: string
  llmModel?: string
  reuseAnsweredQuestions?: boolean
  deletedAt?: number
  embedKey: string
  ragSettings?: TenantRagSettings
  billingSubscription?: TenantBillingSubscription
  contentConfig?: TenantContentConfig
  createdAt: number
  updatedAt: number
}

export interface TenantBillingSubscription {
  planId: string
  startedAt: number
  notes: string
}

export interface TenantContentConfig {
  knowledgeEntries: AssistantKnowledgeEntry[]
  articles: ArticleListItem[]
  products: ProductListItem[]
  consultingServices: ConsultingServiceListItem[]
  contentSources: TenantContentSource[]
}

export type TenantContentSourceType = 'webpage' | 'email' | 'document' | 'excel'

export interface TenantContentSource {
  id: string
  type: TenantContentSourceType
  enabled?: boolean
  category?: string
  title: string
  sourceUrl?: string
  sourceLabel?: string
  summary: string
  content: string
  tags: string[]
  faqQuestions?: string[]
  answerHints?: string[]
  updatedAt?: number
}

export type DataSourceType = 'webpage' | 'file' | 'imap'

export type DataSourceStatus = 'active' | 'disabled'

export type DataSourceSyncMode = 'manual' | 'scheduled'

export interface DataSourceRecord {
  id: string
  tenantId: string
  type: DataSourceType
  status: DataSourceStatus
  syncMode: DataSourceSyncMode
  scheduleCron?: string
  config: Record<string, unknown>
  lastSyncedAt?: number
  createdAt: number
  updatedAt: number
}

export type IngestionTriggerMode = 'manual' | 'scheduled' | 'retry'

export type IngestionJobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface IngestionJobRecord {
  id: string
  tenantId: string
  dataSourceId: string
  triggerMode: IngestionTriggerMode
  status: IngestionJobStatus
  startedAt?: number
  finishedAt?: number
  errorMessage?: string
  stats: Record<string, unknown>
}

export interface SourceDocumentRecord {
  id: string
  tenantId: string
  dataSourceId: string
  externalId?: string
  title: string
  mimeType: string
  sourceUri: string
  contentText: string
  metadata: Record<string, unknown>
  contentHash: string
  versionHash: string
  createdAt: number
  updatedAt: number
}

export interface DocumentChunkRecord {
  id: string
  tenantId: string
  documentId: string
  chunkIndex: number
  content: string
  tokenCount: number
  metadata: Record<string, unknown>
  embedding?: number[]
  createdAt: number
}

export interface CitationRecord {
  documentId: string
  chunkId: string
  title: string
  snippet: string
  score: number
  sourceUri?: string
  metadata?: Record<string, unknown>
}

export type AnswerSource = 'structured' | 'rag' | 'general_fallback'

export type CredentialSource = 'tenant' | 'platform_shared'

export type RetrievalConfidence = 'high' | 'low' | 'miss'

export interface AdminUserRecord {
  id: string
  email: string
  passwordHash: string
  status: 'active' | 'disabled'
  createdAt: number
}

export interface TenantUserRecord {
  id: string
  tenantId: string
  email: string
  passwordHash: string
  temporaryPassword?: string
  mustChangePassword: boolean
  status: 'active' | 'disabled'
  createdAt: number
  updatedAt: number
}

export interface TenantPasswordResetRecord {
  id: string
  tenantUserId: string
  tenantId: string
  email: string
  code: string
  expiresAt: number
  usedAt?: number
  createdAt: number
}

export interface ChatSessionRecord {
  id: string
  tenantId: string
  visitorId: string
  startedAt: number
  lastMessageAt: number
}

export interface ChatMessageRecord {
  id: string
  sessionId: string
  tenantId: string
  role: ConversationRole
  content: string
  createdAt: number
  attachments?: MessageAttachment[]
  matchedContentSources?: MatchedContentSource[]
  citations?: CitationRecord[]
  answerSource?: AnswerSource
  credentialSource?: CredentialSource
  retrievalConfidence?: RetrievalConfidence
}

export interface MatchedContentSource {
  id: string
  title: string
  type: TenantContentSourceType
  category?: string
  snippet?: string
  answerHints?: string[]
}

export interface LeadRecord {
  id: string
  tenantId: string
  sessionId: string
  name: string
  company: string
  contact: string
  demandType: string
  message: string
  createdAt: number
}

export interface LlmUsageRecord {
  id: string
  tenantId: string
  sessionId: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  amount: string
  status: 'success' | 'failed' | 'unknown'
  credentialSource?: CredentialSource
  answerSource?: AnswerSource
  createdAt: number
}

export interface BillingSummary {
  tenantId: string
  month: `${number}-${number}`
  inputTokens: number
  outputTokens: number
  totalTokens: number
  includedTokens: number
  billableTokens: number
  baseFee: string
  overageFee: string
  amount: string
}

export interface BillingPlan {
  id: string
  name: string
  monthlyFee: string
  includedTokens: number
  overagePricePerThousandTokens: string
  active: boolean
}

export interface RuntimeWidgetConfig {
  tenantId: string
  status: 'active' | 'disabled'
  brandName: string
  themeColor: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  systemPrompt: string
}
