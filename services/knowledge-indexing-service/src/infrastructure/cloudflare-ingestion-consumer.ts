import { createContentHash } from '../../../../server/lib/ingestion/normalize-document.ts'
import { chunkDocument } from '../../../../server/lib/ingestion/chunk-document.ts'
import { embedChunks } from '../../../../server/lib/ingestion/embed-chunks.ts'
import { createSourceDocumentLoader } from '../../../../server/lib/ingestion/load-source-documents.ts'
import { generateAgentDocBundle } from '../../../../server/lib/agent-docs/generate-agent-doc-bundle.ts'
import { markJobFailed, markJobRunning, markJobSucceeded } from '../../../../server/lib/ingestion/jobs.ts'
import { setCloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/runtime.ts'
import { resetObjectStorageProvider } from '../../../../server/lib/object-storage/object-storage.ts'
import { createVectorIndexProvider } from '../../../../server/lib/vector-index/vector-index-provider.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import type { DocumentChunkRecord, SourceDocumentRecord } from '../../../../types'
import { normalizeTenantRagSettings } from '../../../../packages/shared-config/src/rag-settings.ts'
import { createCloudflareTenantIdentityStorage } from '../../../tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'
import { D1KnowledgeIndexingRepository } from './d1-knowledge-indexing.repository.ts'

function nextDocumentId(prefix = 'document'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nextChunkId(prefix = 'chunk'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function processCloudflareIngestionMessage(input: {
  bindings: CloudflareRuntimeBindings
  payload: {
    tenantId: string
    sourceId: string
    jobId: string
    triggerMode: 'manual' | 'scheduled' | 'retry'
  }
}) {
  setCloudflareRuntimeBindings(input.bindings)
  resetObjectStorageProvider()

  const repository = new D1KnowledgeIndexingRepository(input.bindings.TENANT_IDENTITY_DB!)
  const tenantStorage = createCloudflareTenantIdentityStorage(input.bindings)
  const source = await repository.getDataSourceById(input.payload.sourceId)
  const tenant = await tenantStorage.getTenantById(input.payload.tenantId)
  const job = await repository.getIngestionJobById(input.payload.jobId)

  if (!source || !job || !tenant) {
    throw new Error('Cloudflare ingestion payload references missing tenant/source/job')
  }

  const ragSettings = normalizeTenantRagSettings(tenant.ragSettings)
  const vectorIndex = createVectorIndexProvider(input.bindings)
  const now = Date.now()

  try {
    await repository.saveIngestionJob(markJobRunning(job, now))

    const documents = await createSourceDocumentLoader(source)()
    let chunkCount = 0
    const documentRecords: SourceDocumentRecord[] = []

    for (const document of documents) {
      const documentId = nextDocumentId()
      const embeddedChunks = await embedChunks(
        chunkDocument(document, {
          maxCharacters: ragSettings.chunkSize,
          overlapCharacters: ragSettings.chunkOverlap,
          structureTemplate: ragSettings.ingestionStructureTemplate
        })
      )

      const chunkRecords: DocumentChunkRecord[] = embeddedChunks.map((chunk) => ({
        id: nextChunkId(),
        tenantId: input.payload.tenantId,
        documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        metadata: chunk.metadata,
        embedding: chunk.embedding,
        createdAt: now
      }))

      const documentRecord: SourceDocumentRecord = {
        id: documentId,
        tenantId: input.payload.tenantId,
        dataSourceId: source.id,
        externalId: document.externalId,
        title: document.title,
        mimeType: document.mimeType,
        sourceUri: document.sourceUri,
        contentText: document.contentText,
        metadata: {
          ...document.metadata,
          chunkCount: chunkRecords.length
        },
        contentHash: createContentHash(document.contentText),
        versionHash: createContentHash(document.contentText),
        createdAt: now,
        updatedAt: now
      }

      await repository.saveSourceDocument(documentRecord)
      await repository.replaceDocumentChunks(documentRecord.id, chunkRecords)
      await vectorIndex.upsert(
        chunkRecords.map((chunk) => ({
          id: chunk.id,
          values: chunk.embedding || [],
          metadata: {
            tenantId: chunk.tenantId,
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            title: documentRecord.title,
            sourceUri: documentRecord.sourceUri
          }
        }))
      )

      documentRecords.push(documentRecord)
      chunkCount += chunkRecords.length
    }

    await generateAgentDocBundle({
      tenantId: input.payload.tenantId,
      documents,
      generatedAt: now
    })

    await repository.saveDataSource({
      ...source,
      lastSyncedAt: now,
      updatedAt: now
    })

    await repository.saveIngestionJob(
      markJobSucceeded(job, now, {
        documentCount: documentRecords.length,
        chunkCount
      })
    )
  } catch (error) {
    await repository.saveIngestionJob(
      markJobFailed(job, now, error instanceof Error ? error.message : 'Cloudflare ingestion failed')
    )
    throw error
  } finally {
    setCloudflareRuntimeBindings(undefined)
    resetObjectStorageProvider()
  }
}
