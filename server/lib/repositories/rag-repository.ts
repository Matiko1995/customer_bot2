import type {
  DataSourceRecord,
  DocumentChunkRecord,
  IngestionJobRecord,
  SourceDocumentRecord
} from '../../../types'

export interface RagRepository {
  saveDataSource(record: DataSourceRecord): Promise<void>
  getDataSourceById(dataSourceId: string): Promise<DataSourceRecord | undefined>
  listDataSourcesByTenant(tenantId: string): Promise<DataSourceRecord[]>
  saveIngestionJob(record: IngestionJobRecord): Promise<void>
  getIngestionJobById(jobId: string): Promise<IngestionJobRecord | undefined>
  listIngestionJobsByTenant(tenantId: string): Promise<IngestionJobRecord[]>
  saveDocument(record: SourceDocumentRecord): Promise<void>
  getDocumentById(documentId: string): Promise<SourceDocumentRecord | undefined>
  listDocumentsByTenant(tenantId: string): Promise<SourceDocumentRecord[]>
  replaceDocumentChunks(documentId: string, chunks: DocumentChunkRecord[]): Promise<void>
  listChunksByDocument(documentId: string): Promise<DocumentChunkRecord[]>
}

function cloneRecord<T>(value: T): T {
  return structuredClone(value)
}

export function createInMemoryRagRepository(): RagRepository {
  const dataSources = new Map<string, DataSourceRecord>()
  const jobs = new Map<string, IngestionJobRecord>()
  const documents = new Map<string, SourceDocumentRecord>()
  const chunksByDocument = new Map<string, DocumentChunkRecord[]>()

  return {
    async saveDataSource(record) {
      dataSources.set(record.id, cloneRecord(record))
    },
    async getDataSourceById(dataSourceId) {
      const record = dataSources.get(dataSourceId)
      return record ? cloneRecord(record) : undefined
    },
    async listDataSourcesByTenant(tenantId) {
      return Array.from(dataSources.values())
        .filter((record) => record.tenantId === tenantId)
        .map(cloneRecord)
    },
    async saveIngestionJob(record) {
      jobs.set(record.id, cloneRecord(record))
    },
    async getIngestionJobById(jobId) {
      const record = jobs.get(jobId)
      return record ? cloneRecord(record) : undefined
    },
    async listIngestionJobsByTenant(tenantId) {
      return Array.from(jobs.values())
        .filter((record) => record.tenantId === tenantId)
        .map(cloneRecord)
    },
    async saveDocument(record) {
      documents.set(record.id, cloneRecord(record))
    },
    async getDocumentById(documentId) {
      const record = documents.get(documentId)
      return record ? cloneRecord(record) : undefined
    },
    async listDocumentsByTenant(tenantId) {
      return Array.from(documents.values())
        .filter((record) => record.tenantId === tenantId)
        .map(cloneRecord)
    },
    async replaceDocumentChunks(documentId, chunks) {
      chunksByDocument.set(documentId, chunks.map(cloneRecord))
    },
    async listChunksByDocument(documentId) {
      return (chunksByDocument.get(documentId) ?? []).map(cloneRecord)
    }
  }
}
