import type { AssistantModuleId, CitationRecord, ConversationMessage, MessageAttachment } from '../types'

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

function normalizeCitation(value: unknown): CitationRecord | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<CitationRecord>
  if (
    typeof candidate.documentId !== 'string' ||
    typeof candidate.chunkId !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.snippet !== 'string' ||
    typeof candidate.score !== 'number'
  ) {
    return null
  }

  return {
    documentId: candidate.documentId,
    chunkId: candidate.chunkId,
    title: candidate.title,
    snippet: candidate.snippet,
    score: candidate.score,
    sourceUri: typeof candidate.sourceUri === 'string' ? candidate.sourceUri : undefined,
    metadata: candidate.metadata && typeof candidate.metadata === 'object' ? candidate.metadata as Record<string, unknown> : undefined
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
    citations: Array.isArray(candidate.citations)
      ? candidate.citations
          .map((item) => normalizeCitation(item))
          .filter((item): item is CitationRecord => Boolean(item))
      : undefined,
    answerSource:
      candidate.answerSource === 'structured' || candidate.answerSource === 'rag' || candidate.answerSource === 'general_fallback'
        ? candidate.answerSource
        : undefined,
    credentialSource:
      candidate.credentialSource === 'tenant' || candidate.credentialSource === 'platform_shared'
        ? candidate.credentialSource
        : undefined,
    retrievalConfidence:
      candidate.retrievalConfidence === 'high' || candidate.retrievalConfidence === 'low' || candidate.retrievalConfidence === 'miss'
        ? candidate.retrievalConfidence
        : undefined,
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
