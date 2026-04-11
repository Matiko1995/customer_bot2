import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import { createKnowledgeIndexingApplication } from './create-knowledge-indexing-application.ts'
import { createKnowledgeIndexingHttpLayer } from '../http/routes.ts'

export function createKnowledgeIndexingHttpAdapter(repository: RagRepository) {
  const application = createKnowledgeIndexingApplication(repository)
  return createKnowledgeIndexingHttpLayer(application)
}
