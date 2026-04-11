import { Buffer } from 'node:buffer'
import type { UploadSourceAssetResponse } from '../../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { DataSourceRecord } from '../../../../../../types'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'

export interface SourceAssetStore {
  save(input: { tenantId: string; fileName: string; contents: Buffer }): Promise<{
    fileName: string
    assetPath: string
    relativePath: string
  }>
}

export class UploadSourceAssetUseCase {
  private readonly repository: KnowledgeIndexingRepository
  private readonly assetStore: SourceAssetStore

  constructor(repository: KnowledgeIndexingRepository, assetStore: SourceAssetStore) {
    this.repository = repository
    this.assetStore = assetStore
  }

  async execute(input: {
    tenantId: string
    sourceId: string
    fileName: string
    mimeType: string
    base64Data: string
  }): Promise<UploadSourceAssetResponse> {
    const current = await this.repository.getDataSourceById(input.sourceId)
    if (!current || current.tenantId !== input.tenantId) {
      throw new Error('Source not found')
    }

    const asset = await this.assetStore.save({
      tenantId: input.tenantId,
      fileName: input.fileName,
      contents: Buffer.from(input.base64Data, 'base64')
    })

    const updated: DataSourceRecord = {
      ...current,
      type: 'file',
      config: {
        ...current.config,
        assetPath: asset.assetPath,
        relativePath: asset.relativePath,
        fileName: asset.fileName,
        mimeType: input.mimeType || 'application/octet-stream'
      },
      updatedAt: Date.now()
    }

    await this.repository.saveDataSource(updated)

    return {
      ok: true,
      item: updated,
      asset
    }
  }
}
