export type ServiceName =
  | 'tenant-identity-service'
  | 'knowledge-indexing-service'
  | 'agent-runtime-service'
  | 'embed-delivery-service'

const ENV_KEYS: Record<ServiceName, string> = {
  'tenant-identity-service': 'TENANT_IDENTITY_SERVICE_URL',
  'knowledge-indexing-service': 'KNOWLEDGE_INDEXING_SERVICE_URL',
  'agent-runtime-service': 'AGENT_RUNTIME_SERVICE_URL',
  'embed-delivery-service': 'EMBED_DELIVERY_SERVICE_URL'
}

export function getServiceBaseUrl(service: ServiceName): string {
  return process.env[ENV_KEYS[service]]?.trim() || ''
}

export function isRemoteServiceEnabled(service: ServiceName): boolean {
  return Boolean(getServiceBaseUrl(service))
}
