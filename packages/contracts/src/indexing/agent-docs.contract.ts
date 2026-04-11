export interface ListAgentDocsResponse {
  items: Array<{
    fileName: string
    content: string
  }>
}

export interface SaveAgentDocResponse {
  ok: true
}
