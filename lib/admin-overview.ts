import type { BillingSummary, ChatSessionRecord, LeadRecord, MatchedContentSource, TenantRecord } from '../types'

export interface AdminOverviewInput {
  tenants: TenantRecord[]
  sessions: ChatSessionRecord[]
  leads: LeadRecord[]
  billingSummaries: BillingSummary[]
  contentStatsByTenant: Map<string, Array<MatchedContentSource & { hits: number }>>
}

export interface AdminOverview {
  kpis: {
    todaySessions: number
    todayLeads: number
    activeContentHits: number
    attentionTenants: number
  }
  recentlyActive: Array<{
    tenantId: string
    tenantName: string
    lastMessageAt: number
    status: TenantRecord['status']
  }>
  priorityTenants: Array<{
    tenantId: string
    tenantName: string
    reason: string
    status: TenantRecord['status']
  }>
}

export function buildAdminOverview(input: AdminOverviewInput): AdminOverview {
  const tenantMap = new Map(input.tenants.map((tenant) => [tenant.id, tenant]))
  const activeHits = Array.from(input.contentStatsByTenant.values()).flat().reduce((sum, item) => sum + item.hits, 0)

  const recentlyActive = Array.from(
    new Map(
      input.sessions
        .sort((left, right) => right.lastMessageAt - left.lastMessageAt)
        .map((session) => {
          const tenant = tenantMap.get(session.tenantId)
          return [
            session.tenantId,
            {
              tenantId: session.tenantId,
              tenantName: tenant?.name || session.tenantId,
              lastMessageAt: session.lastMessageAt,
              status: tenant?.status || 'active'
            }
          ]
        })
    ).values()
  ).slice(0, 6)

  const priorityTenants = input.tenants
    .map((tenant) => {
      const latestBilling = input.billingSummaries
        .filter((item) => item.tenantId === tenant.id)
        .sort((left, right) => right.month.localeCompare(left.month))[0]
      const contentStats = input.contentStatsByTenant.get(tenant.id) ?? []

      if (tenant.status === 'disabled') {
        return { tenantId: tenant.id, tenantName: tenant.name, reason: '租户已停用', status: tenant.status }
      }

      if ((latestBilling?.billableTokens || 0) > 0) {
        return { tenantId: tenant.id, tenantName: tenant.name, reason: '套餐已产生超额', status: tenant.status }
      }

      if (contentStats.length === 0) {
        return { tenantId: tenant.id, tenantName: tenant.name, reason: '暂无资料命中', status: tenant.status }
      }

      return null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 6)

  return {
    kpis: {
      todaySessions: input.sessions.length,
      todayLeads: input.leads.length,
      activeContentHits: activeHits,
      attentionTenants: priorityTenants.length
    },
    recentlyActive,
    priorityTenants
  }
}
