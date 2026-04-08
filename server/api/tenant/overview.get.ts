import { getBillingPlanById } from '../../../lib/billing-plans'
import { listTrainingRuns } from '../../../lib/training-runs'
import { requireTenantSession } from '../../lib/auth'
import { buildMonthlyBillingSummary } from '../../lib/billing'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  const storage = getStorage()
  const tenant = await storage.getTenantById(session.tenantId)
  const user = await storage.getTenantUserById(session.tenantUserId)

  if (!tenant || !user || user.status !== 'active') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const [sessions, leads, usageRecords] = await Promise.all([
    storage.listSessionsByTenant(tenant.id),
    storage.listLeadsByTenant(tenant.id),
    storage.listUsageByTenant(tenant.id)
  ])
  const plan = getBillingPlanById(tenant.billingSubscription?.planId)
  const summaries = buildMonthlyBillingSummary(usageRecords, plan, tenant.billingSubscription)

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      brandName: tenant.brandName,
      contactEmail: tenant.contactEmail
    },
    user: {
      email: user.email,
      mustChangePassword: user.mustChangePassword
    },
    kpis: {
      sessionCount: sessions.length,
      leadCount: leads.length,
      contentSourceCount: tenant.contentConfig?.contentSources?.length ?? 0
    },
    trainingRuns: listTrainingRuns(usageRecords).slice(0, 10),
    latestBillingSummary: summaries[summaries.length - 1] || null
  }
})
