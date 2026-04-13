import type { DataSourceRecord, DocumentChunkRecord, IngestionJobRecord, SourceDocumentRecord } from '../../../../types'
import type { D1Database } from '../../../../server/lib/cloudflare/bindings.ts'
import type { KnowledgeIndexingRepository } from '../domain/repositories/knowledge-indexing.repository.ts'

type DataSourceRow = {
  id: string
  tenant_id: string
  type: 'webpage' | 'file' | 'imap'
  status: 'active' | 'disabled'
  sync_mode: 'manual' | 'scheduled'
  schedule_cron: string | null
  config_json: string
  last_synced_at: number | null
  created_at: number
  updated_at: number
}

type IngestionJobRow = {
  id: string
  tenant_id: string
  data_source_id: string
  trigger_mode: 'manual' | 'scheduled' | 'retry'
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  started_at: number | null
  finished_at: number | null
  error_message: string | null
  stats_json: string
}

type SourceDocumentRow = {
  id: string
  tenant_id: string
  data_source_id: string
  external_id: string | null
  title: string
  mime_type: string
  source_uri: string
  content_hash: string
  version_hash: string
  metadata_json: string
  chunk_count: number
  created_at: number
  updated_at: number
}

type DocumentChunkMetaRow = {
  id: string
  tenant_id: string
  document_id: string
  chunk_index: number
  content: string
  token_count: number
  metadata_json: string
  created_at: number
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T
}

function mapDataSource(row: DataSourceRow): DataSourceRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    status: row.status,
    syncMode: row.sync_mode,
    scheduleCron: row.schedule_cron || undefined,
    config: parseJson<Record<string, unknown>>(row.config_json || '{}'),
    lastSyncedAt: row.last_synced_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapJob(row: IngestionJobRow): IngestionJobRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    dataSourceId: row.data_source_id,
    triggerMode: row.trigger_mode,
    status: row.status,
    startedAt: row.started_at || undefined,
    finishedAt: row.finished_at || undefined,
    errorMessage: row.error_message || undefined,
    stats: parseJson<Record<string, unknown>>(row.stats_json || '{}')
  }
}

function mapSourceDocument(row: SourceDocumentRow): SourceDocumentRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    dataSourceId: row.data_source_id,
    externalId: row.external_id || undefined,
    title: row.title,
    mimeType: row.mime_type,
    sourceUri: row.source_uri,
    contentText: '',
    metadata: parseJson<Record<string, unknown>>(row.metadata_json || '{}'),
    contentHash: row.content_hash,
    versionHash: row.version_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapDocumentChunk(row: DocumentChunkMetaRow): DocumentChunkRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    tokenCount: row.token_count,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json || '{}'),
    createdAt: row.created_at
  }
}

export class D1KnowledgeIndexingRepository implements KnowledgeIndexingRepository {
  private readonly db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  async saveDataSource(record: DataSourceRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO data_sources (
          id, tenant_id, type, status, sync_mode, schedule_cron, config_json, last_synced_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.id,
        record.tenantId,
        record.type,
        record.status,
        record.syncMode,
        record.scheduleCron || null,
        JSON.stringify(record.config ?? {}),
        record.lastSyncedAt || null,
        record.createdAt,
        record.updatedAt
      )
      .run()
  }

  async getDataSourceById(dataSourceId: string): Promise<DataSourceRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM data_sources WHERE id = ? LIMIT 1')
      .bind(dataSourceId)
      .first<DataSourceRow>()

    return row ? mapDataSource(row) : undefined
  }

  async listDataSourcesByTenant(tenantId: string): Promise<DataSourceRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM data_sources WHERE tenant_id = ? ORDER BY updated_at DESC')
      .bind(tenantId)
      .all<DataSourceRow>()

    return result.results.map(mapDataSource)
  }

  async saveIngestionJob(record: IngestionJobRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO ingestion_jobs (
          id, tenant_id, data_source_id, trigger_mode, status, started_at, finished_at, error_message, stats_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.id,
        record.tenantId,
        record.dataSourceId,
        record.triggerMode,
        record.status,
        record.startedAt || null,
        record.finishedAt || null,
        record.errorMessage || null,
        JSON.stringify(record.stats ?? {})
      )
      .run()
  }

  async getIngestionJobById(jobId: string): Promise<IngestionJobRecord | undefined> {
    const row = await this.db
      .prepare('SELECT * FROM ingestion_jobs WHERE id = ? LIMIT 1')
      .bind(jobId)
      .first<IngestionJobRow>()

    return row ? mapJob(row) : undefined
  }

  async listIngestionJobsByTenant(tenantId: string): Promise<IngestionJobRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM ingestion_jobs WHERE tenant_id = ? ORDER BY COALESCE(finished_at, started_at, 0) DESC')
      .bind(tenantId)
      .all<IngestionJobRow>()

    return result.results.map(mapJob)
  }

  async saveSourceDocument(record: SourceDocumentRecord): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO source_documents (
          id, tenant_id, data_source_id, external_id, title, mime_type, source_uri, content_hash, version_hash,
          metadata_json, chunk_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.id,
        record.tenantId,
        record.dataSourceId,
        record.externalId || null,
        record.title,
        record.mimeType,
        record.sourceUri,
        record.contentHash,
        record.versionHash,
        JSON.stringify(record.metadata ?? {}),
        Number((record.metadata?.chunkCount as number | undefined) || 0),
        record.createdAt,
        record.updatedAt
      )
      .run()
  }

  async listSourceDocumentsByTenant(tenantId: string): Promise<SourceDocumentRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM source_documents WHERE tenant_id = ? ORDER BY updated_at DESC')
      .bind(tenantId)
      .all<SourceDocumentRow>()

    return result.results.map(mapSourceDocument)
  }

  async replaceDocumentChunks(documentId: string, chunks: DocumentChunkRecord[]): Promise<void> {
    const existing = await this.listDocumentChunksByDocument(documentId)
    for (const chunk of existing) {
      await this.db
        .prepare('DELETE FROM document_chunks_meta WHERE id = ?')
        .bind(chunk.id)
        .run()
    }

    for (const chunk of chunks) {
      await this.db
        .prepare(`
          INSERT OR REPLACE INTO document_chunks_meta (
            id, tenant_id, document_id, chunk_index, content, token_count, metadata_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          chunk.id,
          chunk.tenantId,
          chunk.documentId,
          chunk.chunkIndex,
          chunk.content,
          chunk.tokenCount,
          JSON.stringify(chunk.metadata ?? {}),
          chunk.createdAt
        )
        .run()
    }
  }

  async listDocumentChunksByDocument(documentId: string): Promise<DocumentChunkRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM document_chunks_meta WHERE document_id = ? ORDER BY chunk_index ASC')
      .bind(documentId)
      .all<DocumentChunkMetaRow>()

    return result.results.map(mapDocumentChunk)
  }

  async countDocumentChunksByTenant(tenantId: string): Promise<number> {
    const documents = await this.listSourceDocumentsByTenant(tenantId)
    return documents.reduce((sum, item) => sum + Number(item.metadata?.chunkCount || 0), 0)
  }
}
