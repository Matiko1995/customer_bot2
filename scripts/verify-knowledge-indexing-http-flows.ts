import assert from 'node:assert/strict'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createKnowledgeIndexingHttpAdapter } from '../services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-http-adapter.ts'

async function main() {
  const repository = createInMemoryRagRepository()
  const http = createKnowledgeIndexingHttpAdapter(repository)

  const created = await http.sources.create({
    tenantId: 'tenant-1',
    type: 'file',
    syncMode: 'manual',
    config: { notes: '报价表' }
  })
  assert.equal(created.ok, true)

  const listed = await http.sources.list('tenant-1')
  assert.equal(listed.items.length, 1)

  const disabled = await http.sources.disable({
    tenantId: 'tenant-1',
    sourceId: created.item.id
  })
  assert.equal(disabled.item.status, 'disabled')

  const jobs = await http.jobs.list('tenant-1')
  assert.equal(Array.isArray(jobs.items), true)

  const docsBefore = await http.agentDocs.list('tenant-1')
  assert.equal(Array.isArray(docsBefore.items), true)

  await http.agentDocs.save({
    tenantId: 'tenant-1',
    fileName: 'AGENTS.md',
    content: '# AGENTS\n\n手工编辑内容'
  })

  const docsAfter = await http.agentDocs.list('tenant-1')
  assert.equal(docsAfter.items.some((item) => item.fileName === 'AGENTS.md'), true)

  console.log('knowledge indexing http layer verified')
}

void main()
