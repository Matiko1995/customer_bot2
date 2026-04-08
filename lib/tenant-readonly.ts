import type { ChatMessageRecord, ChatSessionRecord, LeadRecord } from '../types'

export function buildTenantChatItems(
  sessions: ChatSessionRecord[],
  messagesBySession: Map<string, ChatMessageRecord[]>
): Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }> {
  return [...sessions]
    .sort((left, right) => right.lastMessageAt - left.lastMessageAt)
    .map((session) => ({
      session,
      messages: [...(messagesBySession.get(session.id) ?? [])].sort((left, right) => left.createdAt - right.createdAt)
    }))
}

export function sortTenantLeads(leads: LeadRecord[]): LeadRecord[] {
  return [...leads].sort((left, right) => right.createdAt - left.createdAt)
}
