import { describe, expect, it } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'

describe('memory store', () => {
  it('creates and returns tenants by id', async () => {
    const store = createMemoryStore()

    const inputTenant = {
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
      billingSubscription: {
        planId: 'plan-basic',
        startedAt: 1760000000000,
        notes: 'manual assignment'
      },
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    }

    await store.saveTenant(inputTenant)

    const tenant = await store.getTenantById('tenant-1')
    expect(tenant).toEqual(inputTenant)

    if (!tenant) {
      throw new Error('tenant should exist')
    }

    tenant.name = 'Mutated Tenant Name'
    const storedTenant = await store.getTenantById('tenant-1')
    expect(storedTenant?.name).toBe('Tenant 1')
  })

  it('returns tenants by embed key', async () => {
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
      billingSubscription: {
        planId: 'plan-basic',
        startedAt: 1760000000000,
        notes: ''
      },
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const tenant = await store.getTenantByEmbedKey('embed-tenant-1')
    expect(tenant?.id).toBe('tenant-1')
    expect(tenant?.billingSubscription?.planId).toBe('plan-basic')
  })

  it('stores tenant login accounts and reset codes', async () => {
    const store = createMemoryStore()

    await store.saveTenantUser({
      id: 'tenant-user-1',
      tenantId: 'tenant-1',
      email: 'tenant1@example.com',
      passwordHash: 'hash-1',
      temporaryPassword: 'Temp123456',
      mustChangePassword: true,
      status: 'active',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    await store.saveTenantPasswordReset({
      id: 'reset-1',
      tenantUserId: 'tenant-user-1',
      tenantId: 'tenant-1',
      email: 'tenant1@example.com',
      code: '123456',
      expiresAt: 1760003600000,
      usedAt: 0,
      createdAt: 1760000000000
    })

    const tenantUser = await store.getTenantUserByEmail('tenant1@example.com')
    const tenantUsers = await store.listTenantUsersByTenant('tenant-1')
    const reset = await store.getTenantPasswordResetByCode('tenant1@example.com', '123456')

    expect(tenantUser?.tenantId).toBe('tenant-1')
    expect(tenantUser?.temporaryPassword).toBe('Temp123456')
    expect(tenantUsers).toHaveLength(1)
    expect(reset?.tenantUserId).toBe('tenant-user-1')
  })

  it('keeps soft-deleted tenant in storage records', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-deleted',
      name: 'Tenant Deleted',
      status: 'disabled',
      brandName: 'Tenant Deleted Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant-deleted@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-deleted',
      deletedAt: 1760000001000,
      createdAt: 1760000000000,
      updatedAt: 1760000001000
    })

    const tenants = await store.listTenants()
    expect(tenants).toHaveLength(1)
    expect(tenants[0]?.deletedAt).toBe(1760000001000)
    expect(tenants[0]?.status).toBe('disabled')
  })
})
