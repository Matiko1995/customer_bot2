import { describe, expect, it } from 'vitest'
import { executeIngestionJob } from '../../server/lib/ingestion/execute-job'
import { createInMemoryRagRepository } from '../../server/lib/repositories/rag-repository'

describe('execute ingestion job', () => {
  it('writes normalized documents and chunks for one source', async () => {
    const result = await executeIngestionJob({
      tenantId: 'tenant-1',
      dataSourceId: 'source-1',
      triggerMode: 'manual',
      repository: createInMemoryRagRepository(),
      loadDocuments: async () => [
        {
          title: 'Manual',
          mimeType: 'text/plain',
          sourceUri: 'file://manual.txt',
          contentText: 'alpha beta gamma delta',
          metadata: {}
        }
      ]
    })

    expect(result.documentCount).toBeGreaterThan(0)
    expect(result.chunkCount).toBeGreaterThan(0)
    expect(result.job.status).toBe('succeeded')
  })
})
