import type {
  ChatMessageRecord,
  ChatSessionRecord,
  DataSourceRecord,
  DocumentChunkRecord,
  IngestionJobRecord,
  LeadRecord,
  LlmUsageRecord,
  SourceDocumentRecord,
  TenantPasswordResetRecord,
  TenantRecord,
  TenantUserRecord
} from '../../../types'

export type ConversationMode = NonNullable<ChatSessionRecord['conversationMode']>
export type ChatMessageSenderType = NonNullable<ChatMessageRecord['senderType']>
export type TenantSeatRole = NonNullable<TenantUserRecord['seatRole']>

export interface TenantStorage {
  saveTenant(tenant: TenantRecord): Promise<void>
  getTenantById(tenantId: string): Promise<TenantRecord | undefined>
  getTenantByEmbedKey(embedKey: string): Promise<TenantRecord | undefined>
  listTenants(): Promise<TenantRecord[]>
}

export interface SessionStorage {
  saveSession(session: ChatSessionRecord): Promise<void>
  getSessionById(sessionId: string): Promise<ChatSessionRecord | undefined>
  listSessionsByTenant(tenantId: string): Promise<ChatSessionRecord[]>
}

export interface MessageStorage {
  saveMessage(message: ChatMessageRecord): Promise<void>
  listMessagesBySession(sessionId: string): Promise<ChatMessageRecord[]>
}

export interface LeadStorage {
  saveLead(lead: LeadRecord): Promise<void>
  listLeadsByTenant(tenantId: string): Promise<LeadRecord[]>
}

export interface UsageStorage {
  saveUsageRecord(record: LlmUsageRecord): Promise<void>
  listUsageByTenant(tenantId: string): Promise<LlmUsageRecord[]>
}

export interface TenantUserStorage {
  saveTenantUser(user: TenantUserRecord): Promise<void>
  getTenantUserByEmail(email: string): Promise<TenantUserRecord | undefined>
  getTenantUserById(userId: string): Promise<TenantUserRecord | undefined>
  listTenantUsersByTenant(tenantId: string): Promise<TenantUserRecord[]>
}

export interface TenantPasswordResetStorage {
  saveTenantPasswordReset(record: TenantPasswordResetRecord): Promise<void>
  getTenantPasswordResetByCode(email: string, code: string): Promise<TenantPasswordResetRecord | undefined>
}

export interface DataSourceStorage {
  saveDataSource(record: DataSourceRecord): Promise<void>
  getDataSourceById(dataSourceId: string): Promise<DataSourceRecord | undefined>
  listDataSourcesByTenant(tenantId: string): Promise<DataSourceRecord[]>
}

export interface IngestionJobStorage {
  saveIngestionJob(record: IngestionJobRecord): Promise<void>
  getIngestionJobById(jobId: string): Promise<IngestionJobRecord | undefined>
  listIngestionJobsByTenant(tenantId: string): Promise<IngestionJobRecord[]>
}

export interface SourceDocumentStorage {
  saveSourceDocument(record: SourceDocumentRecord): Promise<void>
  getSourceDocumentById(documentId: string): Promise<SourceDocumentRecord | undefined>
  listSourceDocumentsByTenant(tenantId: string): Promise<SourceDocumentRecord[]>
}

export interface DocumentChunkStorage {
  replaceDocumentChunks(documentId: string, chunks: DocumentChunkRecord[]): Promise<void>
  listDocumentChunksByDocument(documentId: string): Promise<DocumentChunkRecord[]>
}

export interface StorageRepository
  extends TenantStorage,
    SessionStorage,
    MessageStorage,
    LeadStorage,
    UsageStorage,
    TenantUserStorage,
    TenantPasswordResetStorage {}

export interface RagStorageRepository
  extends DataSourceStorage,
    IngestionJobStorage,
    SourceDocumentStorage,
    DocumentChunkStorage {}
