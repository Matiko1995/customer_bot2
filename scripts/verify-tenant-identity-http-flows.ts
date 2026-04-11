import assert from 'node:assert/strict'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-tenant-identity-application.ts'
import { createTenantIdentityHttpLayer } from '../services/tenant-identity-service/src/http/routes.ts'

async function main() {
  const storage = createMemoryStore()
  const application = createTenantIdentityApplication(storage)
  const http = createTenantIdentityHttpLayer(application)

  const login = http.adminAuth.login({
    email: 'admin@example.com',
    password: 'admin123456'
  })
  assert.equal(login.ok, true)

  const created = await http.tenants.create({
    name: 'Tenant HTTP',
    contactEmail: 'tenant-http@example.com'
  })
  assert.equal(created.ok, true)

  const listed = await http.tenants.list()
  assert.equal(listed.items.length, 1)

  const tenantLogin = await http.tenantUsers.login({
    email: created.tenantLogin.email,
    password: created.tenantLogin.initialPassword
  })
  assert.equal(tenantLogin.user.tenantId, created.item.id)

  const me = await http.tenantUsers.me({
    tenantUserId: tenantLogin.user.tenantUserId,
    tenantId: created.item.id
  })
  assert.equal(me.tenant.id, created.item.id)

  console.log('tenant identity http layer verified')
}

void main()
