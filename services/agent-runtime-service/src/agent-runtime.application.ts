import type { ChatRequest, ChatResponse } from '../../../packages/contracts/src/agent/chat.contract.ts'
import type { ContactRequest, ContactResponse } from '../../../packages/contracts/src/agent/contact.contract.ts'

export interface AgentRuntimeApplicationDependencies {
  processChatMessage: (input: ChatRequest) => Promise<ChatResponse>
  submitLead: (input: ContactRequest) => Promise<ContactResponse>
}

export class AgentRuntimeApplication {
  private readonly deps: AgentRuntimeApplicationDependencies

  constructor(deps: AgentRuntimeApplicationDependencies) {
    this.deps = deps
  }

  chat(input: ChatRequest): Promise<ChatResponse> {
    return this.deps.processChatMessage(input)
  }

  contact(input: ContactRequest): Promise<ContactResponse> {
    return this.deps.submitLead(input)
  }
}
