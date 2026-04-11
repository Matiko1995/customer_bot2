import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { createEmbedDeliveryApplication } from './create-embed-delivery-application.ts'
import { createEmbedDeliveryHttpLayer } from '../http/routes.ts'

export function createEmbedDeliveryHttpAdapter(storage: StorageRepository) {
  const application = createEmbedDeliveryApplication(storage)
  return createEmbedDeliveryHttpLayer(application)
}
