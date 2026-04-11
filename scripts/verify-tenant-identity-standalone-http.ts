import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-tenant-identity-application.ts'
import { createTenantIdentityStandaloneHandler } from '../services/tenant-identity-service/src/http/standalone-routes.ts'

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`http://127.0.0.1:3311${path}`, init)
  return {
    status: response.status,
    body: await response.json()
  }
}

async function main() {
  const storage = createMemoryStore()
  const application = createTenantIdentityApplication(storage)
  const handler = createTenantIdentityStandaloneHandler(application)

  const server = createServer((request, response) => {
    void handler(request, response)
  })

  await new Promise<void>((resolve) => server.listen(3311, '127.0.0.1', resolve))

  try {
    const health = await requestJson('/health')
    assert.equal(health.status, 200)

    const login = await requestJson('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123456'
      })
    })
    assert.equal(login.status, 200)

    const created = await requestJson('/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Standalone Tenant',
        contactEmail: 'standalone@example.com'
      })
    })
    assert.equal(created.status, 200)
    const tenantId = created.body.item.id

    const listed = await requestJson('/tenants')
    assert.equal(listed.status, 200)
    assert.equal(listed.body.items.length, 1)

    const loaded = await requestJson(`/tenants/${encodeURIComponent(tenantId)}`)
    assert.equal(loaded.status, 200)
    assert.equal(loaded.body.item.id, tenantId)

    console.log('tenant identity standalone http verified')
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

void main()
