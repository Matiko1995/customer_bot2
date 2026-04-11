import type { ListAgentDocsResponse, SaveAgentDocResponse } from '../../../../../../packages/contracts/src/indexing/agent-docs.contract.ts'

export interface AgentDocsGateway {
  list(tenantId: string): Promise<Array<{ fileName: string; content: string }>>
  save(input: { tenantId: string; fileName: string; content: string }): Promise<void>
}

export class ListAgentDocsUseCase {
  private readonly gateway: AgentDocsGateway

  constructor(gateway: AgentDocsGateway) {
    this.gateway = gateway
  }

  async execute(tenantId: string): Promise<ListAgentDocsResponse> {
    return {
      items: await this.gateway.list(tenantId.trim())
    }
  }
}

export class SaveAgentDocUseCase {
  private readonly gateway: AgentDocsGateway

  constructor(gateway: AgentDocsGateway) {
    this.gateway = gateway
  }

  async execute(input: { tenantId: string; fileName: string; content: string }): Promise<SaveAgentDocResponse> {
    await this.gateway.save(input)
    return { ok: true }
  }
}
