import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createCloudflareKnowledgeIndexingApplication } from '../services/knowledge-indexing-service/src/infrastructure/create-cloudflare-knowledge-indexing-application.ts'
import type { D1Database, D1PreparedStatement, Queue, R2Bucket, R2Object } from '../server/lib/cloudflare/bindings.ts'

type Row = Record<string, unknown>

class FakePreparedStatement implements D1PreparedStatement {
  private readonly db: FakeD1Database
  private readonly query: string
  private values: unknown[] = []

  constructor(db: FakeD1Database, query: string) {
    this.db = db
    this.query = query
  }

  bind(...values: unknown[]): D1PreparedStatement {
    this.values = values
    return this
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return this.db.first<T>(this.query, this.values)
  }

  async run(): Promise<unknown> {
    return this.db.run(this.query, this.values)
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    return this.db.all<T>(this.query, this.values)
  }
}

class FakeD1Database implements D1Database {
  private readonly dataSources = new Map<string, Row>()
  private readonly jobs = new Map<string, Row>()
  private readonly documents = new Map<string, Row>()

  prepare(query: string): D1PreparedStatement {
    return new FakePreparedStatement(this, query)
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]> {
    const results: T[] = []
    for (const statement of statements) {
      results.push(await statement.run() as T)
    }
    return results
  }

  async first<T>(query: string, values: unknown[]): Promise<T | null> {
    if (query.includes('FROM data_sources WHERE id = ?')) {
      return (this.dataSources.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM ingestion_jobs WHERE id = ?')) {
      return (this.jobs.get(String(values[0])) as T) || null
    }

    return null
  }

  async all<T>(query: string, values: unknown[]): Promise<{ results: T[] }> {
    if (query.includes('FROM data_sources WHERE tenant_id = ?')) {
      return {
        results: Array.from(this.dataSources.values()).filter((item) => item.tenant_id === values[0]) as T[]
      }
    }

    if (query.includes('FROM ingestion_jobs WHERE tenant_id = ?')) {
      return {
        results: Array.from(this.jobs.values()).filter((item) => item.tenant_id === values[0]) as T[]
      }
    }

    if (query.includes('FROM source_documents WHERE tenant_id = ?')) {
      return {
        results: Array.from(this.documents.values()).filter((item) => item.tenant_id === values[0]) as T[]
      }
    }

    if (query.includes('SELECT COALESCE(SUM(chunk_count), 0) AS chunk_count FROM source_documents WHERE tenant_id = ?')) {
      const chunkCount = Array.from(this.documents.values())
        .filter((item) => item.tenant_id === values[0])
        .reduce((sum, item) => sum + Number(item.chunk_count || 0), 0)

      return { results: [{ chunk_count: chunkCount }] as T[] }
    }

    return { results: [] }
  }

  async run(query: string, values: unknown[]): Promise<unknown> {
    if (query.includes('INTO data_sources')) {
      this.dataSources.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        type: values[2],
        status: values[3],
        sync_mode: values[4],
        schedule_cron: values[5],
        config_json: values[6],
        last_synced_at: values[7],
        created_at: values[8],
        updated_at: values[9]
      })
      return { success: true }
    }

    if (query.includes('INTO ingestion_jobs')) {
      this.jobs.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        data_source_id: values[2],
        trigger_mode: values[3],
        status: values[4],
        started_at: values[5],
        finished_at: values[6],
        error_message: values[7],
        stats_json: values[8]
      })
      return { success: true }
    }

    return { success: true }
  }
}

class FakeQueue implements Queue<Record<string, unknown>> {
  readonly sent: Record<string, unknown>[] = []

  async send(message: Record<string, unknown>): Promise<void> {
    this.sent.push(structuredClone(message))
  }
}

class FakeR2Object implements R2Object {
  key: string
  private readonly value: string

  constructor(key: string, value: string) {
    this.key = key
    this.value = value
  }

  async text(): Promise<string> {
    return this.value
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return Buffer.from(this.value, 'utf8').buffer.slice(0)
  }
}

class FakeR2Bucket implements R2Bucket {
  readonly objects = new Map<string, string>()

  async get(key: string): Promise<R2Object | null> {
    const value = this.objects.get(key)
    return value === undefined ? null : new FakeR2Object(key, value)
  }

  async put(key: string, value: ArrayBuffer | ArrayBufferView | string): Promise<unknown> {
    if (typeof value === 'string') {
      this.objects.set(key, value)
      return
    }

    const buffer = ArrayBuffer.isView(value)
      ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
      : Buffer.from(value)

    this.objects.set(key, buffer.toString('utf8'))
  }

  async list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string }> }> {
    const prefix = options?.prefix || ''
    return {
      objects: Array.from(this.objects.keys())
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({ key }))
    }
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key)
  }
}

async function main() {
  const schema = await readFile('deploy/cloudflare/d1/002-knowledge-indexing.sql', 'utf8')
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS data_sources'), true)
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS ingestion_jobs'), true)
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS source_documents'), true)

  const queue = new FakeQueue()
  const bucket = new FakeR2Bucket()
  const app = createCloudflareKnowledgeIndexingApplication({
    TENANT_IDENTITY_DB: new FakeD1Database(),
    CUSTOMER_BOT_BUCKET: bucket,
    INGESTION_QUEUE: queue
  })

  const created = await app.createSource({
    tenantId: 'tenant-cf-indexing',
    type: 'file',
    syncMode: 'manual',
    config: { notes: '报价表' }
  })
  assert.equal(created.ok, true)

  const uploaded = await app.uploadSourceAsset({
    tenantId: 'tenant-cf-indexing',
    sourceId: created.item.id,
    fileName: 'products.csv',
    mimeType: 'text/csv',
    base64Data: Buffer.from('name,price\nDIN933,0.95', 'utf8').toString('base64')
  })
  assert.equal(uploaded.asset.relativePath.includes('source-assets/tenant-cf-indexing/products.csv'), true)

  const docsSaved = await app.saveAgentDoc({
    tenantId: 'tenant-cf-indexing',
    fileName: 'AGENTS.md',
    content: '# AGENTS\n\nCloudflare'
  })
  assert.equal(docsSaved.ok, true)

  const listedDocs = await app.listAgentDocs('tenant-cf-indexing')
  assert.equal(listedDocs.items.some((item) => item.fileName === 'AGENTS.md'), true)

  const sync = await app.triggerSourceSync({
    tenantId: 'tenant-cf-indexing',
    sourceId: created.item.id
  })
  assert.equal(sync.ok, true)
  assert.equal(sync.item.status, 'queued')
  assert.equal(queue.sent.length, 1)

  const jobs = await app.listJobs('tenant-cf-indexing')
  assert.equal(jobs.items.length, 1)

  console.log('cloudflare knowledge indexing verified')
}

void main()
