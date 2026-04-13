export interface QueuePublishMessage {
  type: string
  payload: Record<string, unknown>
}

export interface QueuePublisher {
  kind: 'local' | 'cloudflare'
  publish(message: QueuePublishMessage): Promise<void>
}
