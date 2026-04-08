import { describe, expect, it } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'
import { getRuntimeConfigForTenant, TenantNotFoundError } from '../../server/lib/tenants'

describe('tenant runtime config', () => {
  it('returns active tenant widget config', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await getRuntimeConfigForTenant('tenant-1', store)

    expect(result).toEqual({
      tenantId: 'tenant-1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.'
    })
  })

  it('rejects missing tenants', async () => {
    const store = createMemoryStore()

    await expect(getRuntimeConfigForTenant('missing-tenant', store)).rejects.toBeInstanceOf(TenantNotFoundError)
  })

  it('supports embed key as tenant identifier', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await getRuntimeConfigForTenant('embed-tenant-1', store)
    expect(result.tenantId).toBe('tenant-1')
  })
})
