import assert from 'node:assert/strict'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createTenantIdentityGateway } from '../server/lib/service-gateways/tenant-identity.ts'
import { createEmbedDeliveryGateway } from '../server/lib/service-gateways/embed-delivery.ts'

async function main() {
  const storage = createMemoryStore()
  const requests: Array<{ url: string; method: string }> = []

  const fetcher: typeof fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({
      url: String(input),
      method: init?.method || 'GET'
    })

    if (String(input).includes('/admin/login')) {
      return {
        ok: true,
        json: async () => ({ ok: true })
      } as Response
    }

    if (String(input).includes('/embed/runtime-config')) {
      return {
        ok: true,
        json: async () => ({
          tenantId: 'tenant-1',
          status: 'active',
          brandName: 'Remote Tenant',
          themeColor: '#118ab2',
          contactPhone: '13800000000',
          contactEmail: 'tenant@example.com',
          contactAddress: 'Shanghai',
          systemPrompt: 'remote prompt'
        })
      } as Response
    }

    throw new Error(`Unexpected remote request: ${String(input)}`)
  }) as typeof fetch

  const tenantGateway = createTenantIdentityGateway({
    storage,
    baseUrl: 'http://tenant-service.local',
    fetcher
  })
  const embedGateway = createEmbedDeliveryGateway({
    storage,
    baseUrl: 'http://embed-service.local',
    fetcher
  })

  const adminLogin = await tenantGateway.adminLogin({
    email: 'admin@example.com',
    password: 'admin123456'
  })
  assert.equal(adminLogin.ok, true)

  const runtimeConfig = await embedGateway.runtimeConfig('tenant-1')
  assert.equal(runtimeConfig.brandName, 'Remote Tenant')

  assert.equal(requests.some((item) => item.url === 'http://tenant-service.local/admin/login' && item.method === 'POST'), true)
  assert.equal(requests.some((item) => item.url === 'http://embed-service.local/embed/runtime-config?tenantId=tenant-1' && item.method === 'GET'), true)
  console.log('remote gateways verified')
}

void main()
