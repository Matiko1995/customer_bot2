import type { BillingPlan, BillingSummary, LlmUsageRecord, TenantBillingSubscription } from '../../types'

function getMonthKey(timestamp: number): BillingSummary['month'] {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function addMoney(left: string, right: string): string {
  return (Number(left) + Number(right)).toFixed(2)
}

function multiplyMoney(left: string, right: number): string {
  return (Number(left) * right).toFixed(2)
}

export function buildMonthlyBillingSummary(
  records: LlmUsageRecord[],
  plan?: BillingPlan | null,
  subscription?: TenantBillingSubscription | null
): BillingSummary[] {
  const grouped = new Map<string, BillingSummary>()

  for (const record of records) {
    if (record.status !== 'success') {
      continue
    }

    const month = getMonthKey(record.createdAt)
    const key = `${record.tenantId}:${month}`
    const existing = grouped.get(key)

    if (existing) {
      existing.inputTokens += record.inputTokens
      existing.outputTokens += record.outputTokens
      existing.totalTokens += record.totalTokens
      if (!plan || !subscription) {
        existing.amount = addMoney(existing.amount, record.amount)
      }
      continue
    }

    grouped.set(key, {
      tenantId: record.tenantId,
      month,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      totalTokens: record.totalTokens,
      includedTokens: 0,
      billableTokens: 0,
      baseFee: '0.00',
      overageFee: '0.00',
      amount: !plan || !subscription ? Number(record.amount).toFixed(2) : '0.00'
    })
  }

  for (const summary of grouped.values()) {
    if (!plan || !subscription) {
      continue
    }

    summary.includedTokens = plan.includedTokens
    summary.billableTokens = Math.max(0, summary.totalTokens - plan.includedTokens)
    summary.baseFee = Number(plan.monthlyFee).toFixed(2)
    summary.overageFee = multiplyMoney(plan.overagePricePerThousandTokens, summary.billableTokens / 1000)
    summary.amount = addMoney(summary.baseFee, summary.overageFee)
  }

  return Array.from(grouped.values()).sort((left, right) => left.month.localeCompare(right.month))
}

export function pickLatestBillingSummary(summaries: BillingSummary[]): BillingSummary | null {
  if (!summaries.length) {
    return null
  }

  return [...summaries].sort((left, right) => right.month.localeCompare(left.month))[0] ?? null
}

export function buildBillingCsv(summaries: BillingSummary[]): string {
  const header = [
    'tenantId',
    'month',
    'inputTokens',
    'outputTokens',
    'totalTokens',
    'includedTokens',
    'billableTokens',
    'baseFee',
    'overageFee',
    'amount'
  ]

  const rows = summaries.map((item) =>
    [
      item.tenantId,
      item.month,
      item.inputTokens,
      item.outputTokens,
      item.totalTokens,
      item.includedTokens,
      item.billableTokens,
      item.baseFee,
      item.overageFee,
      item.amount
    ].join(',')
  )

  return [header.join(','), ...rows].join('\n')
}
