import assert from 'node:assert/strict'
import { generateAgentDocBundle } from '../server/lib/agent-docs/generate-agent-doc-bundle.ts'
import { listAgentDocFiles, readAgentDocFile, writeAgentDocFile } from '../server/lib/agent-docs/paths.ts'

async function main() {
  await generateAgentDocBundle({
    tenantId: 'tenant-verify',
    documents: [
      {
        title: '验证资料',
        mimeType: 'text/plain',
        sourceUri: 'file://verify.txt',
        contentText: '这是验证内容。',
        metadata: {}
      }
    ],
    generatedAt: 1
  })

  const files = await listAgentDocFiles('tenant-verify')
  assert.equal(files.includes('AGENTS.md'), true)

  const before = await readAgentDocFile('tenant-verify', 'AGENTS.md')
  await writeAgentDocFile({
    tenantId: 'tenant-verify',
    fileName: 'AGENTS.md',
    content: `${before}\n\n手工补充验证。`
  })

  const after = await readAgentDocFile('tenant-verify', 'AGENTS.md')
  assert.equal(after.includes('手工补充验证。'), true)
  console.log('agent docs read/write verified')
}

void main()
