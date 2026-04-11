import { describe, expect, it } from 'vitest'
import { extractWebsiteDocuments } from '../../server/lib/ingestion/sources/webpage-source'

describe('webpage source', () => {
  it('filters crawled pages by allowed domain', async () => {
    const documents = await extractWebsiteDocuments({
      startUrl: 'https://example.com/docs',
      allowedDomains: ['example.com'],
      maxPages: 1,
      fetcher: async () => ({
        ok: true,
        text: async () => '<html><head><title>Docs</title></head><body><h1>API Guide</h1></body></html>'
      })
    })

    expect(documents).toHaveLength(1)
    expect(documents[0]?.title).toBe('Docs')
  })
})
