import { describe, expect, it } from 'vitest'
import type { BillingSummary, ChatSessionRecord, LeadRecord, MatchedContentSource, TenantRecord } from '../types'
import { buildAdminOverview } from '../lib/admin-overview'

describe('admin overview', () => {
  it('builds command center metrics and priority lists', () => {
    const tenants: TenantRecord[] = [
      {
        id: 'tenant-a',
        name: 'Tenant A',
        status: 'active',
        brandName: 'Brand A',
        themeColor: '#118ab2',
        contactPhone: '',
        contactEmail: '',
        contactAddress: '',
        systemPrompt: '',
        embedKey: 'embed-a',
        createdAt: 1,
        updatedAt: 1
      },
      {
        id: 'tenant-b',
        name: 'Tenant B',
        status: 'disabled',
        brandName: 'Brand B',
        themeColor: '#118ab2',
        contactPhone: '',
        contactEmail: '',
        contactAddress: '',
        systemPrompt: '',
        embedKey: 'embed-b',
        createdAt: 1,
        updatedAt: 1
      }
    ]

    const sessions: ChatSessionRecord[] = [
      { id: 'session-1', tenantId: 'tenant-a', visitorId: 'v1', startedAt: 1, lastMessageAt: 200 },
      { id: 'session-2', tenantId: 'tenant-a', visitorId: 'v2', startedAt: 2, lastMessageAt: 300 },
      { id: 'session-3', tenantId: 'tenant-b', visitorId: 'v3', startedAt: 3, lastMessageAt: 100 }
    ]

    const leads: LeadRecord[] = [
      {
        id: 'lead-1',
        tenantId: 'tenant-a',
        sessionId: 'session-1',
        name: '张三',
        company: 'A 公司',
        contact: '138',
        demandType: '部署',
        message: '需要报价',
        createdAt: 150
      }
    ]

    const billingSummaries: BillingSummary[] = [
      {
        tenantId: 'tenant-a',
        month: '2026-03',
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
        includedTokens: 1000,
        billableTokens: 0,
        baseFee: '99.00',
        overageFee: '0.00',
        amount: '99.00'
      },
      {
        tenantId: 'tenant-b',
        month: '2026-03',
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 1500,
        includedTokens: 1000,
        billableTokens: 500,
        baseFee: '99.00',
        overageFee: '0.50',
        amount: '99.50'
      }
    ]

    const contentStatsByTenant = new Map<string, Array<MatchedContentSource & { hits: number }>>([
      [
        'tenant-a',
        [
          { id: 'source-1', title: '交付手册', type: 'document', category: '交付', hits: 5 },
          { id: 'source-2', title: '部署说明', type: 'webpage', category: '部署', hits: 2 }
        ]
      ],
      ['tenant-b', []]
    ])

    const overview = buildAdminOverview({
      tenants,
      sessions,
      leads,
      billingSummaries,
      contentStatsByTenant
    })

    expect(overview.kpis.todaySessions).toBe(3)
    expect(overview.kpis.todayLeads).toBe(1)
    expect(overview.kpis.activeContentHits).toBe(7)
    expect(overview.kpis.attentionTenants).toBe(1)
    expect(overview.priorityTenants[0]?.tenantId).toBe('tenant-b')
    expect(overview.recentlyActive[0]?.tenantId).toBe('tenant-a')
  })
})
