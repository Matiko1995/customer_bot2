import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const adminUiFiles = [
  'components/admin/AdminShell.vue',
  'lib/admin-navigation.ts',
  'pages/admin/index.vue',
  'pages/admin/tenants/index.vue',
  'pages/admin/tenants/[tenantId].vue',
  'pages/admin/chats.vue',
  'pages/admin/leads.vue',
  'pages/admin/billing.vue',
  'pages/admin/login.vue',
  'components/admin/tenant-workspace/AgentDocsPanel.vue',
  'components/admin/tenant-workspace/IndexHealthPanel.vue',
  'components/admin/tenant-workspace/RagSettingsPanel.vue',
  'components/admin/tenant-workspace/SourceLibraryPanel.vue',
  'components/admin/tenant-workspace/SyncJobsPanel.vue'
]

const forbiddenVisibleEnglish = [
  'AI Factory Ops',
  'Admin Access',
  'Awaiting Tenant',
  'Billing Console',
  'Billing Ops',
  'Conversation Trace',
  'Create Tenant',
  'Export Global Report',
  'Global Monitor',
  'Knowledge Hits',
  'Knowledge Ops',
  'Lead Center',
  'Lead Ops',
  'Live Command',
  'Operator Actions',
  'Plan Summary',
  'Platform Control Center',
  'Realtime Ops',
  'Running Tenants',
  'System Admin',
  'System Normal',
  'System Status',
  'Tenant Active',
  'Tenant Console',
  'Tenant Control',
  'Tenant Disabled',
  'Tenant ID',
  'Tenant Login',
  'Tenant Queue',
  'Tenant Scoped',
  'Trace Monitor',
  'Tenant Workspace',
  'Agent 文档',
  'App Password',
  'Chunk 数量',
  'Cron',
  'Embed Key',
  'IMAP Host',
  'IMAP Port',
  'Node Health',
  'RAG 检索',
  'RAG 资料源',
  'source='
]

describe('admin localization', () => {
  it('does not expose English operation labels in admin UI copy', () => {
    const source = adminUiFiles.map((file) => extractVisibleCopy(file, readFileSync(file, 'utf8'))).join('\n')

    for (const text of forbiddenVisibleEnglish) {
      expect(source, `Found visible English copy: ${text}`).not.toContain(text)
    }
  })
})

function extractVisibleCopy(file: string, source: string) {
  if (file.endsWith('.ts')) {
    return source
  }

  const start = source.indexOf('<template>')
  const end = source.lastIndexOf('</template>')
  if (start === -1 || end === -1 || end <= start) {
    return ''
  }

  return source
    .slice(start + '<template>'.length, end)
    .replace(/\s(?:v-[\w:.-]+|[@:][\w:.-]+)="[^"]*"/g, '')
}
