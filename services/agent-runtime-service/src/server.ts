import { createServer } from 'node:http'
import { createRagRepository, createStorage } from '../../../server/lib/storage/index.ts'
import { createAgentRuntimeApplication } from './infrastructure/create-agent-runtime-application.ts'
import { createAgentRuntimeStandaloneHandler } from './http/standalone-routes.ts'

const port = Number(process.env.AGENT_RUNTIME_PORT || 3303)

const storage = createStorage()
const ragRepository = createRagRepository()
const application = createAgentRuntimeApplication({
  storage,
  ragRepository
})
const handler = createAgentRuntimeStandaloneHandler(application)

createServer((request, response) => {
  void handler(request, response)
}).listen(port, '127.0.0.1', () => {
  console.log(`agent-runtime-service listening on http://127.0.0.1:${port}`)
})
