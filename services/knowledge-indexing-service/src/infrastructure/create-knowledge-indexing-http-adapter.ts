import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { createKnowledgeIndexingApplication } from './create-knowledge-indexing-application.ts'
import { createCloudflareKnowledgeIndexingApplication } from './create-cloudflare-knowledge-indexing-application.ts'
import { createKnowledgeIndexingHttpLayer } from '../http/routes.ts'

export function createKnowledgeIndexingHttpAdapter(
  input: RagRepository | { repository?: RagRepository; bindings?: CloudflareRuntimeBindings }
) {
  const application =
    'saveDataSource' in input
      ? createKnowledgeIndexingApplication(input)
      : input.bindings?.TENANT_IDENTITY_DB
        ? createCloudflareKnowledgeIndexingApplication(input.bindings)
        : createKnowledgeIndexingApplication(input.repository as RagRepository)

  return createKnowledgeIndexingHttpLayer(application)
}
