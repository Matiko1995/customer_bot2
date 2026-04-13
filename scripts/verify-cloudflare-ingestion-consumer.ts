import assert from 'node:assert/strict'
import { createCloudflareKnowledgeIndexingApplication } from '../services/knowledge-indexing-service/src/infrastructure/create-cloudflare-knowledge-indexing-application.ts'
import { createCloudflareTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'
import { processCloudflareIngestionMessage } from '../services/knowledge-indexing-service/src/infrastructure/cloudflare-ingestion-consumer.ts'
import { D1KnowledgeIndexingRepository } from '../services/knowledge-indexing-service/src/infrastructure/d1-knowledge-indexing.repository.ts'
import { retrieveForTenantWithVectorIndex } from '../server/lib/vector-index/retrieve-for-tenant.ts'
import { createVectorIndexProvider, resetVectorIndexProvider } from '../server/lib/vector-index/vector-index-provider.ts'
import type { D1Database, D1PreparedStatement, Queue, R2Bucket, R2Object, VectorizeIndex } from '../server/lib/cloudflare/bindings.ts'

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
  private readonly tenants = new Map<string, Row>()
  private readonly tenantUsers = new Map<string, Row>()
  private readonly dataSources = new Map<string, Row>()
  private readonly jobs = new Map<string, Row>()
  private readonly documents = new Map<string, Row>()
  private readonly chunks = new Map<string, Row>()

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
    if (query.includes('FROM tenants WHERE id = ?')) {
      return (this.tenants.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM tenant_users WHERE lower(email) = lower(?)')) {
      return (Array.from(this.tenantUsers.values()).find((item) => item.email === String(values[0]).toLowerCase()) as T) || null
    }

    if (query.includes('FROM tenant_users WHERE id = ?')) {
      return (this.tenantUsers.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM data_sources WHERE id = ?')) {
      return (this.dataSources.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM ingestion_jobs WHERE id = ?')) {
      return (this.jobs.get(String(values[0])) as T) || null
    }

    return null
  }

  async all<T>(query: string, values: unknown[]): Promise<{ results: T[] }> {
    if (query.includes('FROM tenants ORDER BY updated_at DESC')) {
      return { results: Array.from(this.tenants.values()) as T[] }
    }

    if (query.includes('FROM tenant_users WHERE tenant_id = ?')) {
      return {
        results: Array.from(this.tenantUsers.values()).filter((item) => item.tenant_id === values[0]) as T[]
      }
    }

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

    if (query.includes('FROM document_chunks_meta WHERE document_id = ?')) {
      return {
        results: Array.from(this.chunks.values())
          .filter((item) => item.document_id === values[0])
          .sort((left, right) => Number(left.chunk_index) - Number(right.chunk_index)) as T[]
      }
    }

    return { results: [] }
  }

  async run(query: string, values: unknown[]): Promise<unknown> {
    if (query.includes('INTO tenants')) {
      this.tenants.set(String(values[0]), {
        id: values[0],
        name: values[1],
        status: values[2],
        brand_name: values[3],
        theme_color: values[4],
        contact_phone: values[5],
        contact_email: values[6],
        contact_address: values[7],
        system_prompt: values[8],
        llm_endpoint: values[9],
        llm_api_key: values[10],
        llm_model: values[11],
        reuse_answered_questions: values[12],
        deleted_at: values[13],
        embed_key: values[14],
        rag_settings_json: values[15],
        billing_subscription_json: values[16],
        content_config_json: values[17],
        created_at: values[18],
        updated_at: values[19]
      })
      return { success: true }
    }

    if (query.includes('INTO tenant_users')) {
      this.tenantUsers.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        email: String(values[2]).toLowerCase(),
        password_hash: values[3],
        temporary_password: values[4],
        must_change_password: values[5],
        status: values[6],
        created_at: values[7],
        updated_at: values[8]
      })
      return { success: true }
    }

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

    if (query.includes('INTO source_documents')) {
      this.documents.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        data_source_id: values[2],
        external_id: values[3],
        title: values[4],
        mime_type: values[5],
        source_uri: values[6],
        content_hash: values[7],
        version_hash: values[8],
        metadata_json: values[9],
        chunk_count: values[10],
        created_at: values[11],
        updated_at: values[12]
      })
      return { success: true }
    }

    if (query.includes('DELETE FROM document_chunks_meta WHERE id = ?')) {
      this.chunks.delete(String(values[0]))
      return { success: true }
    }

    if (query.includes('INTO document_chunks_meta')) {
      this.chunks.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        document_id: values[2],
        chunk_index: values[3],
        content: values[4],
        token_count: values[5],
        metadata_json: values[6],
        created_at: values[7]
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
    const buffer = Buffer.from(this.value, 'utf8')
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
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

class FakeVectorizeIndex implements VectorizeIndex {
  readonly vectors = new Map<string, { values: number[]; metadata?: Record<string, unknown> }>()

  async upsert(items: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>): Promise<void> {
    for (const item of items) {
      this.vectors.set(item.id, {
        values: [...item.values],
        metadata: item.metadata ? structuredClone(item.metadata) : undefined
      })
    }
  }

  async query(vector: number[], options?: { topK?: number; filter?: Record<string, unknown>; returnMetadata?: boolean }) {
    const tenantId = options?.filter?.tenantId
    const matches = Array.from(this.vectors.entries())
      .filter(([, item]) => !tenantId || item.metadata?.tenantId === tenantId)
      .map(([id, item]) => ({
        id,
        score: vector.reduce((sum, value, index) => sum + value * (item.values[index] ?? 0), 0),
        metadata: options?.returnMetadata ? item.metadata : undefined
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, options?.topK ?? 5)

    return { matches }
  }
}

async function main() {
  const db = new FakeD1Database()
  const queue = new FakeQueue()
  const bucket = new FakeR2Bucket()
  const vectorIndex = new FakeVectorizeIndex()
  const repository = new D1KnowledgeIndexingRepository(db)
  const bindings = {
    TENANT_IDENTITY_DB: db,
    CUSTOMER_BOT_BUCKET: bucket,
    INGESTION_QUEUE: queue,
    CUSTOMER_BOT_VECTOR_INDEX: vectorIndex
  }

  const tenantApp = createCloudflareTenantIdentityApplication(bindings)
  await tenantApp.createTenant({
    id: 'tenant-consumer',
    name: 'Tenant Consumer',
    contactEmail: 'tenant-consumer@example.com'
  })

  const app = createCloudflareKnowledgeIndexingApplication(bindings)
  const created = await app.createSource({
    tenantId: 'tenant-consumer',
    type: 'file',
    syncMode: 'manual',
    config: { notes: '紧固件文档' }
  })

  await app.uploadSourceAsset({
    tenantId: 'tenant-consumer',
    sourceId: created.item.id,
    fileName: 'fastener.txt',
    mimeType: 'text/plain',
    base64Data: Buffer.from('DIN 933 六角螺栓，材质 304，不锈钢，规格 M8x30。', 'utf8').toString('base64')
  })

  const sync = await app.triggerSourceSync({
    tenantId: 'tenant-consumer',
    sourceId: created.item.id
  })

  const message = queue.sent[0] as {
    type: string
    payload: {
      tenantId: string
      sourceId: string
      jobId: string
      triggerMode: 'manual' | 'scheduled' | 'retry'
    }
  }

  await processCloudflareIngestionMessage({
    bindings,
    payload: message.payload
  })

  const jobs = await app.listJobs('tenant-consumer')
  assert.equal(jobs.items[0]?.status, 'succeeded')

  const docs = await app.getIndexStats('tenant-consumer')
  assert.equal(docs.documentCount, 1)
  assert.equal(docs.chunkCount > 0, true)

  const agentDocs = await app.listAgentDocs('tenant-consumer')
  assert.equal(agentDocs.items.some((item) => item.fileName === 'AGENTS.md'), true)

  resetVectorIndexProvider()
  const vectorProvider = createVectorIndexProvider(bindings)
  const retrieval = await retrieveForTenantWithVectorIndex({
    tenantId: 'tenant-consumer',
    queryVector: Array.from(vectorIndex.vectors.values())[0]?.values || [],
    repository,
    vectorIndex: vectorProvider
  })

  assert.equal(retrieval.citations.length > 0, true)
  assert.equal(retrieval.chunks[0]?.content.includes('DIN 933'), true)

  console.log('cloudflare ingestion consumer verified')
}

void main()
