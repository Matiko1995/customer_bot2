import { normalizeDocument, type NormalizedSourceDocument } from '../normalize-document.ts'

export interface WebsiteFetcherResponse {
  ok: boolean
  text(): Promise<string>
}

export interface ExtractWebsiteDocumentsInput {
  startUrl: string
  allowedDomains: string[]
  maxPages: number
  fetcher?: (url: string) => Promise<WebsiteFetcherResponse>
}

function isAllowedUrl(url: string, allowedDomains: string[]): boolean {
  const hostname = new URL(url).hostname.toLowerCase()
  return allowedDomains.some((domain) => hostname === domain.toLowerCase() || hostname.endsWith(`.${domain.toLowerCase()}`))
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is)
  return match?.[1]?.replace(/\s+/g, ' ').trim() || 'Untitled Page'
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function extractWebsiteDocuments(input: ExtractWebsiteDocumentsInput): Promise<NormalizedSourceDocument[]> {
  if (input.maxPages <= 0 || !isAllowedUrl(input.startUrl, input.allowedDomains)) {
    return []
  }

  const fetcher = input.fetcher ?? fetch
  const response = await fetcher(input.startUrl)
  if (!response.ok) {
    return []
  }

  const html = await response.text()

  return [
    normalizeDocument({
      title: extractTitle(html),
      mimeType: 'text/html',
      sourceUri: input.startUrl,
      contentText: stripHtml(html),
      metadata: {
        parser: 'webpage-basic',
        startUrl: input.startUrl
      }
    })
  ]
}
