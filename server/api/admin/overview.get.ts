import { buildAdminOverview } from '../../../lib/admin-overview'
import { aggregateMatchedContentSourceStats } from '../../../lib/content-ops'
import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'
import { buildMonthlyBillingSummary } from '../../lib/billing'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const storage = getStorage()
  const tenants = await storage.listTenants()
  const sessions = (await Promise.all(tenants.map((tenant) => storage.listSessionsByTenant(tenant.id)))).flat()
  const leads = (await Promise.all(tenants.map((tenant) => storage.listLeadsByTenant(tenant.id)))).flat()
  const usageRecords = (await Promise.all(tenants.map((tenant) => storage.listUsageByTenant(tenant.id)))).flat()
  const billingSummaries = buildMonthlyBillingSummary(usageRecords)

  const contentStatsByTenant = new Map<string, ReturnType<typeof aggregateMatchedContentSourceStats>>()

  for (const tenant of tenants) {
    const tenantSessions = await storage.listSessionsByTenant(tenant.id)
    const messageGroups = await Promise.all(tenantSessions.map((session) => storage.listMessagesBySession(session.id)))
    contentStatsByTenant.set(tenant.id, aggregateMatchedContentSourceStats(messageGroups.flat()))
  }

  return buildAdminOverview({
    tenants,
    sessions,
    leads,
    billingSummaries,
    contentStatsByTenant
  })
})
