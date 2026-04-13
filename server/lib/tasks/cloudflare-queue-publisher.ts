import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'
import type { QueuePublisher, QueuePublishMessage } from './queue-publisher.ts'

export function createCloudflareQueuePublisher(bindings?: CloudflareRuntimeBindings): QueuePublisher {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)

  return {
    kind: 'cloudflare',
    async publish(message: QueuePublishMessage) {
      if (!runtimeBindings?.INGESTION_QUEUE) {
        throw new Error('Cloudflare queue binding is unavailable')
      }

      await runtimeBindings.INGESTION_QUEUE.send(message)
    }
  }
}
