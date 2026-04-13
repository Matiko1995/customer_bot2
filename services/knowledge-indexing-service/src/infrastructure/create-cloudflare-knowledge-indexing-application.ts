import { createObjectStorageProvider } from '../../../../server/lib/object-storage/object-storage.ts'
import { createCloudflareQueuePublisher } from '../../../../server/lib/tasks/cloudflare-queue-publisher.ts'
import { createQueuedIngestionJob } from '../../../../server/lib/ingestion/jobs.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { getCloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/runtime.ts'
import { saveTenantAsset } from '../../../../server/lib/assets/file-asset-store.ts'
import { LocalAgentDocsGateway } from './agent-docs.gateway.ts'
import { D1KnowledgeIndexingRepository } from './d1-knowledge-indexing.repository.ts'
import { KnowledgeIndexingApplication } from '../knowledge-indexing.application.ts'

export function createCloudflareKnowledgeIndexingApplication(bindings?: CloudflareRuntimeBindings) {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (!runtimeBindings?.TENANT_IDENTITY_DB) {
    throw new Error('TENANT_IDENTITY_DB binding is required')
  }

  const repository = new D1KnowledgeIndexingRepository(runtimeBindings.TENANT_IDENTITY_DB)
  const objectStorage = createObjectStorageProvider(runtimeBindings)
  const queuePublisher = createCloudflareQueuePublisher(runtimeBindings)
  const agentDocsGateway = new LocalAgentDocsGateway(objectStorage)

  return new KnowledgeIndexingApplication({
    repository,
    agentDocsGateway,
    sourceAssetStore: {
      save: (input) => saveTenantAsset(input, objectStorage)
    },
    triggerSync: async ({ tenantId, sourceId, triggerMode }) => {
      const source = await repository.getDataSourceById(sourceId)
      if (!source || source.tenantId !== tenantId) {
        throw new Error('Source not found')
      }

      if (source.status === 'disabled') {
        throw new Error('Source is disabled')
      }

      const job = createQueuedIngestionJob({
        tenantId,
        dataSourceId: source.id,
        triggerMode
      })

      await repository.saveIngestionJob(job)
      await queuePublisher.publish({
        type: 'knowledge-indexing.sync',
        payload: {
          tenantId,
          sourceId: source.id,
          jobId: job.id,
          triggerMode
        }
      })

      return {
        item: job,
        documentCount: 0,
        chunkCount: 0
      }
    }
  })
}
