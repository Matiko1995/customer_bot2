import type { IndexStatsResponse, ListJobsResponse, ReindexAllResponse, RetryJobResponse } from '../../../../../packages/contracts/src/indexing/job.contract.ts'
import type { KnowledgeIndexingApplication } from '../../knowledge-indexing.application.ts'

export class JobsController {
  private readonly application: KnowledgeIndexingApplication

  constructor(application: KnowledgeIndexingApplication) {
    this.application = application
  }

  list(tenantId: string): Promise<ListJobsResponse> {
    return this.application.listJobs(tenantId)
  }

  stats(tenantId: string): Promise<IndexStatsResponse> {
    return this.application.getIndexStats(tenantId)
  }

  retry(input: { tenantId: string; jobId: string }): Promise<RetryJobResponse> {
    return this.application.retryJob(input)
  }

  reindexAll(input: { tenantId: string }): Promise<ReindexAllResponse> {
    return this.application.reindexAll(input.tenantId)
  }
}
