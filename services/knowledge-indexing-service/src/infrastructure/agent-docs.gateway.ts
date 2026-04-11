import { listAgentDocFiles, readAgentDocFile, writeAgentDocFile } from '../../../../server/lib/agent-docs/paths.ts'
import type { AgentDocsGateway } from '../modules/agent-docs/use-cases/list-agent-docs.use-case.ts'

export class LocalAgentDocsGateway implements AgentDocsGateway {
  async list(tenantId: string) {
    const files = await listAgentDocFiles(tenantId)
    return Promise.all(
      files.map(async (fileName) => ({
        fileName,
        content: await readAgentDocFile(tenantId, fileName)
      }))
    )
  }

  save(input: { tenantId: string; fileName: string; content: string }) {
    return writeAgentDocFile(input)
  }
}
