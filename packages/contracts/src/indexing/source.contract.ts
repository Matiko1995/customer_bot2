import type { DataSourceRecord, IngestionJobRecord } from '../../../../types'

export interface ListSourcesResponse {
  items: DataSourceRecord[]
}

export interface CreateSourceRequest {
  type: DataSourceRecord['type']
  syncMode: DataSourceRecord['syncMode']
  scheduleCron?: string
  config: Record<string, unknown>
}

export interface CreateSourceResponse {
  ok: true
  item: DataSourceRecord
}

export interface UpdateSourceRequest {
  type?: DataSourceRecord['type']
  status?: DataSourceRecord['status']
  syncMode?: DataSourceRecord['syncMode']
  scheduleCron?: string
  config?: Record<string, unknown>
}

export interface UpdateSourceResponse {
  ok: true
  item: DataSourceRecord
}

export interface DisableSourceResponse {
  ok: true
  item: DataSourceRecord
}

export interface UploadSourceAssetRequest {
  tenantId: string
  sourceId: string
  fileName: string
  mimeType: string
  base64Data: string
}

export interface UploadSourceAssetResponse {
  ok: true
  item: DataSourceRecord
  asset: {
    fileName: string
    assetPath: string
    relativePath: string
  }
}

export interface TriggerSourceSyncResponse {
  ok: true
  item: IngestionJobRecord
  documentCount: number
  chunkCount: number
}
