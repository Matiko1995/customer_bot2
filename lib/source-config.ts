import type { DataSourceRecord } from '../types'

export interface SourceDraftState {
  type: DataSourceRecord['type']
  syncMode: DataSourceRecord['syncMode']
  scheduleCron: string
  webpageStartUrl: string
  webpageAllowedDomains: string
  webpageMaxPages: number
  imapHost: string
  imapPort: number
  imapSecure: boolean
  imapUsername: string
  imapPassword: string
  imapMailbox: string
  fileNotes: string
}

export function createDefaultSourceDraft(): SourceDraftState {
  return {
    type: 'file',
    syncMode: 'manual',
    scheduleCron: '',
    webpageStartUrl: '',
    webpageAllowedDomains: '',
    webpageMaxPages: 20,
    imapHost: '',
    imapPort: 993,
    imapSecure: true,
    imapUsername: '',
    imapPassword: '',
    imapMailbox: 'INBOX',
    fileNotes: ''
  }
}

function parseCommaList(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildSourceConfigFromDraft(draft: SourceDraftState): Record<string, unknown> {
  if (draft.type === 'webpage') {
    return {
      startUrl: draft.webpageStartUrl.trim(),
      allowedDomains: parseCommaList(draft.webpageAllowedDomains),
      maxPages: Math.max(1, Math.floor(Number(draft.webpageMaxPages) || 1))
    }
  }

  if (draft.type === 'imap') {
    return {
      host: draft.imapHost.trim(),
      port: Math.max(1, Math.floor(Number(draft.imapPort) || 993)),
      secure: draft.imapSecure,
      username: draft.imapUsername.trim(),
      password: draft.imapPassword,
      mailbox: draft.imapMailbox.trim() || 'INBOX'
    }
  }

  return {
    notes: draft.fileNotes.trim()
  }
}

export function describeSourceConfig(source: Pick<DataSourceRecord, 'type' | 'config'>): string[] {
  if (source.type === 'webpage') {
    return [
      `起始地址：${String(source.config.startUrl || '-')}`,
      `允许域名：${Array.isArray(source.config.allowedDomains) ? source.config.allowedDomains.join(', ') : '-'}`,
      `页面上限：${String(source.config.maxPages || '-')}`
    ]
  }

  if (source.type === 'imap') {
    return [
      `主机：${String(source.config.host || '-')}`,
      `端口：${String(source.config.port || '-')}`,
      `账号：${String(source.config.username || '-')}`,
      `邮箱文件夹：${String(source.config.mailbox || '-')}`
    ]
  }

  return [
    `文件名：${String(source.config.fileName || '-')}`,
    `资产路径：${String(source.config.relativePath || source.config.assetPath || '-')}`,
    `备注：${String(source.config.notes || '-')}`
  ]
}
