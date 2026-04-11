import { createServer } from 'node:http'
import { createStorage } from '../../../server/lib/storage/index.ts'
import { createTenantIdentityApplication } from './infrastructure/create-tenant-identity-application.ts'
import { createTenantIdentityStandaloneHandler } from './http/standalone-routes.ts'

const port = Number(process.env.TENANT_IDENTITY_PORT || 3301)

const storage = createStorage()
const application = createTenantIdentityApplication(storage)
const handler = createTenantIdentityStandaloneHandler(application)

createServer((request, response) => {
  void handler(request, response)
}).listen(port, '127.0.0.1', () => {
  console.log(`tenant-identity-service listening on http://127.0.0.1:${port}`)
})
