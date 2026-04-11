import type { CitationRecord, CredentialSource, MessageAttachment, RetrievalConfidence, AnswerSource } from '../../../../types'

export interface ChatRequest {
  tenantId: string
  message: string
  sessionId?: string
  attachments?: MessageAttachment[]
}

export interface ChatResponse {
  reply: string
  sessionId: string
  answerSource: AnswerSource
  credentialSource: CredentialSource
  citations: CitationRecord[]
  retrievalConfidence: RetrievalConfidence
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}
