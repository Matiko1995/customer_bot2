import { listAgentDocFiles, readAgentDocFile, writeAgentDocFile } from '../../../../server/lib/agent-docs/paths.ts'
import type { ObjectStorageProvider } from '../../../../server/lib/object-storage/object-storage.ts'
import type { AgentDocsGateway } from '../modules/agent-docs/use-cases/list-agent-docs.use-case.ts'

export class LocalAgentDocsGateway implements AgentDocsGateway {
  private readonly provider?: ObjectStorageProvider

  constructor(provider?: ObjectStorageProvider) {
    this.provider = provider
  }

  async list(tenantId: string) {
    const files = await listAgentDocFiles(tenantId, this.provider)
    return Promise.all(
      files.map(async (fileName) => ({
        fileName,
        content: await readAgentDocFile(tenantId, fileName, this.provider)
      }))
    )
  }

  save(input: { tenantId: string; fileName: string; content: string }) {
    return writeAgentDocFile(input, this.provider)
  }
}
