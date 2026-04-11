import { requireAdminSession } from '../../lib/auth'
import { getBillingPlanById } from '../../../lib/billing-plans'
import { buildBillingCsv, buildMonthlyBillingSummary, buildUsageBreakdown } from '../../lib/billing'
import { getStorage } from '../../lib/storage'
import { resolveTenant } from '../../lib/tenant-resolver'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const query = getQuery(event)
  const tenantId = typeof query.tenantId === 'string' ? String(query.tenantId) : ''
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  const storage = getStorage()
  const tenant = await resolveTenant(tenantId, storage)
  const usageRecords = await storage.listUsageByTenant(tenantId)
  const plan = getBillingPlanById(tenant?.billingSubscription?.planId)
  const summaries = buildMonthlyBillingSummary(usageRecords, plan, tenant?.billingSubscription)

  if (query.format === 'csv') {
    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(event, 'content-disposition', `attachment; filename="${tenantId}-billing.csv"`)
    return buildBillingCsv(summaries)
  }

  return {
    tenant,
    plan,
    usageRecords,
    summaries,
    breakdown: buildUsageBreakdown(usageRecords)
  }
})
