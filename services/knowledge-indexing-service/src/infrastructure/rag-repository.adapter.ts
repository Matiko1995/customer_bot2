import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import type { KnowledgeIndexingRepository } from '../domain/repositories/knowledge-indexing.repository.ts'

export class RagRepositoryKnowledgeIndexingAdapter implements KnowledgeIndexingRepository {
  private readonly repository: RagRepository

  constructor(repository: RagRepository) {
    this.repository = repository
  }

  saveDataSource(record: Parameters<RagRepository['saveDataSource']>[0]) {
    return this.repository.saveDataSource(record)
  }

  getDataSourceById(dataSourceId: string) {
    return this.repository.getDataSourceById(dataSourceId)
  }

  listDataSourcesByTenant(tenantId: string) {
    return this.repository.listDataSourcesByTenant(tenantId)
  }

  saveIngestionJob(record: Parameters<RagRepository['saveIngestionJob']>[0]) {
    return this.repository.saveIngestionJob(record)
  }

  getIngestionJobById(jobId: string) {
    return this.repository.getIngestionJobById(jobId)
  }

  listIngestionJobsByTenant(tenantId: string) {
    return this.repository.listIngestionJobsByTenant(tenantId)
  }

  saveSourceDocument(record: Parameters<RagRepository['saveDocument']>[0]) {
    return this.repository.saveDocument(record)
  }

  listSourceDocumentsByTenant(tenantId: string) {
    return this.repository.listDocumentsByTenant(tenantId)
  }

  replaceDocumentChunks(documentId: string, chunks: Parameters<RagRepository['replaceDocumentChunks']>[1]) {
    return this.repository.replaceDocumentChunks(documentId, chunks)
  }

  listDocumentChunksByDocument(documentId: string) {
    return this.repository.listChunksByDocument(documentId)
  }

  async countDocumentChunksByTenant(tenantId: string) {
    const documents = await this.repository.listDocumentsByTenant(tenantId)
    let total = 0

    for (const document of documents) {
      const chunks = await this.repository.listChunksByDocument(document.id)
      total += chunks.length
    }

    return total
  }
}
