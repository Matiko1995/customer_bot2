import { describe, expect, it } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'
import { createTenantLoginForTenant, issueTenantPasswordReset, resetTenantPassword, verifyTenantPassword } from '../../server/lib/tenant-users'
import type { TenantRecord } from '../../types'

function createTenant(overrides: Partial<TenantRecord> = {}): TenantRecord {
  return {
    id: 'tenant-1',
    name: 'Tenant 1',
    status: 'active',
    brandName: 'Tenant 1 Bot',
    themeColor: '#118ab2',
    contactPhone: '',
    contactEmail: 'tenant1@example.com',
    contactAddress: '',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-tenant-1',
    createdAt: 1760000000000,
    updatedAt: 1760000000000,
    ...overrides
  }
}

describe('tenant user service', () => {
  it('creates an initial tenant login for a tenant', async () => {
    const store = createMemoryStore()
    const tenant = createTenant()

    const result = await createTenantLoginForTenant({
      tenant,
      storage: store,
      now: Date.UTC(2026, 2, 21, 8, 0, 0)
    })

    expect(result.user.tenantId).toBe('tenant-1')
    expect(result.user.email).toBe('tenant1@example.com')
    expect(result.user.displayName).toBe('Tenant 1 Bot')
    expect(result.user.seatRole).toBe('owner')
    expect(result.user.mustChangePassword).toBe(true)
    expect(result.initialPassword).toHaveLength(10)
    expect(await verifyTenantPassword(result.user.email, result.initialPassword, store)).toBeTruthy()
  })

  it('issues reset code and updates password with the code', async () => {
    const store = createMemoryStore()
    const tenant = createTenant()
    const created = await createTenantLoginForTenant({
      tenant,
      storage: store,
      now: Date.UTC(2026, 2, 21, 8, 0, 0)
    })

    const reset = await issueTenantPasswordReset({
      email: created.user.email,
      storage: store,
      now: Date.UTC(2026, 2, 21, 9, 0, 0)
    })

    expect(reset.code).toMatch(/^\d{6}$/)

    const updated = await resetTenantPassword({
      email: created.user.email,
      code: reset.code,
      nextPassword: 'NewPass123',
      storage: store,
      now: Date.UTC(2026, 2, 21, 9, 5, 0)
    })

    expect(updated.mustChangePassword).toBe(false)
    expect(await verifyTenantPassword(created.user.email, 'NewPass123', store)).toBeTruthy()
  })
})
