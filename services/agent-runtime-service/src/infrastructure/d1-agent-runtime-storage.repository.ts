import type {
  ChatMessageRecord,
  ChatSessionRecord,
  LeadRecord,
  LlmUsageRecord,
  TenantPasswordResetRecord,
  TenantRecord,
  TenantUserRecord
} from '../../../../types'
import type { D1Database } from '../../../../server/lib/cloudflare/bindings.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { D1TenantIdentityStorageRepository } from '../../../tenant-identity-service/src/infrastructure/d1-tenant-identity-storage.repository.ts'

type SessionRow = {
  id: string
  tenant_id: string
  visitor_id: string
  started_at: number
  last_message_at: number
}

type MessageRow = {
  id: string
  session_id: string
  tenant_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: number
  attachments_json: string | null
  matched_content_sources_json: string | null
  citations_json: string | null
  answer_source: ChatMessageRecord['answerSource'] | null
  credential_source: ChatMessageRecord['credentialSource'] | null
  retrieval_confidence: ChatMessageRecord['retrievalConfidence'] | null
}

type LeadRow = {
  id: string
  tenant_id: string
  session_id: string
  name: string
  company: string
  contact: string
  demand_type: string
  message: string
  created_at: number
}

type UsageRow = {
  id: string
  tenant_id: string
  session_id: string
  provider: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  amount: string
  status: LlmUsageRecord['status']
  credential_source: LlmUsageRecord['credentialSource'] | null
  answer_source: LlmUsageRecord['answerSource'] | null
  created_at: number
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined
  }

  return JSON.parse(value) as T
}

function mapSession(row: SessionRow): ChatSessionRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    visitorId: row.visitor_id,
    startedAt: row.started_at,
    lastMessageAt: row.last_message_at
  }
}

function mapMessage(row: MessageRow): ChatMessageRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    tenantId: row.tenant_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
    attachments: parseJson(row.attachments_json),
    matchedContentSources: parseJson(row.matched_content_sources_json),
    citations: parseJson(row.citations_json),
    answerSource: row.answer_source || undefined,
    credentialSource: row.credential_source || undefined,
    retrievalConfidence: row.retrieval_confidence || undefined
  }
}

function mapLead(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sessionId: row.session_id,
    name: row.name,
    company: row.company,
    contact: row.contact,
    demandType: row.demand_type,
    message: row.message,
    createdAt: row.created_at
  }
}

function mapUsage(row: UsageRow): LlmUsageRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sessionId: row.session_id,
    provider: row.provider,
    model: row.model,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    totalTokens: row.total_tokens,
    amount: row.amount,
    status: row.status,
    credentialSource: row.credential_source || undefined,
    answerSource: row.answer_source || undefined,
    createdAt: row.created_at
  }
}

export class D1AgentRuntimeStorageRepository implements StorageRepository {
  private readonly db: D1Database
  private readonly tenantStorage: D1TenantIdentityStorageRepository

  constructor(db: D1Database) {
    this.db = db
    this.tenantStorage = new D1TenantIdentityStorageRepository(db)
  }

  saveTenant(tenant: TenantRecord): Promise<void> {
    return this.tenantStorage.saveTenant(tenant)
  }

  getTenantById(tenantId: string): Promise<TenantRecord | undefined> {
    return this.tenantStorage.getTenantById(tenantId)
  }

  getTenantByEmbedKey(embedKey: string): Promise<TenantRecord | undefined> {
    return this.tenantStorage.getTenantByEmbedKey(embedKey)
  }

  listTenants(): Promise<TenantRecord[]> {
    return this.tenantStorage.listTenants()
  }

  saveTenantUser(user: TenantUserRecord): Promise<void> {
    return this.tenantStorage.saveTenantUser(user)
  }

  getTenantUserByEmail(email: string): Promise<TenantUserRecord | undefined> {
    return this.tenantStorage.getTenantUserByEmail(email)
  }

  getTenantUserById(userId: string): Promise<TenantUserRecord | undefined> {
    return this.tenantStorage.getTenantUserById(userId)
  }

  listTenantUsersByTenant(tenantId: string): Promise<TenantUserRecord[]> {
    return this.tenantStorage.listTenantUsersByTenant(tenantId)
  }

  saveTenantPasswordReset(record: TenantPasswordResetRecord): Promise<void> {
    return this.tenantStorage.saveTenantPasswordReset(record)
  }

  getTenantPasswordResetByCode(email: string, code: string): Promise<TenantPasswordResetRecord | undefined> {
    return this.tenantStorage.getTenantPasswordResetByCode(email, code)
  }

  async saveSession(session: ChatSessionRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO chat_sessions (
          id, tenant_id, visitor_id, started_at, last_message_at
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .bind(session.id, session.tenantId, session.visitorId, session.startedAt, session.lastMessageAt)
      .run()
  }

  async getSessionById(sessionId: string): Promise<ChatSessionRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM chat_sessions WHERE id = ? LIMIT 1')
      .bind(sessionId)
      .first<SessionRow>()

    return row ? mapSession(row) : undefined
  }

  async listSessionsByTenant(tenantId: string): Promise<ChatSessionRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM chat_sessions WHERE tenant_id = ? ORDER BY last_message_at DESC')
      .bind(tenantId)
      .all<SessionRow>()

    return result.results.map(mapSession)
  }

  async saveMessage(message: ChatMessageRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO chat_messages (
          id, session_id, tenant_id, role, content, created_at, attachments_json, matched_content_sources_json,
          citations_json, answer_source, credential_source, retrieval_confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        message.id,
        message.sessionId,
        message.tenantId,
        message.role,
        message.content,
        message.createdAt,
        message.attachments ? JSON.stringify(message.attachments) : null,
        message.matchedContentSources ? JSON.stringify(message.matchedContentSources) : null,
        message.citations ? JSON.stringify(message.citations) : null,
        message.answerSource || null,
        message.credentialSource || null,
        message.retrievalConfidence || null
      )
      .run()
  }

  async listMessagesBySession(sessionId: string): Promise<ChatMessageRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC')
      .bind(sessionId)
      .all<MessageRow>()

    return result.results.map(mapMessage)
  }

  async saveLead(lead: LeadRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO leads (
          id, tenant_id, session_id, name, company, contact, demand_type, message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        lead.id,
        lead.tenantId,
        lead.sessionId,
        lead.name,
        lead.company,
        lead.contact,
        lead.demandType,
        lead.message,
        lead.createdAt
      )
      .run()
  }

  async listLeadsByTenant(tenantId: string): Promise<LeadRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC')
      .bind(tenantId)
      .all<LeadRow>()

    return result.results.map(mapLead)
  }

  async saveUsageRecord(record: LlmUsageRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO usage_records (
          id, tenant_id, session_id, provider, model, input_tokens, output_tokens, total_tokens, amount, status,
          credential_source, answer_source, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.id,
        record.tenantId,
        record.sessionId,
        record.provider,
        record.model,
        record.inputTokens,
        record.outputTokens,
        record.totalTokens,
        record.amount,
        record.status,
        record.credentialSource || null,
        record.answerSource || null,
        record.createdAt
      )
      .run()
  }

  async listUsageByTenant(tenantId: string): Promise<LlmUsageRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM usage_records WHERE tenant_id = ? ORDER BY created_at DESC')
      .bind(tenantId)
      .all<UsageRow>()

    return result.results.map(mapUsage)
  }
}
