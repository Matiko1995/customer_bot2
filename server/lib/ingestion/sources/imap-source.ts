import { normalizeDocument, type NormalizedSourceDocument } from '../normalize-document.ts'

export interface ExtractedImapAttachment {
  fileName: string
  mimeType: string
  contentText?: string
}

export interface ExtractedImapMessage {
  id: string
  subject: string
  from: string
  receivedAt: number
  bodyText: string
  attachments?: ExtractedImapAttachment[]
}

export interface ExtractImapDocumentsInput {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  mailbox: string
  loadMessages?: () => Promise<ExtractedImapMessage[]>
}

async function loadMessagesFromImap(_input: ExtractImapDocumentsInput): Promise<ExtractedImapMessage[]> {
  const { importOptionalModule } = await import('../../optional-module.ts')
  const { ImapFlow } = await importOptionalModule<{ ImapFlow: new (config: Record<string, unknown>) => unknown }>(
    'imapflow',
    'npm install imapflow'
  )
  void ImapFlow
  throw new Error('Real IMAP loading is not implemented yet')
}

export async function extractImapDocuments(input: ExtractImapDocumentsInput): Promise<NormalizedSourceDocument[]> {
  const messages = input.loadMessages ? await input.loadMessages() : await loadMessagesFromImap(input)

  return messages.flatMap((message) => {
    const bodyDocument = normalizeDocument({
      externalId: message.id,
      title: message.subject.trim() || 'Untitled Email',
      mimeType: 'message/rfc822',
      sourceUri: `imap://${input.mailbox}/${message.id}`,
      contentText: message.bodyText,
      metadata: {
        parser: 'imap-basic',
        from: message.from,
        mailbox: input.mailbox,
        receivedAt: message.receivedAt
      }
    })

    const attachmentDocuments = (message.attachments ?? [])
      .filter((attachment) => attachment.contentText?.trim())
      .map((attachment, index) =>
        normalizeDocument({
          externalId: `${message.id}:attachment:${index + 1}`,
          title: `${message.subject} / ${attachment.fileName}`,
          mimeType: attachment.mimeType,
          sourceUri: `imap://${input.mailbox}/${message.id}/${attachment.fileName}`,
          contentText: attachment.contentText || '',
          metadata: {
            parser: 'imap-attachment',
            from: message.from,
            mailbox: input.mailbox,
            receivedAt: message.receivedAt
          }
        })
      )

    return [bodyDocument, ...attachmentDocuments]
  })
}
