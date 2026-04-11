import type {
  CreateSourceRequest,
  CreateSourceResponse,
  DisableSourceResponse,
  ListSourcesResponse,
  TriggerSourceSyncResponse,
  UpdateSourceRequest,
  UpdateSourceResponse,
  UploadSourceAssetResponse
} from '../../../packages/contracts/src/indexing/source.contract.ts'
import type { IndexStatsResponse, ListJobsResponse, ReindexAllResponse, RetryJobResponse } from '../../../packages/contracts/src/indexing/job.contract.ts'
import type { ListAgentDocsResponse, SaveAgentDocResponse } from '../../../packages/contracts/src/indexing/agent-docs.contract.ts'
import { ListSourcesUseCase } from './modules/sources/use-cases/list-sources.use-case.ts'
import { CreateSourceUseCase } from './modules/sources/use-cases/create-source.use-case.ts'
import { DisableSourceUseCase } from './modules/sources/use-cases/disable-source.use-case.ts'
import { UpdateSourceUseCase } from './modules/sources/use-cases/update-source.use-case.ts'
import { UploadSourceAssetUseCase, type SourceAssetStore } from './modules/sources/use-cases/upload-source-asset.use-case.ts'
import { ListJobsUseCase } from './modules/jobs/use-cases/list-jobs.use-case.ts'
import { ListAgentDocsUseCase, SaveAgentDocUseCase, type AgentDocsGateway } from './modules/agent-docs/use-cases/list-agent-docs.use-case.ts'
import type { KnowledgeIndexingRepository } from './domain/repositories/knowledge-indexing.repository.ts'

export interface KnowledgeIndexingApplicationDependencies {
  repository: KnowledgeIndexingRepository
  agentDocsGateway: AgentDocsGateway
  sourceAssetStore: SourceAssetStore
  triggerSync: (input: { tenantId: string; sourceId: string; triggerMode: 'manual' | 'retry' }) => Promise<{
    item: { id: string; tenantId: string; dataSourceId: string; triggerMode: 'manual' | 'scheduled' | 'retry'; status: 'queued' | 'running' | 'succeeded' | 'failed'; startedAt?: number; finishedAt?: number; errorMessage?: string; stats: Record<string, unknown> }
    documentCount: number
    chunkCount: number
  }>
}

export class KnowledgeIndexingApplication {
  private readonly deps: KnowledgeIndexingApplicationDependencies

  constructor(deps: KnowledgeIndexingApplicationDependencies) {
    this.deps = deps
  }

  listSources(tenantId: string): Promise<ListSourcesResponse> {
    return new ListSourcesUseCase(this.deps.repository).execute(tenantId)
  }

  createSource(input: { tenantId: string } & CreateSourceRequest): Promise<CreateSourceResponse> {
    return new CreateSourceUseCase(this.deps.repository).execute(input)
  }

  disableSource(input: { tenantId: string; sourceId: string }): Promise<DisableSourceResponse> {
    return new DisableSourceUseCase(this.deps.repository).execute(input)
  }

  updateSource(input: { tenantId: string; sourceId: string } & UpdateSourceRequest): Promise<UpdateSourceResponse> {
    return new UpdateSourceUseCase(this.deps.repository).execute(input)
  }

  uploadSourceAsset(input: {
    tenantId: string
    sourceId: string
    fileName: string
    mimeType: string
    base64Data: string
  }): Promise<UploadSourceAssetResponse> {
    return new UploadSourceAssetUseCase(this.deps.repository, this.deps.sourceAssetStore).execute(input)
  }

  listJobs(tenantId: string): Promise<ListJobsResponse> {
    return new ListJobsUseCase(this.deps.repository).execute(tenantId)
  }

  async getIndexStats(tenantId: string): Promise<IndexStatsResponse> {
    const [jobs, documents, chunkCount] = await Promise.all([
      this.deps.repository.listIngestionJobsByTenant(tenantId),
      this.deps.repository.listSourceDocumentsByTenant(tenantId),
      this.deps.repository.countDocumentChunksByTenant(tenantId)
    ])

    const lastSuccessfulSyncAt = jobs
      .filter((item) => item.status === 'succeeded')
      .map((item) => item.finishedAt ?? item.startedAt ?? 0)
      .sort((left, right) => right - left)[0]

    return {
      documentCount: documents.length,
      chunkCount,
      lastSuccessfulSyncAt: lastSuccessfulSyncAt || undefined
    }
  }

  listAgentDocs(tenantId: string): Promise<ListAgentDocsResponse> {
    return new ListAgentDocsUseCase(this.deps.agentDocsGateway).execute(tenantId)
  }

  saveAgentDoc(input: { tenantId: string; fileName: string; content: string }): Promise<SaveAgentDocResponse> {
    return new SaveAgentDocUseCase(this.deps.agentDocsGateway).execute(input)
  }

  async triggerSourceSync(input: { tenantId: string; sourceId: string }): Promise<TriggerSourceSyncResponse> {
    const result = await this.deps.triggerSync({
      tenantId: input.tenantId,
      sourceId: input.sourceId,
      triggerMode: 'manual'
    })

    return {
      ok: true,
      item: result.item,
      documentCount: result.documentCount,
      chunkCount: result.chunkCount
    }
  }

  async retryJob(input: { tenantId: string; jobId: string }): Promise<RetryJobResponse> {
    const job = await this.deps.repository.getIngestionJobById(input.jobId)
    if (!job || job.tenantId !== input.tenantId) {
      throw new Error('Job not found')
    }

    const result = await this.deps.triggerSync({
      tenantId: input.tenantId,
      sourceId: job.dataSourceId,
      triggerMode: 'retry'
    })

    return {
      ok: true,
      item: result.item,
      documentCount: result.documentCount,
      chunkCount: result.chunkCount
    }
  }

  async reindexAll(tenantId: string): Promise<ReindexAllResponse> {
    const sources = await this.deps.repository.listDataSourcesByTenant(tenantId)
    const activeSources = sources.filter((item) => item.status === 'active')
    const jobs: RetryJobResponse['item'][] = []
    const failures: ReindexAllResponse['failures'] = []
    let documentCount = 0
    let chunkCount = 0

    for (const source of activeSources) {
      try {
        const result = await this.deps.triggerSync({
          tenantId,
          sourceId: source.id,
          triggerMode: 'manual'
        })
        jobs.push(result.item)
        documentCount += result.documentCount
        chunkCount += result.chunkCount
      } catch (error) {
        failures.push({
          sourceId: source.id,
          message: error instanceof Error ? error.message : 'Reindex failed'
        })
      }
    }

    return {
      ok: true,
      triggeredSourceCount: activeSources.length,
      successCount: jobs.length,
      failureCount: failures.length,
      documentCount,
      chunkCount,
      jobs,
      failures
    }
  }
}
