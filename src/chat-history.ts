import type { AssistantModuleId, ConversationMessage, MessageAttachment } from '../types'

const STORAGE_KEY = 'customer-bot:history:v1'

export type ConversationHistoryByModule = Record<AssistantModuleId, ConversationMessage[]>

function emptyHistory(): ConversationHistoryByModule {
  return {
    md: [],
    price: [],
    contact: []
  }
}

function normalizeRole(value: unknown): ConversationMessage['role'] | null {
  return value === 'user' || value === 'assistant' ? value : null
}

function normalizeAttachment(value: unknown): MessageAttachment | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<MessageAttachment>
  if (
    typeof candidate.id !== 'string' ||
    !candidate.id ||
    typeof candidate.name !== 'string' ||
    typeof candidate.mimeType !== 'string' ||
    typeof candidate.size !== 'number' ||
    typeof candidate.dataUrl !== 'string'
  ) {
    return null
  }

  return {
    id: candidate.id,
    name: candidate.name,
    mimeType: candidate.mimeType,
    size: candidate.size,
    dataUrl: candidate.dataUrl
  }
}

function normalizeMessage(value: unknown): ConversationMessage | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<ConversationMessage>
  const role = normalizeRole(candidate.role)
  if (!role || typeof candidate.content !== 'string') {
    return null
  }

  return {
    id: typeof candidate.id === 'string' && candidate.id ? candidate.id : `${role}-${Date.now()}`,
    role,
    content: candidate.content,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
    attachments: Array.isArray(candidate.attachments)
      ? candidate.attachments
          .map((item) => normalizeAttachment(item))
          .filter((item): item is MessageAttachment => Boolean(item))
      : undefined
  }
}

function normalizeHistory(value: unknown): ConversationHistoryByModule {
  const base = emptyHistory()
  if (!value || typeof value !== 'object') {
    return base
  }

  for (const moduleId of Object.keys(base) as AssistantModuleId[]) {
    const items = (value as Partial<Record<AssistantModuleId, unknown>>)[moduleId]
    if (!Array.isArray(items)) {
      continue
    }

    base[moduleId] = items.map((item) => normalizeMessage(item)).filter((item): item is ConversationMessage => Boolean(item))
  }

  return base
}

export function createConversationHistoryStore(storage: Storage | null | undefined = globalThis.localStorage) {
  return {
    load(): ConversationHistoryByModule {
      if (!storage) {
        return emptyHistory()
      }

      try {
        const raw = storage.getItem(STORAGE_KEY)
        if (!raw) {
          return emptyHistory()
        }

        return normalizeHistory(JSON.parse(raw))
      } catch {
        return emptyHistory()
      }
    },
    save(history: ConversationHistoryByModule) {
      if (!storage) {
        return
      }

      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch {
        // Ignore storage failures and keep the widget usable.
      }
    },
    clear() {
      if (!storage) {
        return
      }

      try {
        storage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore storage failures and keep the widget usable.
      }
    }
  }
}
