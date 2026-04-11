import assert from 'node:assert/strict'
import { createPostgresRagRepository } from '../server/lib/repositories/postgres-rag-repository.ts'

type QueryCall = {
  sql: string
  params?: unknown[]
}

async function main() {
  const calls: QueryCall[] = []

  const pool = {
    async query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
      calls.push({ sql, params })

      if (sql.includes('SELECT * FROM data_sources WHERE id')) {
        return {
          rows: [
            {
              id: 'source-1',
              tenant_id: 'tenant-1',
              type: 'file',
              status: 'active',
              sync_mode: 'manual',
              schedule_cron: '',
              config_json: { fileName: 'products.csv' },
              last_synced_at: 10,
              created_at: 1,
              updated_at: 2
            }
          ] as T[]
        }
      }

      if (sql.includes('SELECT * FROM ingestion_jobs WHERE id')) {
        return {
          rows: [
            {
              id: 'job-1',
              tenant_id: 'tenant-1',
              data_source_id: 'source-1',
              trigger_mode: 'manual',
              status: 'succeeded',
              started_at: 11,
              finished_at: 12,
              error_message: null,
              stats_json: { documentCount: 1, chunkCount: 2 }
            }
          ] as T[]
        }
      }

      if (sql.includes('SELECT * FROM source_documents WHERE id')) {
        return {
          rows: [
            {
              id: 'doc-1',
              tenant_id: 'tenant-1',
              data_source_id: 'source-1',
              external_id: null,
              title: 'Manual',
              mime_type: 'text/plain',
              source_uri: 'file://manual.txt',
              content_text: 'alpha beta',
              metadata_json: {},
              content_hash: 'hash-1',
              version_hash: 'hash-1',
              created_at: 1,
              updated_at: 2
            }
          ] as T[]
        }
      }

      if (sql.includes('SELECT * FROM document_chunks WHERE document_id')) {
        return {
          rows: [
            {
              id: 'chunk-1',
              tenant_id: 'tenant-1',
              document_id: 'doc-1',
              chunk_index: 0,
              content: 'alpha beta',
              token_count: 2,
              metadata_json: {},
              embedding: [0.1, 0.2],
              created_at: 1
            }
          ] as T[]
        }
      }

      return { rows: [] as T[] }
    },
    async end() {}
  }

  const repository = createPostgresRagRepository(pool)

  await repository.saveDataSource({
    id: 'source-1',
    tenantId: 'tenant-1',
    type: 'file',
    status: 'active',
    syncMode: 'manual',
    scheduleCron: '',
    config: { fileName: 'products.csv' },
    lastSyncedAt: 10,
    createdAt: 1,
    updatedAt: 2
  })

  const saveDataSourceCall = calls[calls.length - 1]
  assert.equal(saveDataSourceCall.params?.[0], 'source-1')
  assert.equal(saveDataSourceCall.params?.[1], 'tenant-1')

  const dataSource = await repository.getDataSourceById('source-1')
  assert.equal(dataSource?.tenantId, 'tenant-1')
  assert.equal(dataSource?.config.fileName, 'products.csv')

  const job = await repository.getIngestionJobById('job-1')
  assert.equal(job?.status, 'succeeded')
  assert.equal(job?.stats.documentCount, 1)

  const document = await repository.getDocumentById('doc-1')
  assert.equal(document?.title, 'Manual')

  const chunks = await repository.listChunksByDocument('doc-1')
  assert.equal(chunks.length, 1)
  assert.deepEqual(chunks[0]?.embedding, [0.1, 0.2])

  console.log('postgres rag repository verified')
}

void main()
