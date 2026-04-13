import type { DataSourceRecord, DocumentChunkRecord, IngestionJobRecord, SourceDocumentRecord } from '../../../../../types'

export interface KnowledgeIndexingRepository {
  saveDataSource(record: DataSourceRecord): Promise<void>
  getDataSourceById(dataSourceId: string): Promise<DataSourceRecord | undefined>
  listDataSourcesByTenant(tenantId: string): Promise<DataSourceRecord[]>
  saveIngestionJob(record: IngestionJobRecord): Promise<void>
  getIngestionJobById(jobId: string): Promise<IngestionJobRecord | undefined>
  listIngestionJobsByTenant(tenantId: string): Promise<IngestionJobRecord[]>
  saveSourceDocument(record: SourceDocumentRecord): Promise<void>
  listSourceDocumentsByTenant(tenantId: string): Promise<SourceDocumentRecord[]>
  replaceDocumentChunks(documentId: string, chunks: DocumentChunkRecord[]): Promise<void>
  listDocumentChunksByDocument(documentId: string): Promise<DocumentChunkRecord[]>
  countDocumentChunksByTenant(tenantId: string): Promise<number>
}
