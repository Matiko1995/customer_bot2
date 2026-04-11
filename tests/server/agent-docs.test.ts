import { describe, expect, it } from 'vitest'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateAgentDocBundle } from '../../server/lib/agent-docs/generate-agent-doc-bundle'

describe('agent docs bundle', () => {
  it('writes the required agent markdown files and preserves custom sections', async () => {
    const outputRoot = '.data/test-agent-docs/tenant-1/latest'
    const result = await generateAgentDocBundle({
      tenantId: 'tenant-1',
      documents: [
        {
          title: '部署手册',
          mimeType: 'text/plain',
          sourceUri: 'file://deploy.txt',
          contentText: '第一步连接数据库。',
          metadata: {}
        }
      ],
      outputRoot,
      generatedAt: 1
    })

    expect(result.files).toEqual([
      'AGENTS.md',
      'BOOTSTRAP.md',
      'HEARTBEAT.md',
      'IDENTITY.md',
      'SOUL.md',
      'USER.md',
      'TOOLS.md'
    ])

    const agentsPath = join(outputRoot, 'AGENTS.md')
    const original = await readFile(agentsPath, 'utf8')
    const customStart = '<!-- CUSTOM:START -->'
    const customEnd = '<!-- CUSTOM:END -->'
    const startIndex = original.indexOf(customStart)
    const endIndex = original.indexOf(customEnd)

    const customized = `${original.slice(0, startIndex + customStart.length)}\nmanual-custom-note\n${original.slice(endIndex)}`
    await writeFile(agentsPath, customized, 'utf8')

    await generateAgentDocBundle({
      tenantId: 'tenant-1',
      documents: [
        {
          title: '新的资料',
          mimeType: 'text/plain',
          sourceUri: 'file://new.txt',
          contentText: '更新后的资料内容。',
          metadata: {}
        }
      ],
      outputRoot,
      generatedAt: 2
    })

    const regenerated = await readFile(agentsPath, 'utf8')
    expect(regenerated.includes('manual-custom-note')).toBe(true)
    expect(regenerated.includes('新的资料')).toBe(true)
  })
})
