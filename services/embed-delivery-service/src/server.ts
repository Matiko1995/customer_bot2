import { createServer } from 'node:http'
import { createStorage } from '../../../server/lib/storage/index.ts'
import { createEmbedDeliveryApplication } from './infrastructure/create-embed-delivery-application.ts'
import { createEmbedDeliveryStandaloneHandler } from './http/standalone-routes.ts'

const port = Number(process.env.EMBED_DELIVERY_PORT || 3304)

const storage = createStorage()
const application = createEmbedDeliveryApplication(storage)
const handler = createEmbedDeliveryStandaloneHandler(application)

createServer((request, response) => {
  void handler(request, response)
}).listen(port, '127.0.0.1', () => {
  console.log(`embed-delivery-service listening on http://127.0.0.1:${port}`)
})
