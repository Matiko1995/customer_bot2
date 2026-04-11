import type { ContactRequest, ContactResponse } from '../../../../../packages/contracts/src/agent/contact.contract.ts'
import type { AgentRuntimeApplication } from '../../agent-runtime.application.ts'

export class ContactController {
  private readonly application: AgentRuntimeApplication

  constructor(application: AgentRuntimeApplication) {
    this.application = application
  }

  execute(input: ContactRequest): Promise<ContactResponse> {
    return this.application.contact(input)
  }
}
