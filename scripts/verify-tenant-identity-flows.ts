import assert from 'node:assert/strict'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-tenant-identity-application.ts'

async function main() {
  const storage = createMemoryStore()
  const app = createTenantIdentityApplication(storage)

  const adminLogin = app.adminLogin({
    email: 'admin@example.com',
    password: 'admin123456'
  })
  assert.equal(adminLogin.ok, true)

  const created = await app.createTenant({
    name: 'Tenant A',
    brandName: 'Tenant A Bot',
    contactEmail: 'tenant-a@example.com'
  })
  assert.equal(created.ok, true)
  assert.equal(created.item.name, 'Tenant A')
  assert.equal(created.tenantLogin.email, 'tenant-a@example.com')

  const listed = await app.listTenants()
  assert.equal(listed.items.length, 1)

  const loaded = await app.getTenant(created.item.id)
  assert.equal(loaded.item.brandName, 'Tenant A Bot')
  assert.equal(loaded.tenantUsers.length, 1)

  const updated = await app.updateTenant(created.item.id, {
    brandName: 'Tenant A Bot Updated',
    themeColor: '#000000'
  })
  assert.equal(updated.item.brandName, 'Tenant A Bot Updated')

  const tenantLogin = await app.tenantUserLogin({
    email: created.tenantLogin.email,
    password: created.tenantLogin.initialPassword
  })
  assert.equal(tenantLogin.ok, true)
  assert.equal(tenantLogin.user.tenantId, created.item.id)

  const tenantMe = await app.getTenantMe({
    tenantUserId: tenantLogin.user.tenantUserId,
    tenantId: created.item.id
  })
  assert.equal(tenantMe.user.email, created.tenantLogin.email)
  assert.equal(tenantMe.tenant.id, created.item.id)

  const deleted = await app.deleteTenant(created.item.id)
  assert.equal(deleted.ok, true)
  const hiddenList = await app.listTenants()
  assert.equal(hiddenList.items.length, 0)
  const allList = await app.listTenants({ includeDeleted: true })
  assert.equal(allList.items.length, 1)

  const restored = await app.restoreTenant(created.item.id)
  assert.equal(restored.ok, true)
  const restoredList = await app.listTenants()
  assert.equal(restoredList.items.length, 1)

  console.log('tenant identity flows verified')
}

void main()
