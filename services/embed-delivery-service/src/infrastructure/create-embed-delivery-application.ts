import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { RuntimeConfigResponse } from '../../../../packages/contracts/src/embed/runtime-config.contract.ts'
import type { WidgetScriptResponse } from '../../../../packages/contracts/src/embed/widget-script.contract.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { createTenantIdentityHttpAdapter } from '../../../../services/tenant-identity-service/src/infrastructure/create-tenant-identity-http-adapter.ts'
import { EmbedDeliveryApplication } from '../embed-delivery.application.ts'

async function loadWidgetScriptCode(): Promise<WidgetScriptResponse> {
  const candidatePaths = [
    resolve(process.cwd(), 'dist/customer-bot.js'),
    resolve(process.cwd(), '.output/public/customer-bot.js')
  ]

  for (const filePath of candidatePaths) {
    try {
      const code = await readFile(filePath, 'utf8')
      return {
        code,
        contentType: 'application/javascript; charset=utf-8',
        cacheControl: 'public, max-age=60, stale-while-revalidate=300'
      }
    } catch {}
  }

  throw new Error('customer-bot.js not found. Ensure dist/customer-bot.js is deployed.')
}

async function loadRuntimeConfig(storage: StorageRepository, tenantId: string): Promise<RuntimeConfigResponse> {
  const tenantHttp = createTenantIdentityHttpAdapter(storage)
  const tenant = await tenantHttp.tenants.get(tenantId)

  return {
    tenantId: tenant.item.id,
    status: tenant.item.status,
    brandName: tenant.item.brandName,
    themeColor: tenant.item.themeColor,
    contactPhone: tenant.item.contactPhone,
    contactEmail: tenant.item.contactEmail,
    contactAddress: tenant.item.contactAddress,
    systemPrompt: tenant.item.systemPrompt
  }
}

export function createEmbedDeliveryApplication(storage: StorageRepository) {
  return new EmbedDeliveryApplication({
    getRuntimeConfig: (tenantId: string) => loadRuntimeConfig(storage, tenantId),
    getWidgetScript: () => loadWidgetScriptCode()
  })
}
