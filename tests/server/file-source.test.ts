import { describe, expect, it } from 'vitest'
import { parseUploadedAsset } from '../../server/lib/ingestion/sources/file-source'

describe('file source parser', () => {
  it('turns a csv asset into normalized documents', async () => {
    const documents = await parseUploadedAsset({
      tenantId: 'tenant-1',
      assetPath: 'tests/fixtures/products.csv',
      fileName: 'products.csv',
      mimeType: 'text/csv'
    })

    expect(documents[0]?.title).toContain('products')
    expect(documents[0]?.contentText).toContain('SKU')
  })
})
