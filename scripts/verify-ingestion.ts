import assert from 'node:assert/strict'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { executeIngestionJob } from '../server/lib/ingestion/execute-job.ts'
import { parseUploadedAsset } from '../server/lib/ingestion/sources/file-source.ts'

async function main() {
  const repository = createInMemoryRagRepository()

  const documents = await parseUploadedAsset({
    tenantId: 'tenant-1',
    assetPath: 'tests/fixtures/products.csv',
    fileName: 'products.csv',
    mimeType: 'text/csv'
  })

  assert.equal(documents.length, 1)

  const result = await executeIngestionJob({
    tenantId: 'tenant-1',
    dataSourceId: 'source-1',
    triggerMode: 'manual',
    repository,
    loadDocuments: async () => documents,
    now: 1
  })

  assert.equal(result.documentCount, 1)
  assert.equal(result.chunkCount > 0, true)

  const stored = await repository.listDocumentsByTenant('tenant-1')
  assert.equal(stored.length, 1)
  console.log('ingestion pipeline verified')
}

void main()
