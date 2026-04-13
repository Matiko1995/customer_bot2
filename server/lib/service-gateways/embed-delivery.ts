import { createEmbedDeliveryHttpAdapter } from '../../../services/embed-delivery-service/src/infrastructure/create-embed-delivery-http-adapter.ts'
import { getServiceBaseUrl } from '../../../packages/shared-config/src/service-endpoints.ts'
import { requestJson, requestText, type GatewayHttpOptions } from './http.ts'
import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'
import type { StorageRepository } from '../storage/types.ts'

export function createEmbedDeliveryGateway(
  input: StorageRepository | ({ storage?: StorageRepository; bindings?: CloudflareRuntimeBindings } & GatewayHttpOptions)
) {
  const storage = 'saveTenant' in input ? input : input.storage
  const bindings = 'saveTenant' in input ? undefined : input.bindings
  const baseUrl = 'saveTenant' in input ? getServiceBaseUrl('embed-delivery-service') : input.baseUrl || getServiceBaseUrl('embed-delivery-service')
  const fetcher = 'saveTenant' in input ? undefined : input.fetcher
  const http = 'saveTenant' in input
    ? createEmbedDeliveryHttpAdapter(input)
    : createEmbedDeliveryHttpAdapter({ storage, bindings })

  return {
    runtimeConfig(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/embed/runtime-config?tenantId=${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.embedConfig.execute({ tenantId })
    },
    widgetScript() {
      if (baseUrl) {
        return requestText({
          baseUrl,
          path: '/embed/widget-script',
          fetcher
        }).then((result) => ({
          code: result.text,
          contentType: result.contentType,
          cacheControl: result.cacheControl
        }))
      }

      return http.widgetScript.execute()
    }
  }
}
