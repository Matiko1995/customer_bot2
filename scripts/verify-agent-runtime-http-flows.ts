import assert from 'node:assert/strict'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createAgentRuntimeHttpAdapter } from '../services/agent-runtime-service/src/infrastructure/create-agent-runtime-http-adapter.ts'

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

  const http = createAgentRuntimeHttpAdapter({
    storage,
    ragRepository
  })

  const chat = await http.chat.execute({
    tenantId: 'tenant-1',
    message: '你们适合哪些行业？'
  })
  assert.equal(chat.sessionId.length > 0, true)
  assert.equal(chat.answerSource === 'general_fallback' || chat.answerSource === 'structured' || chat.answerSource === 'rag', true)

  const contact = await http.contact.execute({
    tenantId: 'tenant-1',
    sessionId: chat.sessionId,
    name: 'Alice',
    company: 'ACME',
    demandType: 'demo',
    contact: 'alice@example.com',
    message: '请联系我'
  })
  assert.equal(contact.ok, true)
  assert.equal(contact.id.startsWith('lead-'), true)

  console.log('agent runtime http layer verified')
}

void main()
