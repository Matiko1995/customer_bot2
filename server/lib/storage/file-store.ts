import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
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

interface FileStoreState {
  tenants: TenantRecord[]
  sessions: ChatSessionRecord[]
  messages: ChatMessageRecord[]
  leads: LeadRecord[]
  usage: LlmUsageRecord[]
  tenantUsers: TenantUserRecord[]
  tenantPasswordResets: TenantPasswordResetRecord[]
}

const cloneRecord = <T>(value: T): T => structuredClone(value)

const createEmptyState = (): FileStoreState => ({
  tenants: [],
  sessions: [],
  messages: [],
  leads: [],
  usage: [],
  tenantUsers: [],
  tenantPasswordResets: []
})

export interface FileStoreOptions {
  filePath: string
  seedTenants?: TenantRecord[]
}

export const createFileStore = (options: FileStoreOptions): StorageRepository => {
  let statePromise: Promise<FileStoreState> | undefined
  let writeQueue = Promise.resolve()

  async function persist(state: FileStoreState) {
    const nextState = cloneRecord(state)
    writeQueue = writeQueue.then(async () => {
      await mkdir(dirname(options.filePath), { recursive: true })
      await writeFile(options.filePath, JSON.stringify(nextState, null, 2), 'utf8')
    })
    await writeQueue
  }

  async function loadState(): Promise<FileStoreState> {
    try {
      const raw = await readFile(options.filePath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<FileStoreState>

      return {
        tenants: Array.isArray(parsed.tenants) ? parsed.tenants.map(cloneRecord) : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.map(cloneRecord) : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages.map(cloneRecord) : [],
        leads: Array.isArray(parsed.leads) ? parsed.leads.map(cloneRecord) : [],
        usage: Array.isArray(parsed.usage) ? parsed.usage.map(cloneRecord) : [],
        tenantUsers: Array.isArray(parsed.tenantUsers) ? parsed.tenantUsers.map(cloneRecord) : [],
        tenantPasswordResets: Array.isArray(parsed.tenantPasswordResets) ? parsed.tenantPasswordResets.map(cloneRecord) : []
      }
    } catch (error) {
      const maybeError = error as NodeJS.ErrnoException
      if (maybeError?.code !== 'ENOENT') {
        throw error
      }

      return createEmptyState()
    }
  }

  async function ensureState() {
    if (!statePromise) {
      statePromise = (async () => {
        const state = await loadState()
        const seedTenants = options.seedTenants ?? []
        let changed = false

        for (const tenant of seedTenants) {
          if (!state.tenants.some((item) => item.id === tenant.id)) {
            state.tenants.push(cloneRecord(tenant))
            changed = true
          }
        }

        if (changed) {
          await persist(state)
        }

        return state
      })()
    }

    return statePromise
  }

  async function updateState(mutator: (state: FileStoreState) => void | Promise<void>) {
    const state = await ensureState()
    await mutator(state)
    await persist(state)
  }

  return {
    async saveTenant(tenant) {
      await updateState((state) => {
        const nextTenant = cloneRecord(tenant)
        const index = state.tenants.findIndex((item) => item.id === tenant.id)
        if (index >= 0) {
          state.tenants[index] = nextTenant
          return
        }

        state.tenants.push(nextTenant)
      })
    },
    async getTenantById(tenantId) {
      const state = await ensureState()
      const tenant = state.tenants.find((item) => item.id === tenantId)
      return tenant ? cloneRecord(tenant) : undefined
    },
    async getTenantByEmbedKey(embedKey) {
      const state = await ensureState()
      const tenant = state.tenants.find((item) => item.embedKey === embedKey)
      return tenant ? cloneRecord(tenant) : undefined
    },
    async listTenants() {
      const state = await ensureState()
      return state.tenants.map(cloneRecord)
    },
    async saveSession(session) {
      await updateState((state) => {
        const nextSession = cloneRecord(session)
        const index = state.sessions.findIndex((item) => item.id === session.id)
        if (index >= 0) {
          state.sessions[index] = nextSession
          return
        }

        state.sessions.push(nextSession)
      })
    },
    async getSessionById(sessionId) {
      const state = await ensureState()
      const session = state.sessions.find((item) => item.id === sessionId)
      return session ? cloneRecord(session) : undefined
    },
    async listSessionsByTenant(tenantId) {
      const state = await ensureState()
      return state.sessions.filter((item) => item.tenantId === tenantId).map(cloneRecord)
    },
    async saveMessage(message) {
      await updateState((state) => {
        state.messages.push(cloneRecord(message))
      })
    },
    async listMessagesBySession(sessionId) {
      const state = await ensureState()
      return state.messages.filter((item) => item.sessionId === sessionId).map(cloneRecord)
    },
    async saveLead(lead) {
      await updateState((state) => {
        state.leads.push(cloneRecord(lead))
      })
    },
    async listLeadsByTenant(tenantId) {
      const state = await ensureState()
      return state.leads.filter((item) => item.tenantId === tenantId).map(cloneRecord)
    },
    async saveUsageRecord(record) {
      await updateState((state) => {
        state.usage.push(cloneRecord(record))
      })
    },
    async listUsageByTenant(tenantId) {
      const state = await ensureState()
      return state.usage.filter((item) => item.tenantId === tenantId).map(cloneRecord)
    },
    async saveTenantUser(user) {
      await updateState((state) => {
        const nextUser = cloneRecord(user)
        const index = state.tenantUsers.findIndex((item) => item.id === user.id)
        if (index >= 0) {
          state.tenantUsers[index] = nextUser
          return
        }

        state.tenantUsers.push(nextUser)
      })
    },
    async getTenantUserByEmail(email) {
      const state = await ensureState()
      const normalized = email.trim().toLowerCase()
      const user = state.tenantUsers.find((item) => item.email.toLowerCase() === normalized)
      return user ? cloneRecord(user) : undefined
    },
    async getTenantUserById(userId) {
      const state = await ensureState()
      const user = state.tenantUsers.find((item) => item.id === userId)
      return user ? cloneRecord(user) : undefined
    },
    async listTenantUsersByTenant(tenantId) {
      const state = await ensureState()
      return state.tenantUsers.filter((item) => item.tenantId === tenantId).map(cloneRecord)
    },
    async saveTenantPasswordReset(record) {
      await updateState((state) => {
        const nextRecord = cloneRecord(record)
        const index = state.tenantPasswordResets.findIndex((item) => item.id === record.id)
        if (index >= 0) {
          state.tenantPasswordResets[index] = nextRecord
          return
        }

        state.tenantPasswordResets.push(nextRecord)
      })
    },
    async getTenantPasswordResetByCode(email, code) {
      const state = await ensureState()
      const normalized = email.trim().toLowerCase()
      const item = state.tenantPasswordResets.find((reset) => reset.email.toLowerCase() === normalized && reset.code === code)
      return item ? cloneRecord(item) : undefined
    }
  }
}
