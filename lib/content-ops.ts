import type { ChatMessageRecord, ChatSessionRecord, MatchedContentSource, TenantContentSource } from '../types'

export function listContentSourceCategories(contentSources: TenantContentSource[]): string[] {
  return Array.from(
    new Set(
      contentSources
        .filter((item) => item.enabled !== false)
        .map((item) => item.category?.trim() || '')
        .filter(Boolean)
    )
  )
}

export function filterChatItemsByMatchedSourcesOnly(
  items: Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>,
  matchedOnly: boolean
): Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }> {
  if (!matchedOnly) {
    return items
  }

  return items.filter((item) => item.messages.some((message) => (message.matchedContentSources?.length ?? 0) > 0))
}

export function filterChatItemsByMatchedSourceId(
  items: Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>,
  sourceId: string
): Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }> {
  const normalizedSourceId = sourceId.trim()
  if (!normalizedSourceId) {
    return items
  }

  return items.filter((item) =>
    item.messages.some((message) => (message.matchedContentSources ?? []).some((source) => source.id === normalizedSourceId))
  )
}

export function aggregateMatchedContentSourceStats(
  messages: ChatMessageRecord[]
): Array<MatchedContentSource & { hits: number }> {
  const grouped = new Map<string, MatchedContentSource & { hits: number }>()

  for (const message of messages) {
    for (const source of message.matchedContentSources ?? []) {
      const existing = grouped.get(source.id)
      if (existing) {
        existing.hits += 1
        continue
      }

      grouped.set(source.id, {
        ...source,
        hits: 1
      })
    }
  }

  return Array.from(grouped.values()).sort((left, right) => right.hits - left.hits || left.title.localeCompare(right.title, 'zh-CN'))
}


export function formatMatchedSourceLabel(source: MatchedContentSource): string {
  if (source.id.startsWith('knowledge:')) {
    return source.category || '知识命中'
  }

  if (source.type === 'webpage') return '网页资料'
  if (source.type === 'email') return '邮件资料'
  if (source.type === 'excel') return '表格资料'
  return source.category || '文档资料'
}
