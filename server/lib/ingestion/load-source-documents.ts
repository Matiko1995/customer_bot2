import type { DataSourceRecord } from '../../../types'
import type { SourceDocumentLoader } from './types.ts'
import { parseUploadedAsset } from './sources/file-source.ts'
import { extractWebsiteDocuments } from './sources/webpage-source.ts'
import { extractImapDocuments } from './sources/imap-source.ts'

function readStringConfig(config: Record<string, unknown>, key: string): string {
  const value = config[key]
  return typeof value === 'string' ? value.trim() : ''
}

function readStringArrayConfig(config: Record<string, unknown>, key: string): string[] {
  const value = config[key]
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []
}

function readNumberConfig(config: Record<string, unknown>, key: string, fallback: number): number {
  const value = config[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function createSourceDocumentLoader(source: DataSourceRecord): SourceDocumentLoader {
  if (source.type === 'file') {
    return () =>
      parseUploadedAsset({
        tenantId: source.tenantId,
        assetPath: readStringConfig(source.config, 'assetPath'),
        fileName: readStringConfig(source.config, 'fileName'),
        mimeType: readStringConfig(source.config, 'mimeType')
      })
  }

  if (source.type === 'webpage') {
    return () =>
      extractWebsiteDocuments({
        startUrl: readStringConfig(source.config, 'startUrl'),
        allowedDomains: readStringArrayConfig(source.config, 'allowedDomains'),
        maxPages: readNumberConfig(source.config, 'maxPages', 1)
      })
  }

  return () =>
    extractImapDocuments({
      host: readStringConfig(source.config, 'host'),
      port: readNumberConfig(source.config, 'port', 993),
      secure: source.config.secure !== false,
      username: readStringConfig(source.config, 'username'),
      password: readStringConfig(source.config, 'password'),
      mailbox: readStringConfig(source.config, 'mailbox') || 'INBOX'
    })
}
