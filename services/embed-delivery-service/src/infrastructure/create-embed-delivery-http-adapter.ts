import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { createEmbedDeliveryApplication } from './create-embed-delivery-application.ts'
import { createCloudflareEmbedDeliveryApplication } from './create-cloudflare-embed-delivery-application.ts'
import { createEmbedDeliveryHttpLayer } from '../http/routes.ts'

export function createEmbedDeliveryHttpAdapter(
  input: StorageRepository | { storage?: StorageRepository; bindings?: CloudflareRuntimeBindings }
) {
  const application =
    'saveTenant' in input
      ? createEmbedDeliveryApplication(input)
      : input.bindings?.TENANT_IDENTITY_DB
        ? createCloudflareEmbedDeliveryApplication(input.bindings)
        : createEmbedDeliveryApplication(input.storage as StorageRepository)

  return createEmbedDeliveryHttpLayer(application)
}
