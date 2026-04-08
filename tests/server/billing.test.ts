import { describe, expect, expectTypeOf, it } from 'vitest'
import { buildBillingCsv, buildMonthlyBillingSummary, pickLatestBillingSummary } from '../../server/lib/billing'
import type { BillingPlan, BillingSummary, TenantBillingSubscription } from '../../types'

describe('billing summary types', () => {
  it('supports tenant monthly totals', () => {
    const summary = {
      tenantId: 'tenant-1',
      month: '2026-03',
      inputTokens: 1200,
      outputTokens: 800,
      totalTokens: 2000,
      includedTokens: 100000,
      billableTokens: 0,
      baseFee: '99.00',
      overageFee: '0.00',
      amount: '12.34'
    } satisfies BillingSummary

    expectTypeOf<BillingSummary['month']>().toEqualTypeOf<`${number}-${number}`>()
    expectTypeOf<BillingSummary['amount']>().toEqualTypeOf<string>()
    expectTypeOf(summary.totalTokens).toEqualTypeOf<number>()
  })

  it('calculates monthly plan fee with overage', () => {
    const plan: BillingPlan = {
      id: 'plan-standard',
      name: '标准版',
      monthlyFee: '199.00',
      includedTokens: 100000,
      overagePricePerThousandTokens: '0.80',
      active: true
    }

    const subscription: TenantBillingSubscription = {
      planId: 'plan-standard',
      startedAt: Date.UTC(2026, 2, 1),
      notes: ''
    }

    const summaries = buildMonthlyBillingSummary(
      [
        {
          id: 'usage-1',
          tenantId: 'tenant-1',
          sessionId: 'session-1',
          provider: 'openai-compatible',
          model: 'gpt-test',
          inputTokens: 60000,
          outputTokens: 70000,
          totalTokens: 130000,
          amount: '0',
          status: 'success',
          createdAt: Date.UTC(2026, 2, 8)
        }
      ],
      plan,
      subscription
    )

    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toMatchObject({
      tenantId: 'tenant-1',
      month: '2026-03',
      totalTokens: 130000,
      includedTokens: 100000,
      billableTokens: 30000,
      baseFee: '199.00',
      overageFee: '24.00',
      amount: '223.00'
    })
  })

  it('picks latest billing summary by month', () => {
    const latest = pickLatestBillingSummary([
      {
        tenantId: 'tenant-1',
        month: '2026-03',
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
        includedTokens: 100,
        billableTokens: 0,
        baseFee: '99.00',
        overageFee: '0.00',
        amount: '99.00'
      },
      {
        tenantId: 'tenant-1',
        month: '2026-04',
        inputTokens: 2,
        outputTokens: 3,
        totalTokens: 5,
        includedTokens: 100,
        billableTokens: 0,
        baseFee: '99.00',
        overageFee: '0.00',
        amount: '99.00'
      }
    ])

    expect(latest?.month).toBe('2026-04')
  })

  it('builds billing csv export content', () => {
    const csv = buildBillingCsv([
      {
        tenantId: 'tenant-1',
        month: '2026-04',
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        includedTokens: 100,
        billableTokens: 0,
        baseFee: '99.00',
        overageFee: '0.00',
        amount: '99.00'
      }
    ])

    expect(csv).toContain('tenantId,month,inputTokens,outputTokens,totalTokens,includedTokens,billableTokens,baseFee,overageFee,amount')
    expect(csv).toContain('tenant-1,2026-04,10,20,30,100,0,99.00,0.00,99.00')
  })
})
