import { basename, extname } from 'node:path'
import { readTenantAsset } from '../../assets/file-asset-store.ts'
import { normalizeDocument, type NormalizedSourceDocument } from '../normalize-document.ts'

export interface ParseUploadedAssetInput {
  tenantId: string
  assetPath: string
  fileName: string
  mimeType: string
}

function getFileStem(fileName: string): string {
  const extension = extname(fileName)
  return basename(fileName, extension)
}

function buildSourceUri(input: ParseUploadedAssetInput): string {
  return `asset://${input.tenantId}/${input.fileName}`
}

function parseCsvText(content: string): string {
  const rows = content
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)

  if (rows.length === 0) {
    return ''
  }

  const header = rows[0].split(',').map((item) => item.trim())
  const body = rows.slice(1)

  if (header.length <= 1 || body.length === 0) {
    return rows.join('\n')
  }

  return body
    .map((row) => {
      const values = row.split(',').map((item) => item.trim())
      return header.map((key, index) => `${key}: ${values[index] ?? ''}`).join('\n')
    })
    .join('\n\n')
}

async function parseDocxAsset(input: ParseUploadedAssetInput): Promise<NormalizedSourceDocument[]> {
  const { importOptionalModule } = await import('../../optional-module.ts')
  const mammoth = await importOptionalModule<{ extractRawText(input: { path: string }): Promise<{ value: string }> }>(
    'mammoth',
    'npm install mammoth'
  )
  const result = await mammoth.extractRawText({ path: input.assetPath })

  return [
    normalizeDocument({
      title: getFileStem(input.fileName),
      mimeType: input.mimeType,
      sourceUri: buildSourceUri(input),
      contentText: result.value,
      metadata: {
        fileName: input.fileName,
        parser: 'mammoth'
      }
    })
  ]
}

async function parseSpreadsheetAsset(input: ParseUploadedAssetInput): Promise<NormalizedSourceDocument[]> {
  const { importOptionalModule } = await import('../../optional-module.ts')
  const xlsx = await importOptionalModule<{
    readFile(path: string): {
      SheetNames: string[]
      Sheets: Record<string, unknown>
    }
    utils: {
      sheet_to_json<T = unknown>(sheet: unknown, options?: { header?: number; blankrows?: boolean }): T[]
    }
  }>('xlsx', 'npm install xlsx')
  const workbook = xlsx.readFile(input.assetPath)

  return workbook.SheetNames.map((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json<Array<string | number | boolean | null>>(worksheet, {
      header: 1,
      blankrows: false
    })

    const contentText = rows
      .map((row: Array<string | number | boolean | null>) => row.map((cell: string | number | boolean | null) => String(cell ?? '')).join(' | ').trim())
      .filter(Boolean)
      .join('\n')

    return normalizeDocument({
      title: `${getFileStem(input.fileName)} / ${sheetName}`,
      mimeType: input.mimeType,
      sourceUri: buildSourceUri(input),
      contentText,
      metadata: {
        fileName: input.fileName,
        sheetName,
        parser: 'xlsx'
      }
    })
  })
}

export async function parseUploadedAsset(input: ParseUploadedAssetInput): Promise<NormalizedSourceDocument[]> {
  const assetBuffer = await readTenantAsset(input.assetPath)
  const extension = extname(input.fileName).toLowerCase()

  if (extension === '.csv' || input.mimeType === 'text/csv') {
    return [
      normalizeDocument({
        title: getFileStem(input.fileName),
        mimeType: input.mimeType || 'text/csv',
        sourceUri: buildSourceUri(input),
        contentText: parseCsvText(assetBuffer.toString('utf8')),
        metadata: {
          fileName: input.fileName,
          parser: 'csv'
        }
      })
    ]
  }

  if (extension === '.xlsx' || extension === '.xls') {
    return parseSpreadsheetAsset(input)
  }

  if (extension === '.docx') {
    return parseDocxAsset(input)
  }

  return [
    normalizeDocument({
      title: getFileStem(input.fileName),
      mimeType: input.mimeType || 'text/plain',
      sourceUri: buildSourceUri(input),
      contentText: assetBuffer.toString('utf8'),
      metadata: {
        fileName: input.fileName,
        parser: 'plain-text'
      }
    })
  ]
}
