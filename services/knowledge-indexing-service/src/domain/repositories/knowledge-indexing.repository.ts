import type { DataSourceRecord, IngestionJobRecord, SourceDocumentRecord } from '../../../../../types'

export interface KnowledgeIndexingRepository {
  saveDataSource(record: DataSourceRecord): Promise<void>
  getDataSourceById(dataSourceId: string): Promise<DataSourceRecord | undefined>
  listDataSourcesByTenant(tenantId: string): Promise<DataSourceRecord[]>
  saveIngestionJob(record: IngestionJobRecord): Promise<void>
  getIngestionJobById(jobId: string): Promise<IngestionJobRecord | undefined>
  listIngestionJobsByTenant(tenantId: string): Promise<IngestionJobRecord[]>
  listSourceDocumentsByTenant(tenantId: string): Promise<SourceDocumentRecord[]>
  countDocumentChunksByTenant(tenantId: string): Promise<number>
}
