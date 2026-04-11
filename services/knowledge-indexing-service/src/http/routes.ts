import type { KnowledgeIndexingApplication } from '../knowledge-indexing.application.ts'
import { SourcesController } from './controllers/sources.controller.ts'
import { JobsController } from './controllers/jobs.controller.ts'
import { AgentDocsController } from './controllers/agent-docs.controller.ts'

export function createKnowledgeIndexingHttpLayer(application: KnowledgeIndexingApplication) {
  return {
    sources: new SourcesController(application),
    jobs: new JobsController(application),
    agentDocs: new AgentDocsController(application)
  }
}
