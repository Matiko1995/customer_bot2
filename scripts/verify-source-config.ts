import assert from 'node:assert/strict'
import { buildSourceConfigFromDraft, createDefaultSourceDraft, describeSourceConfig } from '../lib/source-config.ts'

function main() {
  const webpageDraft = {
    ...createDefaultSourceDraft(),
    type: 'webpage' as const,
    webpageStartUrl: 'https://example.com/docs',
    webpageAllowedDomains: 'example.com, docs.example.com',
    webpageMaxPages: 12
  }
  const webpageConfig = buildSourceConfigFromDraft(webpageDraft)
  assert.deepEqual(webpageConfig, {
    startUrl: 'https://example.com/docs',
    allowedDomains: ['example.com', 'docs.example.com'],
    maxPages: 12
  })

  const imapDraft = {
    ...createDefaultSourceDraft(),
    type: 'imap' as const,
    imapHost: 'imap.example.com',
    imapPort: 993,
    imapUsername: 'bot@example.com',
    imapPassword: 'secret',
    imapMailbox: 'INBOX.Support'
  }
  const imapConfig = buildSourceConfigFromDraft(imapDraft)
  assert.equal(imapConfig.host, 'imap.example.com')
  assert.equal(imapConfig.mailbox, 'INBOX.Support')

  const fileSummary = describeSourceConfig({
    type: 'file',
    config: {
      fileName: 'products.csv',
      relativePath: '.data/source-assets/tenant-1/products.csv',
      notes: '报价表'
    }
  })
  assert.equal(fileSummary.some((item) => item.includes('products.csv')), true)
  console.log('source config helpers verified')
}

main()
