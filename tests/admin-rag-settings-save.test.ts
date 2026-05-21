import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('admin RAG settings save flow', () => {
  it('offers an independent answer template save action', () => {
    const panelSource = readFileSync('components/admin/tenant-workspace/RagSettingsPanel.vue', 'utf8')
    const pageSource = readFileSync('pages/admin/tenants/[tenantId].vue', 'utf8')

    expect(panelSource).toContain('保存回答模板')
    expect(panelSource).toContain('save: []')
    expect(pageSource).toContain('@save="saveRagSettings"')
  })

  it('saves answer templates without parsing content JSON drafts', () => {
    const pageSource = readFileSync('pages/admin/tenants/[tenantId].vue', 'utf8')
    const functionStart = pageSource.indexOf('async function saveRagSettings')
    const functionEnd = pageSource.indexOf('async function saveTenant')
    const saveRagSettingsSource = pageSource.slice(functionStart, functionEnd)

    expect(functionStart).toBeGreaterThanOrEqual(0)
    expect(functionEnd).toBeGreaterThan(functionStart)
    expect(saveRagSettingsSource).toContain('ragSettings: normalizeTenantRagSettings(form.ragSettings)')
    expect(saveRagSettingsSource).not.toContain('parseContentDraft')
    expect(saveRagSettingsSource).not.toContain('contentConfig')
  })
})
