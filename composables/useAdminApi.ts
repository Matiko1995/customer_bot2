import { buildForwardedRequestHeaders } from '../lib/request-headers'
import type { DataSourceRecord, IngestionJobRecord } from '../types'
import type { IndexStatsResponse, ReindexAllResponse } from '../packages/contracts/src/indexing/job.contract'

export function useAdminApi() {
  const requestHeaders = process.server ? useRequestHeaders(['cookie']) : undefined

  async function request<T>(url: string, options?: Parameters<typeof $fetch<T>>[1]) {
    return $fetch<T>(url, {
      credentials: 'include',
      headers: buildForwardedRequestHeaders(options?.headers, requestHeaders?.cookie),
      ...options
    })
  }

  return {
    request,
    listTenantSources(tenantId: string) {
      return request<{ items: DataSourceRecord[] }>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/sources`)
    },
    createTenantSource(
      tenantId: string,
      body: {
        type: DataSourceRecord['type']
        syncMode: DataSourceRecord['syncMode']
        scheduleCron?: string
        config: Record<string, unknown>
      }
    ) {
      return request<{ ok: boolean; item: DataSourceRecord }>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/sources`, {
        method: 'POST',
        body
      })
    },
    syncTenantSource(tenantId: string, sourceId: string) {
      return request<{ ok: boolean; item: IngestionJobRecord; documentCount: number; chunkCount: number }>(
        `/api/admin/tenants/${encodeURIComponent(tenantId)}/sources/${encodeURIComponent(sourceId)}/sync`,
        { method: 'POST' }
      )
    },
    disableTenantSource(tenantId: string, sourceId: string) {
      return request<{ ok: boolean; item: DataSourceRecord }>(
        `/api/admin/tenants/${encodeURIComponent(tenantId)}/sources/${encodeURIComponent(sourceId)}`,
        { method: 'DELETE' }
      )
    },
    uploadTenantSourceAsset(tenantId: string, sourceId: string, body: { fileName: string; mimeType: string; base64Data: string }) {
      return request<{ ok: boolean; item: DataSourceRecord }>(
        `/api/admin/tenants/${encodeURIComponent(tenantId)}/sources/${encodeURIComponent(sourceId)}/upload`,
        {
          method: 'POST',
          body
        }
      )
    },
    listTenantIngestionJobs(tenantId: string) {
      return request<{ items: IngestionJobRecord[] }>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/jobs`)
    },
    getTenantIndexStats(tenantId: string) {
      return request<IndexStatsResponse>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/index-stats`)
    },
    retryTenantIngestionJob(tenantId: string, jobId: string) {
      return request<{ ok: boolean; item: IngestionJobRecord }>(
        `/api/admin/tenants/${encodeURIComponent(tenantId)}/jobs/${encodeURIComponent(jobId)}/retry`,
        { method: 'POST' }
      )
    },
    reindexTenantSources(tenantId: string) {
      return request<ReindexAllResponse>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/jobs/reindex`, {
        method: 'POST'
      })
    },
    listTenantAgentDocs(tenantId: string) {
      return request<{ items: Array<{ fileName: string; content: string }> }>(
        `/api/admin/tenants/${encodeURIComponent(tenantId)}/agent-docs`
      )
    },
    saveTenantAgentDoc(tenantId: string, fileName: string, content: string) {
      return request<{ ok: boolean }>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/agent-docs/${encodeURIComponent(fileName)}`, {
        method: 'PUT',
        body: { content }
      })
    }
  }
}
