import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createServer } from 'node:http'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-tenant-identity-application.ts'
import { createTenantIdentityStandaloneHandler } from '../services/tenant-identity-service/src/http/standalone-routes.ts'
import { createKnowledgeIndexingApplication } from '../services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-application.ts'
import { createKnowledgeIndexingStandaloneHandler } from '../services/knowledge-indexing-service/src/http/standalone-routes.ts'
import { createAgentRuntimeApplication } from '../services/agent-runtime-service/src/infrastructure/create-agent-runtime-application.ts'
import { createAgentRuntimeStandaloneHandler } from '../services/agent-runtime-service/src/http/standalone-routes.ts'
import { createEmbedDeliveryApplication } from '../services/embed-delivery-service/src/infrastructure/create-embed-delivery-application.ts'
import { createEmbedDeliveryStandaloneHandler } from '../services/embed-delivery-service/src/http/standalone-routes.ts'
import { createTenantIdentityGateway } from '../server/lib/service-gateways/tenant-identity.ts'
import { createKnowledgeIndexingGateway } from '../server/lib/service-gateways/knowledge-indexing.ts'
import { createAgentRuntimeGateway } from '../server/lib/service-gateways/agent-runtime.ts'
import { createEmbedDeliveryGateway } from '../server/lib/service-gateways/embed-delivery.ts'

async function ensureWidgetScriptFixture() {
  const path = 'dist/customer-bot.js'
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, 'window.CustomerBot = { init() {} }', 'utf8')
}

async function listen(server, port) {
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}

async function main() {
  const storage = createMemoryStore()
  const ragRepository = createInMemoryRagRepository()
  await ensureWidgetScriptFixture()

  const tenantServer = createServer(createTenantIdentityStandaloneHandler(createTenantIdentityApplication(storage)))
  const indexingServer = createServer(createKnowledgeIndexingStandaloneHandler(createKnowledgeIndexingApplication(ragRepository)))
  const runtimeServer = createServer(createAgentRuntimeStandaloneHandler(createAgentRuntimeApplication({ storage, ragRepository })))
  const embedServer = createServer(createEmbedDeliveryStandaloneHandler(createEmbedDeliveryApplication(storage)))

  await Promise.all([
    listen(tenantServer, 3411),
    listen(indexingServer, 3412),
    listen(runtimeServer, 3413),
    listen(embedServer, 3414)
  ])

  try {
    const tenantGateway = createTenantIdentityGateway({
      storage,
      baseUrl: 'http://127.0.0.1:3411'
    })
    const indexingGateway = createKnowledgeIndexingGateway({
      repository: ragRepository,
      baseUrl: 'http://127.0.0.1:3412'
    })
    const agentGateway = createAgentRuntimeGateway({
      storage,
      ragRepository,
      baseUrl: 'http://127.0.0.1:3413'
    })
    const embedGateway = createEmbedDeliveryGateway({
      storage,
      baseUrl: 'http://127.0.0.1:3414'
    })

    const login = await tenantGateway.adminLogin({
      email: 'admin@example.com',
      password: 'admin123456'
    })
    assert.equal(login.ok, true)

    const created = await tenantGateway.createTenant({
      name: 'Remote Tenant',
      contactEmail: 'remote@example.com'
    })
    assert.equal(created.ok, true)

    const sources = await indexingGateway.createSource({
      tenantId: created.item.id,
      type: 'file',
      syncMode: 'manual',
      config: { notes: '报价表' }
    })
    assert.equal(sources.ok, true)

    const chat = await agentGateway.chat({
      tenantId: created.item.id,
      message: '你们适合哪些行业？'
    })
    assert.equal(typeof chat.sessionId, 'string')

    const contact = await agentGateway.contact({
      tenantId: created.item.id,
      sessionId: chat.sessionId,
      name: 'Alice',
      company: 'ACME',
      demandType: 'demo',
      contact: 'alice@example.com',
      message: '请联系我'
    })
    assert.equal(contact.ok, true)

    const runtimeConfig = await embedGateway.runtimeConfig(created.item.id)
    assert.equal(runtimeConfig.brandName, created.item.brandName)

    const widget = await embedGateway.widgetScript()
    assert.equal(widget.code.includes('CustomerBot'), true)

    console.log('remote stack http verified')
  } finally {
    await Promise.all([
      close(tenantServer),
      close(indexingServer),
      close(runtimeServer),
      close(embedServer)
    ])
  }
}

void main()
