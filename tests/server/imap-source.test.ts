import { describe, expect, it } from 'vitest'
import { extractImapDocuments } from '../../server/lib/ingestion/sources/imap-source'

describe('imap source', () => {
  it('normalizes imap emails into source documents', async () => {
    const documents = await extractImapDocuments({
      host: 'imap.example.com',
      port: 993,
      secure: true,
      username: 'bot@example.com',
      password: 'secret',
      mailbox: 'INBOX',
      loadMessages: async () => [
        {
          id: 'message-1',
          subject: '报价咨询',
          from: 'buyer@example.com',
          receivedAt: 1,
          bodyText: '请提供报价。',
          attachments: [
            {
              fileName: 'requirements.txt',
              mimeType: 'text/plain',
              contentText: '数量: 100'
            }
          ]
        }
      ]
    })

    expect(documents).toHaveLength(2)
    expect(documents[0]?.title).toBe('报价咨询')
  })
})
