import type { CreateSourceRequest, UpdateSourceRequest, UpdateSourceResponse, UploadSourceAssetResponse } from '../../../packages/contracts/src/indexing/source.contract.ts'
import { getServiceBaseUrl } from '../../../packages/shared-config/src/service-endpoints.ts'
import { createKnowledgeIndexingHttpAdapter } from '../../../services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-http-adapter.ts'
import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'
import { requestJson, type GatewayHttpOptions } from './http.ts'
import type { RagRepository } from '../repositories/rag-repository.ts'

export function createKnowledgeIndexingGateway(
  input:
    | RagRepository
    | ({ repository?: RagRepository; bindings?: CloudflareRuntimeBindings } & GatewayHttpOptions)
) {
  const repository = 'saveDataSource' in input ? input : input.repository
  const bindings = 'saveDataSource' in input ? undefined : input.bindings
  const baseUrl = 'saveDataSource' in input ? getServiceBaseUrl('knowledge-indexing-service') : input.baseUrl || getServiceBaseUrl('knowledge-indexing-service')
  const fetcher = 'saveDataSource' in input ? undefined : input.fetcher
  const http = 'saveDataSource' in input
    ? createKnowledgeIndexingHttpAdapter(input)
    : createKnowledgeIndexingHttpAdapter({ repository, bindings })

  return {
    listSources(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/sources?tenantId=${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.sources.list(tenantId)
    },
    createSource(input: { tenantId: string } & CreateSourceRequest) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: '/sources',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.sources.create(input)
    },
    disableSource(input: { tenantId: string; sourceId: string }) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/sources/${encodeURIComponent(input.sourceId)}?tenantId=${encodeURIComponent(input.tenantId)}`,
          method: 'DELETE',
          fetcher
        })
      }

      return http.sources.disable(input)
    },
    updateSource(input: { tenantId: string; sourceId: string } & UpdateSourceRequest): Promise<UpdateSourceResponse> {
      if (baseUrl) {
        return requestJson<UpdateSourceResponse>({
          baseUrl,
          path: `/sources/${encodeURIComponent(input.sourceId)}`,
          method: 'PUT',
          body: input,
          fetcher
        })
      }

      return http.sources.update(input)
    },
    uploadSourceAsset(input: {
      tenantId: string
      sourceId: string
      fileName: string
      mimeType: string
      base64Data: string
    }): Promise<UploadSourceAssetResponse> {
      if (baseUrl) {
        return requestJson<UploadSourceAssetResponse>({
          baseUrl,
          path: `/sources/${encodeURIComponent(input.sourceId)}/upload`,
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.sources.upload(input)
    },
    syncSource(input: { tenantId: string; sourceId: string }) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/sources/${encodeURIComponent(input.sourceId)}/sync`,
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.sources.sync(input)
    },
    listJobs(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/jobs?tenantId=${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.jobs.list(tenantId)
    },
    getIndexStats(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/jobs/stats?tenantId=${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.jobs.stats(tenantId)
    },
    retryJob(input: { tenantId: string; jobId: string }) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/jobs/${encodeURIComponent(input.jobId)}/retry`,
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.jobs.retry(input)
    },
    reindexAll(input: { tenantId: string }) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: '/jobs/reindex-all',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.jobs.reindexAll(input)
    },
    listAgentDocs(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/agent-docs?tenantId=${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.agentDocs.list(tenantId)
    },
    saveAgentDoc(input: { tenantId: string; fileName: string; content: string }) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/agent-docs/${encodeURIComponent(input.fileName)}`,
          method: 'PUT',
          body: input,
          fetcher
        })
      }

      return http.agentDocs.save(input)
    }
  }
}
