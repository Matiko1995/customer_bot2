import type {
  ChatMessageRecord,
  ChatSessionRecord,
  LeadRecord,
  LlmUsageRecord,
  TenantPasswordResetRecord,
  TenantRecord,
  TenantUserRecord
} from '../../../types'
import type { StorageRepository } from './types'

const cloneRecord = <T>(value: T): T => structuredClone(value)

export const createMemoryStore = (): StorageRepository => {
  const tenants = new Map<string, TenantRecord>()
  const sessions = new Map<string, ChatSessionRecord>()
  const messages = new Map<string, ChatMessageRecord[]>()
  const leads = new Map<string, LeadRecord[]>()
  const usage = new Map<string, LlmUsageRecord[]>()
  const tenantUsers = new Map<string, TenantUserRecord>()
  const tenantPasswordResets = new Map<string, TenantPasswordResetRecord>()

  return {
    async saveTenant(tenant) {
      tenants.set(tenant.id, cloneRecord(tenant))
    },
    async getTenantById(tenantId) {
      const tenant = tenants.get(tenantId)
      return tenant ? cloneRecord(tenant) : undefined
    },
    async getTenantByEmbedKey(embedKey) {
      const tenant = Array.from(tenants.values()).find((item) => item.embedKey === embedKey)
      return tenant ? cloneRecord(tenant) : undefined
    },
    async listTenants() {
      return Array.from(tenants.values(), cloneRecord)
    },
    async saveSession(session) {
      sessions.set(session.id, cloneRecord(session))
    },
    async getSessionById(sessionId) {
      const session = sessions.get(sessionId)
      return session ? cloneRecord(session) : undefined
    },
    async listSessionsByTenant(tenantId) {
      return Array.from(sessions.values())
        .filter((session) => session.tenantId === tenantId)
        .map(cloneRecord)
    },
    async saveMessage(message) {
      const bucket = messages.get(message.sessionId) ?? []
      bucket.push(cloneRecord(message))
      messages.set(message.sessionId, bucket)
    },
    async listMessagesBySession(sessionId) {
      return (messages.get(sessionId) ?? []).map(cloneRecord)
    },
    async saveLead(lead) {
      const bucket = leads.get(lead.tenantId) ?? []
      bucket.push(cloneRecord(lead))
      leads.set(lead.tenantId, bucket)
    },
    async listLeadsByTenant(tenantId) {
      return (leads.get(tenantId) ?? []).map(cloneRecord)
    },
    async saveUsageRecord(record) {
      const bucket = usage.get(record.tenantId) ?? []
      bucket.push(cloneRecord(record))
      usage.set(record.tenantId, bucket)
    },
    async listUsageByTenant(tenantId) {
      return (usage.get(tenantId) ?? []).map(cloneRecord)
    },
    async saveTenantUser(user) {
      tenantUsers.set(user.id, cloneRecord(user))
    },
    async getTenantUserByEmail(email) {
      const normalized = email.trim().toLowerCase()
      const user = Array.from(tenantUsers.values()).find((item) => item.email.toLowerCase() === normalized)
      return user ? cloneRecord(user) : undefined
    },
    async getTenantUserById(userId) {
      const user = tenantUsers.get(userId)
      return user ? cloneRecord(user) : undefined
    },
    async listTenantUsersByTenant(tenantId) {
      return Array.from(tenantUsers.values())
        .filter((user) => user.tenantId === tenantId)
        .map(cloneRecord)
    },
    async saveTenantPasswordReset(record) {
      tenantPasswordResets.set(record.id, cloneRecord(record))
    },
    async getTenantPasswordResetByCode(email, code) {
      const normalizedEmail = email.trim().toLowerCase()
      const item = Array.from(tenantPasswordResets.values()).find(
        (reset) => reset.email.toLowerCase() === normalizedEmail && reset.code === code
      )
      return item ? cloneRecord(item) : undefined
    }
  }
}
