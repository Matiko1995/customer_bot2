export interface ContactRequest {
  tenantId: string
  sessionId?: string
  name: string
  company: string
  demandType: string
  contact: string
  message?: string
}

export interface ContactResponse {
  ok: true
  id: string
  message: string
}
