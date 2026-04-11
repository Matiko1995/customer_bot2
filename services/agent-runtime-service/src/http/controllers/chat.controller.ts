import type { ChatRequest, ChatResponse } from '../../../../../packages/contracts/src/agent/chat.contract.ts'
import type { AgentRuntimeApplication } from '../../agent-runtime.application.ts'

export class ChatController {
  private readonly application: AgentRuntimeApplication

  constructor(application: AgentRuntimeApplication) {
    this.application = application
  }

  execute(input: ChatRequest): Promise<ChatResponse> {
    return this.application.chat(input)
  }
}
