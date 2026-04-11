import { executeIngestionJob } from '../../../../server/lib/ingestion/execute-job.ts'
import { createSourceDocumentLoader } from '../../../../server/lib/ingestion/load-source-documents.ts'
import { saveTenantAsset } from '../../../../server/lib/assets/file-asset-store.ts'
import { getStorage } from '../../../../server/lib/storage/index.ts'
import { LocalAgentDocsGateway } from './agent-docs.gateway.ts'
import { RagRepositoryKnowledgeIndexingAdapter } from './rag-repository.adapter.ts'
import { KnowledgeIndexingApplication } from '../knowledge-indexing.application.ts'
import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import { normalizeTenantRagSettings } from '../../../../packages/shared-config/src/rag-settings.ts'

export function createKnowledgeIndexingApplication(repository: RagRepository) {
  const adapter = new RagRepositoryKnowledgeIndexingAdapter(repository)
  const agentDocsGateway = new LocalAgentDocsGateway()

  return new KnowledgeIndexingApplication({
    repository: adapter,
    agentDocsGateway,
    sourceAssetStore: {
      save: (input) => saveTenantAsset(input)
    },
    triggerSync: async ({ tenantId, sourceId, triggerMode }) => {
      const source = await repository.getDataSourceById(sourceId)
      if (!source || source.tenantId !== tenantId) {
        throw new Error('Source not found')
      }

      if (source.status === 'disabled') {
        throw new Error('Source is disabled')
      }

      const tenant = await getStorage().getTenantById(tenantId)
      const ragSettings = normalizeTenantRagSettings(tenant?.ragSettings)

      const result = await executeIngestionJob({
        tenantId,
        dataSourceId: source.id,
        triggerMode,
        repository,
        loadDocuments: createSourceDocumentLoader(source),
        chunking: {
          maxCharacters: ragSettings.chunkSize,
          overlapCharacters: ragSettings.chunkOverlap,
          structureTemplate: ragSettings.ingestionStructureTemplate
        }
      })

      await repository.saveDataSource({
        ...source,
        lastSyncedAt: Date.now(),
        updatedAt: Date.now()
      })

      return {
        item: result.job,
        documentCount: result.documentCount,
        chunkCount: result.chunkCount
      }
    }
  })
}
