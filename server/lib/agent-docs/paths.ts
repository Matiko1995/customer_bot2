import { basename, join } from 'node:path'
import { getObjectStorageProvider, type ObjectStorageProvider } from '../object-storage/object-storage.ts'

export const AGENT_DOC_FILE_NAMES = ['AGENTS.md', 'BOOTSTRAP.md', 'HEARTBEAT.md', 'IDENTITY.md', 'SOUL.md', 'USER.md', 'TOOLS.md'] as const

function ensureAllowedFileName(fileName: string): (typeof AGENT_DOC_FILE_NAMES)[number] {
  const normalized = basename(fileName)
  if ((AGENT_DOC_FILE_NAMES as readonly string[]).includes(normalized)) {
    return normalized as (typeof AGENT_DOC_FILE_NAMES)[number]
  }

  throw new Error('Unsupported agent doc file name')
}

export function getAgentDocDirectory(tenantId: string): string {
  return join('agent-docs', tenantId, 'latest').replace(/\\/g, '/')
}

export async function listAgentDocFiles(
  tenantId: string,
  provider: ObjectStorageProvider = getObjectStorageProvider()
): Promise<string[]> {
  const directory = getAgentDocDirectory(tenantId)
  try {
    const files = await provider.list(directory)
    return files
      .map((fileName) => basename(fileName))
      .filter((fileName) => (AGENT_DOC_FILE_NAMES as readonly string[]).includes(fileName))
      .sort()
  } catch {
    return []
  }
}

export async function readAgentDocFile(
  tenantId: string,
  fileName: string,
  provider: ObjectStorageProvider = getObjectStorageProvider()
): Promise<string> {
  const allowedFileName = ensureAllowedFileName(fileName)
  return provider.readText(join(getAgentDocDirectory(tenantId), allowedFileName).replace(/\\/g, '/'))
}

export async function writeAgentDocFile(input: {
  tenantId: string
  fileName: string
  content: string
}, provider: ObjectStorageProvider = getObjectStorageProvider()): Promise<void> {
  const allowedFileName = ensureAllowedFileName(input.fileName)
  await provider.writeText({
    key: join(getAgentDocDirectory(input.tenantId), allowedFileName).replace(/\\/g, '/'),
    content: input.content
  })
}
