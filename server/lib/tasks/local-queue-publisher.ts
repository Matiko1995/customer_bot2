import type { QueuePublisher, QueuePublishMessage } from './queue-publisher.ts'

export interface LocalQueuePublisher extends QueuePublisher {
  published: QueuePublishMessage[]
}

export function createLocalQueuePublisher(): LocalQueuePublisher {
  const published: QueuePublishMessage[] = []

  return {
    kind: 'local',
    published,
    async publish(message) {
      published.push(structuredClone(message))
    }
  }
}
