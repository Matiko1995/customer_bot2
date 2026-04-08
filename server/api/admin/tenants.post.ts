import type { TenantRecord } from '../../../types'
import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'
import { createTenantLoginForTenant } from '../../lib/tenant-users'

function nextTenantId(): string {
  return `tenant-${Date.now()}`
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const body = await readBody<Partial<TenantRecord>>(event)
  const now = Date.now()
  const tenant: TenantRecord = {
    id: body.id?.trim() || nextTenantId(),
    name: body.name?.trim() || 'New Tenant',
    status: body.status === 'disabled' ? 'disabled' : 'active',
    brandName: body.brandName?.trim() || body.name?.trim() || 'New Tenant',
    themeColor: body.themeColor?.trim() || '#118ab2',
    contactPhone: body.contactPhone?.trim() || '',
    contactEmail: body.contactEmail?.trim() || '',
    contactAddress: body.contactAddress?.trim() || '',
    systemPrompt: body.systemPrompt?.trim() || 'You are the tenant bot.',
    llmEndpoint: body.llmEndpoint?.trim() || '',
    llmApiKey: body.llmApiKey?.trim() || '',
    llmModel: body.llmModel?.trim() || '',
    reuseAnsweredQuestions: body.reuseAnsweredQuestions !== false,
    deletedAt: undefined,
    embedKey: body.embedKey?.trim() || `embed-${Math.random().toString(36).slice(2, 10)}`,
    billingSubscription: body.billingSubscription ?? {
      planId: 'plan-basic',
      startedAt: now,
      notes: ''
    },
    contentConfig: body.contentConfig,
    createdAt: now,
    updatedAt: now
  }

  const storage = getStorage()
  await storage.saveTenant(tenant)
  const tenantLogin = await createTenantLoginForTenant({
    tenant,
    storage,
    now
  })

  return {
    ok: true,
    item: tenant,
    tenantLogin: {
      email: tenantLogin.user.email,
      initialPassword: tenantLogin.initialPassword,
      mustChangePassword: tenantLogin.user.mustChangePassword
    }
  }
})
