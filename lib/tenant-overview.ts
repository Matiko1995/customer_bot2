import type { BillingSummary, ChatSessionRecord, LeadRecord, MatchedContentSource } from '../types'

export interface TenantOverviewInput {
  sessions: ChatSessionRecord[]
  leads: LeadRecord[]
  latestBillingSummary: BillingSummary | null
  contentStats: Array<MatchedContentSource & { hits: number }>
}

export interface TenantOverview {
  sessionCount: number
  leadCount: number
  latestBillingAmount: string
  topContentSourceTitle: string
  topContentSourceHits: number
  lastActiveAt: number
}

export function buildTenantOverview(input: TenantOverviewInput): TenantOverview {
  const topContentSource = input.contentStats[0]
  const lastActiveAt = input.sessions.reduce((max, item) => Math.max(max, item.lastMessageAt), 0)

  return {
    sessionCount: input.sessions.length,
    leadCount: input.leads.length,
    latestBillingAmount: input.latestBillingSummary?.amount || '0.00',
    topContentSourceTitle: topContentSource?.title || '-',
    topContentSourceHits: topContentSource?.hits || 0,
    lastActiveAt
  }
}
