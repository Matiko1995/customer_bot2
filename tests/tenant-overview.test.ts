import { describe, expect, it } from 'vitest'
import type { BillingSummary, ChatSessionRecord, LeadRecord } from '../types'
import { buildTenantOverview } from '../lib/tenant-overview'

describe('tenant overview', () => {
  it('builds summary cards from sessions, leads, billing and content stats', () => {
    const sessions: ChatSessionRecord[] = [
      {
        id: 'session-1',
        tenantId: 'tenant-1',
        visitorId: 'visitor-1',
        startedAt: 1,
        lastMessageAt: 100
      },
      {
        id: 'session-2',
        tenantId: 'tenant-1',
        visitorId: 'visitor-2',
        startedAt: 2,
        lastMessageAt: 200
      }
    ]

    const leads: LeadRecord[] = [
      {
        id: 'lead-1',
        tenantId: 'tenant-1',
        sessionId: 'session-1',
        name: '张三',
        company: 'A 公司',
        contact: '13800000000',
        demandType: '部署咨询',
        message: '需要私有化',
        createdAt: 50
      }
    ]

    const billingSummary: BillingSummary = {
      tenantId: 'tenant-1',
      month: '2026-04',
      inputTokens: 100,
      outputTokens: 200,
      totalTokens: 300,
      includedTokens: 1000,
      billableTokens: 0,
      baseFee: '99.00',
      overageFee: '0.00',
      amount: '99.00'
    }

    const overview = buildTenantOverview({
      sessions,
      leads,
      latestBillingSummary: billingSummary,
      contentStats: [
        {
          id: 'source-1',
          title: '交付手册',
          type: 'document',
          category: '交付',
          hits: 3
        }
      ]
    })

    expect(overview.sessionCount).toBe(2)
    expect(overview.leadCount).toBe(1)
    expect(overview.latestBillingAmount).toBe('99.00')
    expect(overview.topContentSourceTitle).toBe('交付手册')
    expect(overview.lastActiveAt).toBe(200)
  })
})
