export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>
  run(): Promise<unknown>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>
}

export interface R2ObjectBody {
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
}

export interface R2Object {
  key: string
  body?: R2ObjectBody | null
  text(): Promise<string>
  arrayBuffer(): Promise<ArrayBuffer>
}

export interface R2Bucket {
  get(key: string): Promise<R2Object | null>
  put(key: string, value: ArrayBuffer | ArrayBufferView | string): Promise<unknown>
  list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string }> }>
  delete(key: string): Promise<void>
}

export interface QueueMessage<T = unknown> {
  body: T
}

export interface QueueSendOptions {
  contentType?: 'json' | 'text' | 'bytes'
}

export interface Queue<T = unknown> {
  send(message: T, options?: QueueSendOptions): Promise<void>
}

export interface VectorizeMatch {
  id: string
  score: number
  metadata?: Record<string, unknown>
}

export interface VectorizeIndex {
  upsert(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>): Promise<void>
  query(vector: number[], options?: {
    topK?: number
    filter?: Record<string, unknown>
    returnMetadata?: boolean
  }): Promise<{ matches: VectorizeMatch[] }>
}

export interface AssetsBinding {
  fetch(input: Request | string): Promise<Response>
}

export interface CloudflareRuntimeBindings {
  ASSETS?: AssetsBinding
  TENANT_IDENTITY_DB?: D1Database
  CUSTOMER_BOT_BUCKET?: R2Bucket
  INGESTION_QUEUE?: Queue<Record<string, unknown>>
  CUSTOMER_BOT_VECTOR_INDEX?: VectorizeIndex
}
