import type { BillingPlan } from '../types'

export const billingPlans: BillingPlan[] = [
  {
    id: 'plan-basic',
    name: '基础版',
    monthlyFee: '99.00',
    includedTokens: 50000,
    overagePricePerThousandTokens: '1.00',
    active: true
  },
  {
    id: 'plan-standard',
    name: '标准版',
    monthlyFee: '199.00',
    includedTokens: 100000,
    overagePricePerThousandTokens: '0.80',
    active: true
  },
  {
    id: 'plan-pro',
    name: '专业版',
    monthlyFee: '399.00',
    includedTokens: 250000,
    overagePricePerThousandTokens: '0.60',
    active: true
  }
]

export function getBillingPlanById(planId?: string | null): BillingPlan | null {
  if (!planId) {
    return null
  }

  return billingPlans.find((item) => item.id === planId) ?? null
}
