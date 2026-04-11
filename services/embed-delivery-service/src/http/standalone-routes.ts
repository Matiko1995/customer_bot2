import type { IncomingMessage, ServerResponse } from 'node:http'
import type { EmbedDeliveryApplication } from '../embed-delivery.application.ts'

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function sendText(response: ServerResponse, statusCode: number, body: string, contentType: string, cacheControl?: string) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', contentType)
  if (cacheControl) {
    response.setHeader('Cache-Control', cacheControl)
  }
  response.end(body)
}

function getUrl(request: IncomingMessage) {
  return new URL(request.url || '/', 'http://127.0.0.1')
}

export function createEmbedDeliveryStandaloneHandler(application: EmbedDeliveryApplication) {
  return async function handle(request: IncomingMessage, response: ServerResponse) {
    const method = request.method || 'GET'
    const url = getUrl(request)
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/health') {
      return sendJson(response, 200, { ok: true, service: 'embed-delivery-service' })
    }

    if (method === 'GET' && pathname === '/embed/runtime-config') {
      const tenantId = url.searchParams.get('tenantId') || ''
      try {
        return sendJson(response, 200, await application.runtimeConfig({ tenantId }))
      } catch {
        return sendJson(response, 404, { error: 'Tenant not found' })
      }
    }

    if (method === 'GET' && pathname === '/embed/widget-script') {
      try {
        const script = await application.widgetScript()
        return sendText(response, 200, script.code, script.contentType, script.cacheControl)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'widget script unavailable'
        return sendJson(response, 503, { error: message })
      }
    }

    sendJson(response, 404, { error: 'Not found' })
  }
}
