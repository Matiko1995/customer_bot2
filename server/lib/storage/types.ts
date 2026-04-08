import type {
  ChatMessageRecord,
  ChatSessionRecord,
  LeadRecord,
  LlmUsageRecord,
  TenantPasswordResetRecord,
  TenantRecord,
  TenantUserRecord
} from '../../../types'

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

export interface StorageRepository
  extends TenantStorage,
    SessionStorage,
    MessageStorage,
    LeadStorage,
    UsageStorage,
    TenantUserStorage,
    TenantPasswordResetStorage {}
