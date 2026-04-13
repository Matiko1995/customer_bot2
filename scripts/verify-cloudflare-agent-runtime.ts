import assert from 'node:assert/strict'
import { createCloudflareTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'
import { createCloudflareKnowledgeIndexingApplication } from '../services/knowledge-indexing-service/src/infrastructure/create-cloudflare-knowledge-indexing-application.ts'
import { processCloudflareIngestionMessage } from '../services/knowledge-indexing-service/src/infrastructure/cloudflare-ingestion-consumer.ts'
import { createCloudflareAgentRuntimeApplication } from '../services/agent-runtime-service/src/infrastructure/create-cloudflare-agent-runtime-application.ts'
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
  private readonly tenantPasswordResets = new Map<string, Row>()
  private readonly dataSources = new Map<string, Row>()
  private readonly jobs = new Map<string, Row>()
  private readonly documents = new Map<string, Row>()
  private readonly chunks = new Map<string, Row>()
  private readonly sessions = new Map<string, Row>()
  private readonly messages = new Map<string, Row>()
  private readonly leads = new Map<string, Row>()
  private readonly usage = new Map<string, Row>()

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
    if (query.includes('FROM tenants WHERE id = ?')) return (this.tenants.get(String(values[0])) as T) || null
    if (query.includes('FROM tenants WHERE embed_key = ?')) {
      return (Array.from(this.tenants.values()).find((item) => item.embed_key === values[0]) as T) || null
    }
    if (query.includes('FROM tenant_users WHERE lower(email) = lower(?)')) {
      return (Array.from(this.tenantUsers.values()).find((item) => item.email === String(values[0]).toLowerCase()) as T) || null
    }
    if (query.includes('FROM tenant_users WHERE id = ?')) return (this.tenantUsers.get(String(values[0])) as T) || null
    if (query.includes('FROM tenant_password_resets WHERE lower(email) = lower(?) AND code = ?')) {
      return (Array.from(this.tenantPasswordResets.values()).find((item) => item.email === String(values[0]).toLowerCase() && item.code === values[1]) as T) || null
    }
    if (query.includes('FROM data_sources WHERE id = ?')) return (this.dataSources.get(String(values[0])) as T) || null
    if (query.includes('FROM ingestion_jobs WHERE id = ?')) return (this.jobs.get(String(values[0])) as T) || null
    if (query.includes('FROM chat_sessions WHERE id = ?')) return (this.sessions.get(String(values[0])) as T) || null
    return null
  }

  async all<T>(query: string, values: unknown[]): Promise<{ results: T[] }> {
    if (query.includes('FROM tenants ORDER BY updated_at DESC')) return { results: Array.from(this.tenants.values()) as T[] }
    if (query.includes('FROM tenant_users WHERE tenant_id = ?')) return { results: Array.from(this.tenantUsers.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM data_sources WHERE tenant_id = ?')) return { results: Array.from(this.dataSources.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM ingestion_jobs WHERE tenant_id = ?')) return { results: Array.from(this.jobs.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM source_documents WHERE tenant_id = ?')) return { results: Array.from(this.documents.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM document_chunks_meta WHERE document_id = ?')) {
      return { results: Array.from(this.chunks.values()).filter((item) => item.document_id === values[0]).sort((a, b) => Number(a.chunk_index) - Number(b.chunk_index)) as T[] }
    }
    if (query.includes('FROM chat_sessions WHERE tenant_id = ?')) return { results: Array.from(this.sessions.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM chat_messages WHERE session_id = ?')) return { results: Array.from(this.messages.values()).filter((item) => item.session_id === values[0]).sort((a, b) => Number(a.created_at) - Number(b.created_at)) as T[] }
    if (query.includes('FROM leads WHERE tenant_id = ?')) return { results: Array.from(this.leads.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    if (query.includes('FROM usage_records WHERE tenant_id = ?')) return { results: Array.from(this.usage.values()).filter((item) => item.tenant_id === values[0]) as T[] }
    return { results: [] }
  }

  async run(query: string, values: unknown[]): Promise<unknown> {
    if (query.includes('INTO tenants')) {
      this.tenants.set(String(values[0]), {
        id: values[0], name: values[1], status: values[2], brand_name: values[3], theme_color: values[4],
        contact_phone: values[5], contact_email: values[6], contact_address: values[7], system_prompt: values[8],
        llm_endpoint: values[9], llm_api_key: values[10], llm_model: values[11], reuse_answered_questions: values[12],
        deleted_at: values[13], embed_key: values[14], rag_settings_json: values[15], billing_subscription_json: values[16],
        content_config_json: values[17], created_at: values[18], updated_at: values[19]
      }); return { success: true }
    }
    if (query.includes('INTO tenant_users')) {
      this.tenantUsers.set(String(values[0]), {
        id: values[0], tenant_id: values[1], email: String(values[2]).toLowerCase(), password_hash: values[3],
        temporary_password: values[4], must_change_password: values[5], status: values[6], created_at: values[7], updated_at: values[8]
      }); return { success: true }
    }
    if (query.includes('INTO tenant_password_resets')) {
      this.tenantPasswordResets.set(String(values[0]), {
        id: values[0], tenant_user_id: values[1], tenant_id: values[2], email: String(values[3]).toLowerCase(),
        code: values[4], expires_at: values[5], used_at: values[6], created_at: values[7]
      }); return { success: true }
    }
    if (query.includes('INTO data_sources')) {
      this.dataSources.set(String(values[0]), {
        id: values[0], tenant_id: values[1], type: values[2], status: values[3], sync_mode: values[4],
        schedule_cron: values[5], config_json: values[6], last_synced_at: values[7], created_at: values[8], updated_at: values[9]
      }); return { success: true }
    }
    if (query.includes('INTO ingestion_jobs')) {
      this.jobs.set(String(values[0]), {
        id: values[0], tenant_id: values[1], data_source_id: values[2], trigger_mode: values[3], status: values[4],
        started_at: values[5], finished_at: values[6], error_message: values[7], stats_json: values[8]
      }); return { success: true }
    }
    if (query.includes('INTO source_documents')) {
      this.documents.set(String(values[0]), {
        id: values[0], tenant_id: values[1], data_source_id: values[2], external_id: values[3], title: values[4],
        mime_type: values[5], source_uri: values[6], content_hash: values[7], version_hash: values[8],
        metadata_json: values[9], chunk_count: values[10], created_at: values[11], updated_at: values[12]
      }); return { success: true }
    }
    if (query.includes('DELETE FROM document_chunks_meta WHERE id = ?')) { this.chunks.delete(String(values[0])); return { success: true } }
    if (query.includes('INTO document_chunks_meta')) {
      this.chunks.set(String(values[0]), {
        id: values[0], tenant_id: values[1], document_id: values[2], chunk_index: values[3], content: values[4],
        token_count: values[5], metadata_json: values[6], created_at: values[7]
      }); return { success: true }
    }
    if (query.includes('INTO chat_sessions')) {
      this.sessions.set(String(values[0]), {
        id: values[0], tenant_id: values[1], visitor_id: values[2], started_at: values[3], last_message_at: values[4]
      }); return { success: true }
    }
    if (query.includes('INTO chat_messages')) {
      this.messages.set(String(values[0]), {
        id: values[0], session_id: values[1], tenant_id: values[2], role: values[3], content: values[4], created_at: values[5],
        attachments_json: values[6], matched_content_sources_json: values[7], citations_json: values[8],
        answer_source: values[9], credential_source: values[10], retrieval_confidence: values[11]
      }); return { success: true }
    }
    if (query.includes('INTO leads')) {
      this.leads.set(String(values[0]), {
        id: values[0], tenant_id: values[1], session_id: values[2], name: values[3], company: values[4], contact: values[5],
        demand_type: values[6], message: values[7], created_at: values[8]
      }); return { success: true }
    }
    if (query.includes('INTO usage_records')) {
      this.usage.set(String(values[0]), {
        id: values[0], tenant_id: values[1], session_id: values[2], provider: values[3], model: values[4],
        input_tokens: values[5], output_tokens: values[6], total_tokens: values[7], amount: values[8], status: values[9],
        credential_source: values[10], answer_source: values[11], created_at: values[12]
      }); return { success: true }
    }
    return { success: true }
  }
}

class FakeQueue implements Queue<Record<string, unknown>> {
  readonly sent: Record<string, unknown>[] = []
  async send(message: Record<string, unknown>): Promise<void> { this.sent.push(structuredClone(message)) }
}

class FakeR2Object implements R2Object {
  key: string
  private readonly value: string
  constructor(key: string, value: string) { this.key = key; this.value = value }
  async text(): Promise<string> { return this.value }
  async arrayBuffer(): Promise<ArrayBuffer> {
    const buffer = Buffer.from(this.value, 'utf8')
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}

class FakeR2Bucket implements R2Bucket {
  readonly objects = new Map<string, string>()
  async get(key: string): Promise<R2Object | null> { const value = this.objects.get(key); return value === undefined ? null : new FakeR2Object(key, value) }
  async put(key: string, value: ArrayBuffer | ArrayBufferView | string): Promise<unknown> {
    if (typeof value === 'string') { this.objects.set(key, value); return }
    const buffer = ArrayBuffer.isView(value) ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value)
    this.objects.set(key, buffer.toString('utf8'))
  }
  async list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string }> }> {
    const prefix = options?.prefix || ''
    return { objects: Array.from(this.objects.keys()).filter((key) => key.startsWith(prefix)).map((key) => ({ key })) }
  }
  async delete(key: string): Promise<void> { this.objects.delete(key) }
}

class FakeVectorizeIndex implements VectorizeIndex {
  readonly vectors = new Map<string, { values: number[]; metadata?: Record<string, unknown> }>()
  async upsert(items: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>): Promise<void> {
    for (const item of items) {
      this.vectors.set(item.id, { values: [...item.values], metadata: item.metadata ? structuredClone(item.metadata) : undefined })
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
      .sort((a, b) => b.score - a.score)
      .slice(0, options?.topK ?? 5)
    return { matches }
  }
}

async function main() {
  const db = new FakeD1Database()
  const queue = new FakeQueue()
  const bucket = new FakeR2Bucket()
  const vectorIndex = new FakeVectorizeIndex()
  const bindings = {
    TENANT_IDENTITY_DB: db,
    CUSTOMER_BOT_BUCKET: bucket,
    INGESTION_QUEUE: queue,
    CUSTOMER_BOT_VECTOR_INDEX: vectorIndex
  }

  const tenantApp = createCloudflareTenantIdentityApplication(bindings)
  await tenantApp.createTenant({
    id: 'tenant-runtime',
    name: 'Tenant Runtime',
    contactEmail: 'tenant-runtime@example.com',
    ragSettings: {
      enabled: true,
      industryPreset: 'fastener',
      chunkSize: 500,
      chunkOverlap: 80,
      retrievalTopK: 3,
      ingestionStructureTemplate: '标题\n摘要\n关键事实',
      answerStructureTemplate: '结论\n依据\n来源',
      retrievalPromptTemplate: '请严格基于命中资料回答：{{query}}',
      fallbackPromptTemplate: '未命中资料：{{query}}'
    }
  })

  const indexingApp = createCloudflareKnowledgeIndexingApplication(bindings)
  const source = await indexingApp.createSource({
    tenantId: 'tenant-runtime',
    type: 'file',
    syncMode: 'manual',
    config: { notes: '紧固件资料' }
  })

  await indexingApp.uploadSourceAsset({
    tenantId: 'tenant-runtime',
    sourceId: source.item.id,
    fileName: 'fastener.txt',
    mimeType: 'text/plain',
    base64Data: Buffer.from('DIN 933 六角头螺栓适用于通用连接，304 材质常用于普通防腐场景。', 'utf8').toString('base64')
  })

  await indexingApp.triggerSourceSync({
    tenantId: 'tenant-runtime',
    sourceId: source.item.id
  })

  const message = queue.sent[0] as {
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

  const runtimeApp = createCloudflareAgentRuntimeApplication(bindings)
  const chat = await runtimeApp.chat({
    tenantId: 'tenant-runtime',
    message: 'DIN 933 六角头螺栓适合什么场景？'
  })

  assert.equal(chat.answerSource, 'rag')
  assert.equal(chat.citations.length > 0, true)

  const contact = await runtimeApp.contact({
    tenantId: 'tenant-runtime',
    sessionId: chat.sessionId,
    name: 'Alice',
    company: 'ACME',
    demandType: 'quote',
    contact: 'alice@example.com',
    message: '请联系我'
  })

  assert.equal(contact.ok, true)
  assert.equal(contact.id.startsWith('lead-'), true)

  console.log('cloudflare agent runtime verified')
}

void main()
