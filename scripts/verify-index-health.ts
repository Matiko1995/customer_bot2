import assert from 'node:assert/strict'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createKnowledgeIndexingHttpAdapter } from '../services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-http-adapter.ts'

async function main() {
  const repository = createInMemoryRagRepository()
  const http = createKnowledgeIndexingHttpAdapter(repository)

  const sourceA = await http.sources.create({
    tenantId: 'tenant-index-health',
    type: 'file',
    syncMode: 'manual',
    config: {}
  })

  const sourceB = await http.sources.create({
    tenantId: 'tenant-index-health',
    type: 'file',
    syncMode: 'manual',
    config: {}
  })

  await http.sources.upload({
    tenantId: 'tenant-index-health',
    sourceId: sourceA.item.id,
    fileName: 'fastener-standards.txt',
    mimeType: 'text/plain',
    base64Data: Buffer.from('DIN 933 六角螺栓，材质 304，不锈钢，规格 M8x30。', 'utf8').toString('base64')
  })

  await http.sources.upload({
    tenantId: 'tenant-index-health',
    sourceId: sourceB.item.id,
    fileName: 'fastener-materials.txt',
    mimeType: 'text/plain',
    base64Data: Buffer.from('316 不锈钢适用于耐腐蚀环境，常见于海工和化工场景。', 'utf8').toString('base64')
  })

  const before = await http.jobs.stats('tenant-index-health')
  assert.equal(before.documentCount, 0)
  assert.equal(before.chunkCount, 0)

  const reindexed = await http.jobs.reindexAll({
    tenantId: 'tenant-index-health'
  })

  assert.equal(reindexed.ok, true)
  assert.equal(reindexed.triggeredSourceCount, 2)
  assert.equal(reindexed.successCount, 2)
  assert.equal(reindexed.failureCount, 0)
  assert.equal(reindexed.jobs.some((item) => item.dataSourceId === sourceA.item.id), true)
  assert.equal(reindexed.jobs.some((item) => item.dataSourceId === sourceB.item.id), true)

  const after = await http.jobs.stats('tenant-index-health')
  assert.equal(after.documentCount >= 2, true)
  assert.equal(after.chunkCount >= 2, true)
  assert.equal(typeof after.lastSuccessfulSyncAt, 'number')

  console.log('index health verified')
}

void main()
