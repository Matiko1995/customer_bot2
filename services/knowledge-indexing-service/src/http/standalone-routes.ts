import type { IncomingMessage, ServerResponse } from 'node:http'
import type { KnowledgeIndexingApplication } from '../knowledge-indexing.application.ts'

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

function getUrl(request: IncomingMessage) {
  return new URL(request.url || '/', 'http://127.0.0.1')
}

export function createKnowledgeIndexingStandaloneHandler(application: KnowledgeIndexingApplication) {
  return async function handle(request: IncomingMessage, response: ServerResponse) {
    const method = request.method || 'GET'
    const url = getUrl(request)
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/health') {
      return sendJson(response, 200, { ok: true, service: 'knowledge-indexing-service' })
    }

    if (method === 'GET' && pathname === '/sources') {
      const tenantId = url.searchParams.get('tenantId') || ''
      return sendJson(response, 200, await application.listSources(tenantId))
    }

    if (method === 'POST' && pathname === '/sources') {
      const body = await readJsonBody<{
        tenantId: string
        type: 'webpage' | 'file' | 'imap'
        syncMode: 'manual' | 'scheduled'
        scheduleCron?: string
        config: Record<string, unknown>
      }>(request)
      return sendJson(response, 200, await application.createSource(body))
    }

    if (pathname.startsWith('/sources/')) {
      const tail = pathname.slice('/sources/'.length)

      if (method === 'PUT' && !tail.includes('/')) {
        const body = await readJsonBody<Record<string, unknown>>(request)
        return sendJson(response, 200, await application.updateSource({
          tenantId: String(body.tenantId || ''),
          sourceId: decodeURIComponent(tail),
          type: body.type as never,
          status: body.status as never,
          syncMode: body.syncMode as never,
          scheduleCron: typeof body.scheduleCron === 'string' ? body.scheduleCron : undefined,
          config: body.config && typeof body.config === 'object' ? body.config as Record<string, unknown> : undefined
        }))
      }

      if (method === 'DELETE' && !tail.includes('/')) {
        const tenantId = url.searchParams.get('tenantId') || ''
        return sendJson(response, 200, await application.disableSource({
          tenantId,
          sourceId: decodeURIComponent(tail)
        }))
      }

      if (method === 'POST' && tail.endsWith('/sync')) {
        const sourceId = decodeURIComponent(tail.slice(0, -'/sync'.length))
        const body = await readJsonBody<{ tenantId: string }>(request)
        return sendJson(response, 200, await application.triggerSourceSync({
          tenantId: body.tenantId,
          sourceId
        }))
      }

      if (method === 'POST' && tail.endsWith('/upload')) {
        const sourceId = decodeURIComponent(tail.slice(0, -'/upload'.length))
        const body = await readJsonBody<{
          tenantId: string
          fileName: string
          mimeType: string
          base64Data: string
        }>(request)
        return sendJson(response, 200, await application.uploadSourceAsset({
          tenantId: body.tenantId,
          sourceId,
          fileName: body.fileName,
          mimeType: body.mimeType,
          base64Data: body.base64Data
        }))
      }
    }

    if (method === 'GET' && pathname === '/jobs') {
      const tenantId = url.searchParams.get('tenantId') || ''
      return sendJson(response, 200, await application.listJobs(tenantId))
    }

    if (method === 'GET' && pathname === '/jobs/stats') {
      const tenantId = url.searchParams.get('tenantId') || ''
      return sendJson(response, 200, await application.getIndexStats(tenantId))
    }

    if (method === 'POST' && pathname === '/jobs/reindex-all') {
      const body = await readJsonBody<{ tenantId: string }>(request)
      return sendJson(response, 200, await application.reindexAll(body.tenantId))
    }

    if (method === 'POST' && pathname.startsWith('/jobs/') && pathname.endsWith('/retry')) {
      const jobId = decodeURIComponent(pathname.slice('/jobs/'.length, -'/retry'.length))
      const body = await readJsonBody<{ tenantId: string }>(request)
      return sendJson(response, 200, await application.retryJob({
        tenantId: body.tenantId,
        jobId
      }))
    }

    if (method === 'GET' && pathname === '/agent-docs') {
      const tenantId = url.searchParams.get('tenantId') || ''
      return sendJson(response, 200, await application.listAgentDocs(tenantId))
    }

    if (method === 'PUT' && pathname.startsWith('/agent-docs/')) {
      const fileName = decodeURIComponent(pathname.slice('/agent-docs/'.length))
      const body = await readJsonBody<{ tenantId: string; content: string }>(request)
      return sendJson(response, 200, await application.saveAgentDoc({
        tenantId: body.tenantId,
        fileName,
        content: body.content
      }))
    }

    sendJson(response, 404, { error: 'Not found' })
  }
}
