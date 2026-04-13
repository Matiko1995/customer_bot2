import type {
  ChatMessageRecord,
  ChatSessionRecord,
  LeadRecord,
  LlmUsageRecord,
  TenantPasswordResetRecord,
  TenantRecord,
  TenantUserRecord
} from '../../../../types'
import { normalizeTenantRagSettings } from '../../../../packages/shared-config/src/rag-settings.ts'
import type { D1Database } from '../../../../server/lib/cloudflare/bindings.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'

type TenantRow = {
  id: string
  name: string
  status: 'active' | 'disabled'
  brand_name: string
  theme_color: string
  contact_phone: string
  contact_email: string
  contact_address: string
  system_prompt: string
  llm_endpoint: string | null
  llm_api_key: string | null
  llm_model: string | null
  reuse_answered_questions: number
  deleted_at: number | null
  embed_key: string
  rag_settings_json: string | null
  billing_subscription_json: string | null
  content_config_json: string | null
  created_at: number
  updated_at: number
}

type TenantUserRow = {
  id: string
  tenant_id: string
  email: string
  password_hash: string
  temporary_password: string | null
  must_change_password: number
  status: 'active' | 'disabled'
  created_at: number
  updated_at: number
}

type TenantPasswordResetRow = {
  id: string
  tenant_user_id: string
  tenant_id: string
  email: string
  code: string
  expires_at: number
  used_at: number | null
  created_at: number
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined
  }

  return JSON.parse(value) as T
}

function mapTenant(row: TenantRow): TenantRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    brandName: row.brand_name,
    themeColor: row.theme_color,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    contactAddress: row.contact_address,
    systemPrompt: row.system_prompt,
    llmEndpoint: row.llm_endpoint || '',
    llmApiKey: row.llm_api_key || '',
    llmModel: row.llm_model || '',
    reuseAnsweredQuestions: row.reuse_answered_questions !== 0,
    deletedAt: row.deleted_at || undefined,
    embedKey: row.embed_key,
    ragSettings: normalizeTenantRagSettings(parseJson(row.rag_settings_json)),
    billingSubscription: parseJson(row.billing_subscription_json),
    contentConfig: parseJson(row.content_config_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapTenantUser(row: TenantUserRow): TenantUserRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    email: row.email,
    passwordHash: row.password_hash,
    temporaryPassword: row.temporary_password || '',
    mustChangePassword: row.must_change_password !== 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapTenantPasswordReset(row: TenantPasswordResetRow): TenantPasswordResetRecord {
  return {
    id: row.id,
    tenantUserId: row.tenant_user_id,
    tenantId: row.tenant_id,
    email: row.email,
    code: row.code,
    expiresAt: row.expires_at,
    usedAt: row.used_at || undefined,
    createdAt: row.created_at
  }
}

function stringify(value: unknown): string | null {
  if (value === undefined) {
    return null
  }

  return JSON.stringify(value)
}

function unsupported(name: string): never {
  throw new Error(`D1 tenant identity storage does not implement ${name} yet`)
}

export class D1TenantIdentityStorageRepository implements StorageRepository {
  private readonly db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  async saveTenant(tenant: TenantRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO tenants (
          id, name, status, brand_name, theme_color, contact_phone, contact_email, contact_address, system_prompt,
          llm_endpoint, llm_api_key, llm_model, reuse_answered_questions, deleted_at, embed_key,
          rag_settings_json, billing_subscription_json, content_config_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        tenant.id,
        tenant.name,
        tenant.status,
        tenant.brandName,
        tenant.themeColor,
        tenant.contactPhone,
        tenant.contactEmail,
        tenant.contactAddress,
        tenant.systemPrompt,
        tenant.llmEndpoint || null,
        tenant.llmApiKey || null,
        tenant.llmModel || null,
        tenant.reuseAnsweredQuestions === false ? 0 : 1,
        tenant.deletedAt || null,
        tenant.embedKey,
        stringify(tenant.ragSettings),
        stringify(tenant.billingSubscription),
        stringify(tenant.contentConfig),
        tenant.createdAt,
        tenant.updatedAt
      )
      .run()
  }

  async getTenantById(tenantId: string): Promise<TenantRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM tenants WHERE id = ? LIMIT 1')
      .bind(tenantId)
      .first<TenantRow>()

    return row ? mapTenant(row) : undefined
  }

  async getTenantByEmbedKey(embedKey: string): Promise<TenantRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM tenants WHERE embed_key = ? LIMIT 1')
      .bind(embedKey)
      .first<TenantRow>()

    return row ? mapTenant(row) : undefined
  }

  async listTenants(): Promise<TenantRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM tenants ORDER BY updated_at DESC')
      .all<TenantRow>()

    return result.results.map(mapTenant)
  }

  async saveTenantUser(user: TenantUserRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO tenant_users (
          id, tenant_id, email, password_hash, temporary_password, must_change_password, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user.id,
        user.tenantId,
        user.email.trim().toLowerCase(),
        user.passwordHash,
        user.temporaryPassword || null,
        user.mustChangePassword ? 1 : 0,
        user.status,
        user.createdAt,
        user.updatedAt
      )
      .run()
  }

  async getTenantUserByEmail(email: string): Promise<TenantUserRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM tenant_users WHERE lower(email) = lower(?) LIMIT 1')
      .bind(email)
      .first<TenantUserRow>()

    return row ? mapTenantUser(row) : undefined
  }

  async getTenantUserById(userId: string): Promise<TenantUserRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM tenant_users WHERE id = ? LIMIT 1')
      .bind(userId)
      .first<TenantUserRow>()

    return row ? mapTenantUser(row) : undefined
  }

  async listTenantUsersByTenant(tenantId: string): Promise<TenantUserRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM tenant_users WHERE tenant_id = ? ORDER BY created_at ASC')
      .bind(tenantId)
      .all<TenantUserRow>()

    return result.results.map(mapTenantUser)
  }

  async saveTenantPasswordReset(record: TenantPasswordResetRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO tenant_password_resets (
          id, tenant_user_id, tenant_id, email, code, expires_at, used_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.id,
        record.tenantUserId,
        record.tenantId,
        record.email.trim().toLowerCase(),
        record.code,
        record.expiresAt,
        record.usedAt || null,
        record.createdAt
      )
      .run()
  }

  async getTenantPasswordResetByCode(email: string, code: string): Promise<TenantPasswordResetRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM tenant_password_resets WHERE lower(email) = lower(?) AND code = ? LIMIT 1')
      .bind(email, code)
      .first<TenantPasswordResetRow>()

    return row ? mapTenantPasswordReset(row) : undefined
  }

  async saveSession(_session: ChatSessionRecord): Promise<void> {
    unsupported('saveSession')
  }

  async getSessionById(_sessionId: string): Promise<ChatSessionRecord | undefined> {
    unsupported('getSessionById')
  }

  async listSessionsByTenant(_tenantId: string): Promise<ChatSessionRecord[]> {
    unsupported('listSessionsByTenant')
  }

  async saveMessage(_message: ChatMessageRecord): Promise<void> {
    unsupported('saveMessage')
  }

  async listMessagesBySession(_sessionId: string): Promise<ChatMessageRecord[]> {
    unsupported('listMessagesBySession')
  }

  async saveLead(_lead: LeadRecord): Promise<void> {
    unsupported('saveLead')
  }

  async listLeadsByTenant(_tenantId: string): Promise<LeadRecord[]> {
    unsupported('listLeadsByTenant')
  }

  async saveUsageRecord(_record: LlmUsageRecord): Promise<void> {
    unsupported('saveUsageRecord')
  }

  async listUsageByTenant(_tenantId: string): Promise<LlmUsageRecord[]> {
    unsupported('listUsageByTenant')
  }
}
