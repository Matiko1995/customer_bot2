import type { RuntimeConfigResponse } from '../../../../packages/contracts/src/embed/runtime-config.contract.ts'
import type { WidgetScriptResponse } from '../../../../packages/contracts/src/embed/widget-script.contract.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { getCloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/runtime.ts'
import { createCloudflareTenantIdentityStorage } from '../../../tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'
import { EmbedDeliveryApplication } from '../embed-delivery.application.ts'

async function loadCloudflareRuntimeConfig(bindings: CloudflareRuntimeBindings, tenantId: string): Promise<RuntimeConfigResponse> {
  const storage = createCloudflareTenantIdentityStorage(bindings)
  const tenant = await storage.getTenantById(tenantId)

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  return {
    tenantId: tenant.id,
    status: tenant.status,
    brandName: tenant.brandName,
    themeColor: tenant.themeColor,
    contactPhone: tenant.contactPhone,
    contactEmail: tenant.contactEmail,
    contactAddress: tenant.contactAddress,
    systemPrompt: tenant.systemPrompt
  }
}

async function loadCloudflareWidgetScript(bindings: CloudflareRuntimeBindings): Promise<WidgetScriptResponse> {
  if (!bindings.ASSETS) {
    throw new Error('ASSETS binding is unavailable')
  }

  const response = await bindings.ASSETS.fetch('https://assets.local/customer-bot.js')
  if (!response.ok) {
    throw new Error('customer-bot.js not found in Cloudflare assets')
  }

  return {
    code: await response.text(),
    contentType: response.headers.get('content-type') || 'application/javascript; charset=utf-8',
    cacheControl: response.headers.get('cache-control') || 'public, max-age=60, stale-while-revalidate=300'
  }
}

export function createCloudflareEmbedDeliveryApplication(bindings?: CloudflareRuntimeBindings) {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (!runtimeBindings?.TENANT_IDENTITY_DB) {
    throw new Error('TENANT_IDENTITY_DB binding is required')
  }

  return new EmbedDeliveryApplication({
    getRuntimeConfig: (tenantId: string) => loadCloudflareRuntimeConfig(runtimeBindings, tenantId),
    getWidgetScript: () => loadCloudflareWidgetScript(runtimeBindings)
  })
}
