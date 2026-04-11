import type { AgentRuntimeApplication } from '../agent-runtime.application.ts'
import { ChatController } from './controllers/chat.controller.ts'
import { ContactController } from './controllers/contact.controller.ts'

export function createAgentRuntimeHttpLayer(application: AgentRuntimeApplication) {
  return {
    chat: new ChatController(application),
    contact: new ContactController(application)
  }
}
