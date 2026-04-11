import type { IncomingMessage, ServerResponse } from 'node:http'
import type { AgentRuntimeApplication } from '../agent-runtime.application.ts'
import type { ChatRequest } from '../../../../packages/contracts/src/agent/chat.contract.ts'
import type { ContactRequest } from '../../../../packages/contracts/src/agent/contact.contract.ts'

async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }

  const text = Buffer.concat(chunks).toString('utf8')
  return (text ? JSON.parse(text) : {}) as T
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function getPathname(request: IncomingMessage): string {
  return new URL(request.url || '/', 'http://127.0.0.1').pathname
}

export function createAgentRuntimeStandaloneHandler(application: AgentRuntimeApplication) {
  return async function handle(request: IncomingMessage, response: ServerResponse) {
    const method = request.method || 'GET'
    const pathname = getPathname(request)

    if (method === 'GET' && pathname === '/health') {
      return sendJson(response, 200, { ok: true, service: 'agent-runtime-service' })
    }

    if (method === 'POST' && pathname === '/chat') {
      const body = await readJsonBody<ChatRequest>(request)
      try {
        return sendJson(response, 200, await application.chat(body))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Chat failed'
        return sendJson(response, message.includes('Tenant not found') ? 404 : 400, { error: message })
      }
    }

    if (method === 'POST' && pathname === '/contact') {
      const body = await readJsonBody<ContactRequest>(request)
      try {
        return sendJson(response, 200, await application.contact(body))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Contact failed'
        return sendJson(response, message.includes('Tenant not found') ? 404 : 400, { error: message })
      }
    }

    sendJson(response, 404, { error: 'Not found' })
  }
}
