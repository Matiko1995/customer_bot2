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
