import { createServer } from 'node:http'
import { createRagRepository } from '../../../server/lib/storage/index.ts'
import { createKnowledgeIndexingApplication } from './infrastructure/create-knowledge-indexing-application.ts'
import { createKnowledgeIndexingStandaloneHandler } from './http/standalone-routes.ts'

const port = Number(process.env.KNOWLEDGE_INDEXING_PORT || 3302)

const repository = createRagRepository()
const application = createKnowledgeIndexingApplication(repository)
const handler = createKnowledgeIndexingStandaloneHandler(application)

createServer((request, response) => {
  void handler(request, response)
}).listen(port, '127.0.0.1', () => {
  console.log(`knowledge-indexing-service listening on http://127.0.0.1:${port}`)
})
