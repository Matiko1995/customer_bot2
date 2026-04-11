import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

export const AGENT_DOC_FILE_NAMES = ['AGENTS.md', 'BOOTSTRAP.md', 'HEARTBEAT.md', 'IDENTITY.md', 'SOUL.md', 'USER.md', 'TOOLS.md'] as const

function ensureAllowedFileName(fileName: string): (typeof AGENT_DOC_FILE_NAMES)[number] {
  const normalized = basename(fileName)
  if ((AGENT_DOC_FILE_NAMES as readonly string[]).includes(normalized)) {
    return normalized as (typeof AGENT_DOC_FILE_NAMES)[number]
  }

  throw new Error('Unsupported agent doc file name')
}

export function getAgentDocDirectory(tenantId: string): string {
  return join(process.cwd(), '.data', 'agent-docs', tenantId, 'latest')
}

export async function listAgentDocFiles(tenantId: string): Promise<string[]> {
  const directory = getAgentDocDirectory(tenantId)
  try {
    const files = await readdir(directory)
    return files.filter((fileName) => (AGENT_DOC_FILE_NAMES as readonly string[]).includes(fileName)).sort()
  } catch {
    return []
  }
}

export async function readAgentDocFile(tenantId: string, fileName: string): Promise<string> {
  const allowedFileName = ensureAllowedFileName(fileName)
  return readFile(join(getAgentDocDirectory(tenantId), allowedFileName), 'utf8')
}

export async function writeAgentDocFile(input: {
  tenantId: string
  fileName: string
  content: string
}): Promise<void> {
  const allowedFileName = ensureAllowedFileName(input.fileName)
  const directory = getAgentDocDirectory(input.tenantId)
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, allowedFileName), input.content, 'utf8')
}
