import { describe, expect, it } from 'vitest'
import { createInMemoryRagRepository } from '../../server/lib/repositories/rag-repository'

describe('rag repository contract', () => {
  it('stores documents and returns them scoped by tenant', async () => {
    const repository = createInMemoryRagRepository()

    await repository.saveDocument({
      id: 'doc-1',
      tenantId: 'tenant-1',
      dataSourceId: 'source-1',
      externalId: 'external-1',
      title: 'Manual',
      mimeType: 'text/plain',
      sourceUri: 'file://manual.txt',
      contentText: 'alpha beta',
      metadata: {},
      contentHash: 'hash-1',
      versionHash: 'version-1',
      createdAt: 1,
      updatedAt: 1
    })

    expect(await repository.listDocumentsByTenant('tenant-1')).toHaveLength(1)
    expect(await repository.listDocumentsByTenant('tenant-2')).toHaveLength(0)
  })
})
