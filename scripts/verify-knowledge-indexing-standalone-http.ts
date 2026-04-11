import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createKnowledgeIndexingApplication } from '../services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-application.ts'
import { createKnowledgeIndexingStandaloneHandler } from '../services/knowledge-indexing-service/src/http/standalone-routes.ts'

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`http://127.0.0.1:3312${path}`, init)
  return {
    status: response.status,
    body: await response.json()
  }
}

async function main() {
  const repository = createInMemoryRagRepository()
  const application = createKnowledgeIndexingApplication(repository)
  const handler = createKnowledgeIndexingStandaloneHandler(application)

  const server = createServer((request, response) => {
    void handler(request, response)
  })

  await new Promise<void>((resolve) => server.listen(3312, '127.0.0.1', resolve))

  try {
    const health = await requestJson('/health')
    assert.equal(health.status, 200)

    const created = await requestJson('/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant-1',
        type: 'file',
        syncMode: 'manual',
        config: { notes: '报价表' }
      })
    })
    assert.equal(created.status, 200)
    const sourceId = created.body.item.id

    const listed = await requestJson('/sources?tenantId=tenant-1')
    assert.equal(listed.status, 200)
    assert.equal(listed.body.items.length, 1)

    const disabled = await requestJson(`/sources/${encodeURIComponent(sourceId)}?tenantId=tenant-1`, {
      method: 'DELETE'
    })
    assert.equal(disabled.status, 200)
    assert.equal(disabled.body.item.status, 'disabled')

    const jobs = await requestJson('/jobs?tenantId=tenant-1')
    assert.equal(jobs.status, 200)
    assert.equal(Array.isArray(jobs.body.items), true)

    const savedDoc = await requestJson(`/agent-docs/${encodeURIComponent('AGENTS.md')}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant-1',
        content: '# AGENTS\n\n独立服务写入'
      })
    })
    assert.equal(savedDoc.status, 200)

    const docs = await requestJson('/agent-docs?tenantId=tenant-1')
    assert.equal(docs.status, 200)
    assert.equal(docs.body.items.some((item: { fileName: string }) => item.fileName === 'AGENTS.md'), true)

    console.log('knowledge indexing standalone http verified')
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

void main()
