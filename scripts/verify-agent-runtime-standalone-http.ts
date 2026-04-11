import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createAgentRuntimeApplication } from '../services/agent-runtime-service/src/infrastructure/create-agent-runtime-application.ts'
import { createAgentRuntimeStandaloneHandler } from '../services/agent-runtime-service/src/http/standalone-routes.ts'

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`http://127.0.0.1:3313${path}`, init)
  return {
    status: response.status,
    body: await response.json()
  }
}

async function main() {
  const storage = createMemoryStore()
  const ragRepository = createInMemoryRagRepository()

  await storage.saveTenant({
    id: 'tenant-1',
    name: 'Tenant 1',
    status: 'active',
    brandName: 'Tenant Bot',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'tenant@example.com',
    contactAddress: 'Shanghai',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-tenant-1',
    createdAt: 1,
    updatedAt: 1
  })

  const application = createAgentRuntimeApplication({
    storage,
    ragRepository
  })
  const handler = createAgentRuntimeStandaloneHandler(application)
  const server = createServer((request, response) => {
    void handler(request, response)
  })

  await new Promise<void>((resolve) => server.listen(3313, '127.0.0.1', resolve))

  try {
    const health = await requestJson('/health')
    assert.equal(health.status, 200)

    const chat = await requestJson('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant-1',
        message: '你们适合哪些行业？'
      })
    })
    assert.equal(chat.status, 200)
    assert.equal(typeof chat.body.sessionId, 'string')

    const contact = await requestJson('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant-1',
        sessionId: chat.body.sessionId,
        name: 'Alice',
        company: 'ACME',
        demandType: 'demo',
        contact: 'alice@example.com',
        message: '请联系我'
      })
    })
    assert.equal(contact.status, 200)
    assert.equal(contact.body.ok, true)

    console.log('agent runtime standalone http verified')
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

void main()
