import type { DbPool } from '../db/client.ts'
import type { RagRepository } from './rag-repository'

type DataSourceRow = {
  id: string
  tenant_id: string
  type: 'webpage' | 'file' | 'imap'
  status: 'active' | 'disabled'
  sync_mode: 'manual' | 'scheduled'
  schedule_cron: string | null
  config_json: Record<string, unknown>
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
  stats_json: Record<string, unknown>
}

type SourceDocumentRow = {
  id: string
  tenant_id: string
  data_source_id: string
  external_id: string | null
  title: string
  mime_type: string
  source_uri: string
  content_text: string
  metadata_json: Record<string, unknown>
  content_hash: string
  version_hash: string
  created_at: number
  updated_at: number
}

type DocumentChunkRow = {
  id: string
  tenant_id: string
  document_id: string
  chunk_index: number
  content: string
  token_count: number
  metadata_json: Record<string, unknown>
  embedding: number[] | null
  created_at: number
}

function mapDataSourceRow(row: DataSourceRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    status: row.status,
    syncMode: row.sync_mode,
    scheduleCron: row.schedule_cron || '',
    config: row.config_json || {},
    lastSyncedAt: row.last_synced_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapIngestionJobRow(row: IngestionJobRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    dataSourceId: row.data_source_id,
    triggerMode: row.trigger_mode,
    status: row.status,
    startedAt: row.started_at || undefined,
    finishedAt: row.finished_at || undefined,
    errorMessage: row.error_message || undefined,
    stats: row.stats_json || {}
  }
}

function mapSourceDocumentRow(row: SourceDocumentRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    dataSourceId: row.data_source_id,
    externalId: row.external_id || undefined,
    title: row.title,
    mimeType: row.mime_type,
    sourceUri: row.source_uri,
    contentText: row.content_text,
    metadata: row.metadata_json || {},
    contentHash: row.content_hash,
    versionHash: row.version_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapDocumentChunkRow(row: DocumentChunkRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    tokenCount: row.token_count,
    metadata: row.metadata_json || {},
    embedding: row.embedding || undefined,
    createdAt: row.created_at
  }
}

function toVectorLiteral(embedding: number[] | undefined): string | null {
  if (!embedding?.length) {
    return null
  }

  return `[${embedding.join(',')}]`
}

export function createPostgresRagRepository(pool: DbPool): RagRepository {
  return {
    async saveDataSource(record) {
      await pool.query(
        `
          INSERT INTO data_sources (
            id, tenant_id, type, status, sync_mode, schedule_cron, config_json, last_synced_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            sync_mode = EXCLUDED.sync_mode,
            schedule_cron = EXCLUDED.schedule_cron,
            config_json = EXCLUDED.config_json,
            last_synced_at = EXCLUDED.last_synced_at,
            updated_at = EXCLUDED.updated_at
        `,
        [
          record.id,
          record.tenantId,
          record.type,
          record.status,
          record.syncMode,
          record.scheduleCron || null,
          JSON.stringify(record.config ?? {}),
          record.lastSyncedAt ?? null,
          record.createdAt,
          record.updatedAt
        ]
      )
    },
    async getDataSourceById(dataSourceId) {
      const result = await pool.query<DataSourceRow>(
        `SELECT * FROM data_sources WHERE id = $1 LIMIT 1`,
        [dataSourceId]
      )
      const row = result.rows[0]
      return row ? mapDataSourceRow(row) : undefined
    },
    async listDataSourcesByTenant(tenantId) {
      const result = await pool.query<DataSourceRow>(
        `SELECT * FROM data_sources WHERE tenant_id = $1 ORDER BY updated_at DESC`,
        [tenantId]
      )
      return result.rows.map(mapDataSourceRow)
    },
    async saveIngestionJob(record) {
      await pool.query(
        `
          INSERT INTO ingestion_jobs (
            id, tenant_id, data_source_id, trigger_mode, status, started_at, finished_at, error_message, stats_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            started_at = EXCLUDED.started_at,
            finished_at = EXCLUDED.finished_at,
            error_message = EXCLUDED.error_message,
            stats_json = EXCLUDED.stats_json
        `,
        [
          record.id,
          record.tenantId,
          record.dataSourceId,
          record.triggerMode,
          record.status,
          record.startedAt ?? null,
          record.finishedAt ?? null,
          record.errorMessage ?? null,
          JSON.stringify(record.stats ?? {})
        ]
      )
    },
    async getIngestionJobById(jobId) {
      const result = await pool.query<IngestionJobRow>(
        `SELECT * FROM ingestion_jobs WHERE id = $1 LIMIT 1`,
        [jobId]
      )
      const row = result.rows[0]
      return row ? mapIngestionJobRow(row) : undefined
    },
    async listIngestionJobsByTenant(tenantId) {
      const result = await pool.query<IngestionJobRow>(
        `SELECT * FROM ingestion_jobs WHERE tenant_id = $1 ORDER BY COALESCE(finished_at, started_at, 0) DESC`,
        [tenantId]
      )
      return result.rows.map(mapIngestionJobRow)
    },
    async saveDocument(record) {
      await pool.query(
        `
          INSERT INTO source_documents (
            id, tenant_id, data_source_id, external_id, title, mime_type, source_uri, content_text, metadata_json, content_hash, version_hash, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            external_id = EXCLUDED.external_id,
            title = EXCLUDED.title,
            mime_type = EXCLUDED.mime_type,
            source_uri = EXCLUDED.source_uri,
            content_text = EXCLUDED.content_text,
            metadata_json = EXCLUDED.metadata_json,
            content_hash = EXCLUDED.content_hash,
            version_hash = EXCLUDED.version_hash,
            updated_at = EXCLUDED.updated_at
        `,
        [
          record.id,
          record.tenantId,
          record.dataSourceId,
          record.externalId ?? null,
          record.title,
          record.mimeType,
          record.sourceUri,
          record.contentText,
          JSON.stringify(record.metadata ?? {}),
          record.contentHash,
          record.versionHash,
          record.createdAt,
          record.updatedAt
        ]
      )
    },
    async getDocumentById(documentId) {
      const result = await pool.query<SourceDocumentRow>(
        `SELECT * FROM source_documents WHERE id = $1 LIMIT 1`,
        [documentId]
      )
      const row = result.rows[0]
      return row ? mapSourceDocumentRow(row) : undefined
    },
    async listDocumentsByTenant(tenantId) {
      const result = await pool.query<SourceDocumentRow>(
        `SELECT * FROM source_documents WHERE tenant_id = $1 ORDER BY updated_at DESC`,
        [tenantId]
      )
      return result.rows.map(mapSourceDocumentRow)
    },
    async replaceDocumentChunks(documentId, chunks) {
      await pool.query(`DELETE FROM document_chunks WHERE document_id = $1`, [documentId])

      for (const chunk of chunks) {
        await pool.query(
          `
            INSERT INTO document_chunks (
              id, tenant_id, document_id, chunk_index, content, token_count, metadata_json, embedding, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::vector, $9)
          `,
          [
            chunk.id,
            chunk.tenantId,
            chunk.documentId,
            chunk.chunkIndex,
            chunk.content,
            chunk.tokenCount,
            JSON.stringify(chunk.metadata ?? {}),
            toVectorLiteral(chunk.embedding),
            chunk.createdAt
          ]
        )
      }
    },
    async listChunksByDocument(documentId) {
      const result = await pool.query<DocumentChunkRow>(
        `SELECT * FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC`,
        [documentId]
      )
      return result.rows.map(mapDocumentChunkRow)
    }
  }
}
