import type { ListAgentDocsResponse, SaveAgentDocResponse } from '../../../../../packages/contracts/src/indexing/agent-docs.contract.ts'
import type { KnowledgeIndexingApplication } from '../../knowledge-indexing.application.ts'

export class AgentDocsController {
  private readonly application: KnowledgeIndexingApplication

  constructor(application: KnowledgeIndexingApplication) {
    this.application = application
  }

  list(tenantId: string): Promise<ListAgentDocsResponse> {
    return this.application.listAgentDocs(tenantId)
  }

  save(input: { tenantId: string; fileName: string; content: string }): Promise<SaveAgentDocResponse> {
    return this.application.saveAgentDoc(input)
  }
}
